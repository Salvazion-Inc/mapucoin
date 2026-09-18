import { getSupabase } from "@/lib/supabase";
import { getStripe, stripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function markPaid(sessionId: string) {
  if (!stripeConfigured() || !sessionId.startsWith("cs_")) {
    return { ok: false as const, error: "session" };
  }
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    return { ok: false as const, error: "unpaid" };
  }
  const bookingId = session.client_reference_id || session.metadata?.booking_id;
  const db = getSupabase();
  if (db && bookingId) {
    const fee = Number(session.metadata?.application_fee_clp);
    const mode = String(session.metadata?.payout_mode || "");
    await db
      .from("bookings")
      .update({
        status: "paid",
        stripe_payment_intent:
          typeof session.payment_intent === "string" ? session.payment_intent : "",
        stripe_session_id: session.id,
        ...(Number.isFinite(fee) ? { application_fee_clp: fee } : {}),
        ...(mode ? { payout_mode: mode } : {}),
      })
      .eq("id", bookingId);
  }
  return { ok: true as const, booking_id: bookingId || null };
}

export async function GET(req: Request) {
  const sessionId = new URL(req.url).searchParams.get("session_id") || "";
  try {
    const result = await markPaid(sessionId);
    return Response.json(result, { status: result.ok ? 200 : 400 });
  } catch {
    return Response.json({ ok: false, error: "stripe" }, { status: 502 });
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const sessionId = String(body.session_id || "");
  try {
    const result = await markPaid(sessionId);
    return Response.json(result, { status: result.ok ? 200 : 400 });
  } catch {
    return Response.json({ ok: false, error: "stripe" }, { status: 502 });
  }
}
