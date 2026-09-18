import { CONNECT_COUNTRY } from "@/lib/partners";
import { getSupabase } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

export const runtime = "nodejs";

async function syncConnectAccount(account: Stripe.Account) {
  const db = getSupabase();
  if (!db) return;
  const accountId = account.id;
  if (!accountId) return;

  const patch = {
    charges_enabled: Boolean(account.charges_enabled),
    payouts_enabled: Boolean(account.payouts_enabled),
    details_submitted: Boolean(account.details_submitted),
    connect_country: account.country || CONNECT_COUNTRY,
    connect_blocked: null as string | null,
  };

  const { data } = await db
    .from("partners")
    .select("id")
    .eq("stripe_account_id", accountId)
    .maybeSingle();

  if (data?.id) {
    await db.from("partners").update(patch).eq("id", data.id);
    return;
  }

  const partnerId = account.metadata?.partner_id;
  if (partnerId) {
    await db
      .from("partners")
      .update({ ...patch, stripe_account_id: accountId })
      .eq("id", partnerId);
  }
}

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
    await syncConnectAccount(event.data.object as Stripe.Account);
  }

  return Response.json({ received: true, type: event.type });
}
