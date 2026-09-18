import { syncStripeAccount } from "@/lib/partner-store";
import { getSupabase } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secrets = [
    process.env.STRIPE_WEBHOOK_SECRET,
    process.env.STRIPE_CONNECT_WEBHOOK_SECRET,
  ].filter((value, i, all): value is string => Boolean(value) && all.indexOf(value) === i);
  if (!secrets.length) {
    return Response.json({ error: "webhook_unconfigured" }, { status: 503 });
  }

  const stripe = getStripe();
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event | null = null;
  for (const secret of secrets) {
    try {
      event = stripe.webhooks.constructEvent(body, sig, secret);
      break;
    } catch {
      /* try next signing secret (platform vs Connect endpoint) */
    }
  }
  if (!event) {
    return Response.json({ error: "signature" }, { status: 400 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== "paid") {
      return Response.json({ received: true, skipped: "unpaid" });
    }
    const bookingId =
      session.client_reference_id || session.metadata?.booking_id;
    const db = getSupabase();
    if (db && bookingId) {
      const fee = Number(session.metadata?.application_fee_clp);
      const mode = String(session.metadata?.payout_mode || "");
      await db
        .from("bookings")
        .update({
          status: "paid",
          stripe_payment_intent:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : "",
          stripe_session_id: session.id,
          ...(Number.isFinite(fee) ? { application_fee_clp: fee } : {}),
          ...(mode ? { payout_mode: mode } : {}),
        })
        .eq("id", bookingId);
    }
  }

  if (event.type === "account.updated") {
    await syncStripeAccount(event.data.object as Stripe.Account);
  }

  return Response.json({ received: true, type: event.type });
}
