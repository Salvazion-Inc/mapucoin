import { getSupabase } from "@/lib/supabase";
import type Stripe from "stripe";

export type PaidReceipt = {
  ok: true;
  booking_id: string | null;
  amount: number | null;
  currency: string;
  email: string;
  capsule: string;
  nights: string;
  guests: string;
  status: "paid";
  idempotent?: boolean;
};

export async function markBookingPaid(
  session: Stripe.Checkout.Session,
): Promise<PaidReceipt | { ok: false; error: "unpaid" }> {
  if (session.payment_status !== "paid") {
    return { ok: false, error: "unpaid" };
  }

  const bookingId =
    session.client_reference_id || session.metadata?.booking_id || "";
  const fee = Number(session.metadata?.application_fee_clp);
  const mode = String(session.metadata?.payout_mode || "");
  const patch: Record<string, unknown> = {
    status: "paid",
    stripe_payment_intent:
      typeof session.payment_intent === "string" ? session.payment_intent : "",
    stripe_session_id: session.id,
  };
  if (Number.isFinite(fee)) patch.application_fee_clp = fee;
  if (mode) patch.payout_mode = mode;

  const db = getSupabase();
  let idempotent = false;
  if (db) {
    if (bookingId) {
      const { data } = await db
        .from("bookings")
        .select("id, status")
        .eq("id", bookingId)
        .maybeSingle();
      if (data?.status === "paid") {
        idempotent = true;
      } else {
        await db.from("bookings").update(patch).eq("id", bookingId);
      }
    } else if (session.id) {
      await db
        .from("bookings")
        .update(patch)
        .eq("stripe_session_id", session.id)
        .neq("status", "paid");
    }
  }

  const amount =
    typeof session.amount_total === "number" ? session.amount_total : null;

  return {
    ok: true,
    booking_id: bookingId || null,
    amount,
    currency: (session.currency || "clp").toUpperCase(),
    email: String(session.customer_email || session.customer_details?.email || ""),
    capsule: String(session.metadata?.capsule || ""),
    nights: String(session.metadata?.nights || ""),
    guests: String(session.metadata?.guests || ""),
    status: "paid",
    ...(idempotent ? { idempotent: true } : {}),
  };
}
