import { mpEnabled, mpFetch } from "@/lib/mp";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * Receipt for /reserva/exito?mp=1. Needs the booking id (external_reference) and the
 * payment_id MP appends to the back_url; both must match. If the webhook has not landed yet,
 * the payment is read from MP with the partner token (server-side only).
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
  const { data: b } = await db
    .from("bookings")
    .select("id, status, amount, email, capsule_slug, nights, guests, partner_id, mp_payment_id")
    .eq("id", bookingId)
    .maybeSingle();
  if (!b) return Response.json({ ok: false, error: "booking" }, { status: 404 });

  let paid = b.status === "paid" && String(b.mp_payment_id || "") === paymentId;
  if (!paid && b.status !== "paid" && b.partner_id) {
    const { data: acct } = await db
      .from("mp_partner_accounts")
      .select("access_token")
      .eq("partner_id", b.partner_id)
      .maybeSingle();
    if (acct?.access_token) {
      const res = await mpFetch(`/v1/payments/${paymentId}`, acct.access_token as string);
      const p = res.data;
      if (res.ok && p.status === "approved" && String(p.external_reference || "") === bookingId) {
        await db
          .from("bookings")
          .update({ status: "paid", mp_payment_id: paymentId })
          .eq("id", bookingId)
          .neq("status", "paid");
        paid = true;
      }
    }
  }
  if (!paid) return Response.json({ ok: false, error: "unpaid" });
  return Response.json({
    ok: true,
    booking_id: b.id,
    amount: Number(b.amount) || null,
    currency: "CLP",
    email: String(b.email || ""),
    capsule: String(b.capsule_slug || ""),
    nights: b.nights != null ? String(b.nights) : "",
    guests: b.guests != null ? String(b.guests) : "",
    status: "paid",
  });
}
