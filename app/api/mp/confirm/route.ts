import { mpEnabled } from "@/lib/mp";
import { applyMpPaymentForBooking } from "@/lib/mp-payments";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * Receipt for /reserva/exito?mp=1. Needs the booking id (external_reference) and the
 * payment_id MP appends to the back_url. The payment is validated with the token of the
 * partner that owns the booking (amount, CLP, collector, fee) before it counts as paid.
 */
export async function POST(req: Request) {
  if (!mpEnabled()) return Response.json({ ok: false, error: "mp_disabled" }, { status: 404 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const bookingId = String(body.booking_id || "").trim();
  const paymentId = String(body.payment_id || "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(bookingId) || !/^\d+$/.test(paymentId)) {
    return Response.json({ ok: false, error: "booking" }, { status: 400 });
  }
  const db = getSupabaseAdmin();
  if (!db) return Response.json({ ok: false, error: "db" }, { status: 503 });

  const r = await applyMpPaymentForBooking(db, bookingId, paymentId);
  if (r.status !== "paid" && r.status !== "already_paid") {
    return Response.json({ ok: false, error: r.status === "error" ? "retry" : "unpaid" });
  }
  const { data: b } = await db
    .from("bookings")
    .select("id, amount, email, capsule_slug, nights, guests")
    .eq("id", bookingId)
    .maybeSingle();
  return Response.json({
    ok: true,
    booking_id: bookingId,
    amount: Number(b?.amount) || null,
    currency: "CLP",
    email: String(b?.email || ""),
    capsule: String(b?.capsule_slug || ""),
    nights: b?.nights != null ? String(b.nights) : "",
    guests: b?.guests != null ? String(b.guests) : "",
    status: "paid",
  });
}
