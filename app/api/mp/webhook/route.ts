import { mpEnabled, mpFetch, verifyMpSignature } from "@/lib/mp";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * Mercado Pago notifications (topics payment and merchant_order).
 * Signature: x-signature (ts, v1) + x-request-id + data.id, HMAC-SHA256 with MP_WEBHOOK_SECRET.
 * Idempotent: each x-request-id is stored once; bookings already paid are not touched again.
 */
export async function POST(req: Request) {
  if (!mpEnabled()) return Response.json({ error: "mp_disabled" }, { status: 404 });
  const url = new URL(req.url);
  const raw = await req.text();
  const body = (() => {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {} as Record<string, unknown>;
    }
  })();
  const dataId =
    url.searchParams.get("data.id") ||
    url.searchParams.get("id") ||
    String((body.data as { id?: unknown } | undefined)?.id ?? "");
  const topic = String(
    url.searchParams.get("type") || url.searchParams.get("topic") || body.type || body.topic || "",
  );
  const requestId = req.headers.get("x-request-id") || "";

  const valid = verifyMpSignature({
    xSignature: req.headers.get("x-signature"),
    xRequestId: requestId,
    dataId,
    secret: process.env.MP_WEBHOOK_SECRET,
  });
  if (!valid) return Response.json({ error: "signature" }, { status: 401 });

  const db = getSupabaseAdmin();
  if (!db) return Response.json({ ok: true, stored: false });

  const eventId = requestId || `${topic}:${dataId}:${String(body.action || "")}`;
  const { error: dup } = await db
    .from("mp_webhook_events")
    .insert({ id: eventId, topic, resource_id: dataId });
  if (dup) {
    if (dup.code === "23505") return Response.json({ ok: true, idempotent: true });
    console.error("mp_webhook_event", dup.message);
  }

  if (topic === "payment" && dataId) {
    await handlePayment(db, dataId, String(body.user_id ?? ""));
  } else if ((topic === "merchant_order" || topic === "topic_merchant_order_wh") && dataId) {
    // Merchant orders are logged; payment status is taken from the payment topic.
  }
  return Response.json({ ok: true });
}

async function handlePayment(
  db: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  paymentId: string,
  sellerUserId: string,
) {
  let token = process.env.MP_ACCESS_TOKEN as string;
  if (sellerUserId) {
    const { data } = await db
      .from("mp_partner_accounts")
      .select("access_token")
      .eq("mp_user_id", sellerUserId)
      .maybeSingle();
    if (data?.access_token) token = data.access_token as string;
  }
  const res = await mpFetch(`/v1/payments/${encodeURIComponent(paymentId)}`, token);
  if (!res.ok) {
    console.error("mp_payment_fetch", res.status);
    return;
  }
  const p = res.data;
  const bookingId = String(p.external_reference || "");
  if (!bookingId || p.status !== "approved") return;
  const feeRow = Array.isArray(p.fee_details)
    ? (p.fee_details as { type?: string; amount?: number }[]).find((f) => f.type === "application_fee")
    : undefined;
  const fee = Number(feeRow?.amount);
  const patch: Record<string, unknown> = {
    status: "paid",
    mp_payment_id: String(p.id ?? paymentId),
  };
  if (Number.isFinite(fee)) patch.application_fee_clp = fee;
  await db.from("bookings").update(patch).eq("id", bookingId).neq("status", "paid");
}
