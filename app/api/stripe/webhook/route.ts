import { getSupabase } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return Response.json({ error: "webhook_unconfigured" }, { status: 503 });
  }

  const stripe = getStripe();
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
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
      await db
        .from("bookings")
        .update({
          status: "paid",
          stripe_payment_intent:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : "",
          stripe_session_id: session.id,
        })
        .eq("id", bookingId);
    }
  }

  return Response.json({ received: true });
}
