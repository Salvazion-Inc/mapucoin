import { mpFetch } from "@/lib/mp";

/** Minimal DB surface used here (Supabase client in prod, a fake in tests). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Db = { from: (table: string) => any };
export type MpFetch = typeof mpFetch;

export type BookingRow = {
  id: string;
  status: string;
  amount: number | string | null;
  application_fee_clp: number | null;
  partner_id: string | null;
  mp_payment_id?: string | null;
};
export type AccountRow = { partner_id: string; access_token: string; mp_user_id: string | null };

export type CheckResult =
  | { ok: true; fee: number }
  | { ok: false; reason: "not_approved" | "reference" | "amount" | "currency" | "collector" | "fee_mismatch" };

/** Pure validation of an MP payment against our booking and the partner's MP account. */
export function checkMpPayment(
  p: Record<string, unknown>,
  b: BookingRow,
  acct: Pick<AccountRow, "mp_user_id">,
): CheckResult {
  if (p.status !== "approved") return { ok: false, reason: "not_approved" };
  if (String(p.external_reference || "") !== b.id) return { ok: false, reason: "reference" };
  if (Number(p.transaction_amount) !== Number(b.amount)) return { ok: false, reason: "amount" };
  if (p.currency_id !== "CLP") return { ok: false, reason: "currency" };
  if (!acct.mp_user_id || String(p.collector_id) !== String(acct.mp_user_id)) {
    return { ok: false, reason: "collector" };
  }
  const row = Array.isArray(p.fee_details)
    ? (p.fee_details as { type?: string; amount?: number }[]).find((f) => f.type === "application_fee")
    : undefined;
  const fee = Number(row?.amount);
  if (!Number.isFinite(fee) || fee !== Number(b.application_fee_clp)) {
    return { ok: false, reason: "fee_mismatch" };
  }
  return { ok: true, fee };
}

async function loadBooking(db: Db, bookingId: string): Promise<BookingRow | null> {
  const { data } = await db
    .from("bookings")
    .select("id, status, amount, application_fee_clp, partner_id, mp_payment_id")
    .eq("id", bookingId)
    .maybeSingle();
  return (data as BookingRow) || null;
}

async function loadAccount(db: Db, partnerId: string): Promise<AccountRow | null> {
  const { data } = await db
    .from("mp_partner_accounts")
    .select("partner_id, access_token, mp_user_id")
    .eq("partner_id", partnerId)
    .maybeSingle();
  return (data as AccountRow) || null;
}

export type ApplyResult =
  | { status: "paid"; booking: BookingRow }
  | { status: "already_paid"; booking: BookingRow }
  | { status: "rejected"; reason: string; booking?: BookingRow }
  | { status: "error"; reason: string };

/**
 * Reads the payment with the token of the partner that owns the booking
 * (booking.partner_id → mp_partner_accounts), validates it and marks the booking paid.
 */
export async function applyMpPaymentForBooking(
  db: Db,
  bookingId: string,
  paymentId: string,
  fetcher: MpFetch = mpFetch,
): Promise<ApplyResult> {
  const b = await loadBooking(db, bookingId);
  if (!b) return { status: "rejected", reason: "booking" };
  if (b.status === "paid") {
    return String(b.mp_payment_id || "") === paymentId
      ? { status: "already_paid", booking: b }
      : { status: "rejected", reason: "other_payment", booking: b };
  }
  if (!b.partner_id) return { status: "rejected", reason: "no_partner", booking: b };
  const acct = await loadAccount(db, b.partner_id);
  if (!acct?.access_token) return { status: "rejected", reason: "unlinked", booking: b };

  const res = await fetcher(`/v1/payments/${encodeURIComponent(paymentId)}`, acct.access_token);
  if (!res.ok) return { status: "error", reason: `mp_fetch_${res.status}` };
  const check = checkMpPayment(res.data, b, acct);
  if (!check.ok) {
    if (check.reason === "fee_mismatch" || check.reason === "amount" || check.reason === "currency" || check.reason === "collector") {
      console.error("mp_alert", check.reason, JSON.stringify({ booking: b.id, payment: paymentId }));
    }
    return { status: "rejected", reason: check.reason, booking: b };
  }
  const { error } = await db
    .from("bookings")
    .update({ status: "paid", mp_payment_id: paymentId })
    .eq("id", b.id)
    .neq("status", "paid");
  if (error) return { status: "error", reason: "update" };
  return { status: "paid", booking: b };
}

/**
 * Webhook topic=payment. MP only sends the payment id, so the seller is first identified by
 * the notification's user_id (a hint only); the booking found via external_reference must
 * belong to that same partner, and applyMpPaymentForBooking re-reads the payment with the
 * booking's own partner token before marking paid.
 */
export async function handleMpPaymentNotification(
  db: Db,
  paymentId: string,
  sellerUserIdHint: string,
  fetcher: MpFetch = mpFetch,
): Promise<ApplyResult> {
  if (!sellerUserIdHint) return { status: "rejected", reason: "no_seller" };
  const { data: hint } = await db
    .from("mp_partner_accounts")
    .select("partner_id, access_token, mp_user_id")
    .eq("mp_user_id", sellerUserIdHint)
    .maybeSingle();
  if (!hint?.access_token) return { status: "rejected", reason: "unknown_seller" };
  const res = await fetcher(`/v1/payments/${encodeURIComponent(paymentId)}`, hint.access_token as string);
  if (!res.ok) return { status: "error", reason: `mp_fetch_${res.status}` };
  const bookingId = String(res.data.external_reference || "");
  if (!bookingId) return { status: "rejected", reason: "reference" };
  const b = await loadBooking(db, bookingId);
  if (!b) return { status: "rejected", reason: "booking" };
  if (b.partner_id !== hint.partner_id) {
    console.error("mp_alert", "partner_mismatch", JSON.stringify({ booking: b.id, payment: paymentId }));
    return { status: "rejected", reason: "partner_mismatch", booking: b };
  }
  return applyMpPaymentForBooking(db, bookingId, paymentId, fetcher);
}

/**
 * Idempotent processing: skip if the event id is already recorded; record it only after
 * success. On error nothing is recorded, so the caller answers 500 and MP retries.
 */
export async function processMpEvent(
  db: Db,
  eventId: string,
  meta: { topic: string; resourceId: string },
  work: () => Promise<{ retry: boolean }>,
): Promise<{ status: 200 | 500; idempotent?: boolean }> {
  const { data: seen } = await db.from("mp_webhook_events").select("id").eq("id", eventId).maybeSingle();
  if (seen) return { status: 200, idempotent: true };
  let retry = false;
  try {
    retry = (await work()).retry;
  } catch (err) {
    console.error("mp_webhook_work", err instanceof Error ? err.message : "error");
    retry = true;
  }
  if (retry) {
    await db.from("mp_webhook_events").delete().eq("id", eventId);
    return { status: 500 };
  }
  const { error } = await db
    .from("mp_webhook_events")
    .insert({ id: eventId, topic: meta.topic, resource_id: meta.resourceId });
  if (error && error.code !== "23505") {
    console.error("mp_webhook_event", error.message);
    return { status: 500 };
  }
  return { status: 200 };
}
