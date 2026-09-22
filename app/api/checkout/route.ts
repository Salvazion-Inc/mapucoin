import { getBySlug } from "@/lib/catalog";
import { operatorFor } from "@/lib/operators";
import {
  honeypotFilled,
  isEmail,
  isPersonName,
  originAllowed,
  originRejectedResponse,
} from "@/lib/http-guard";
import { findPartnerForCapsule } from "@/lib/partner-store";
import {
  isConnectReady,
  platformFeeBps,
  platformFeeClp,
  type PartnerConnectRow,
} from "@/lib/partners";
import {
  clientIp,
  rateLimit,
  rateLimitedResponse,
} from "@/lib/rate-limit";
import { cookieValue, readSession, SESSION_COOKIE } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import {
  appOrigin,
  getStripe,
  stripeConfigured,
  stripeErrorMessage,
} from "@/lib/stripe";
import type Stripe from "stripe";

export const runtime = "nodejs";

async function partnerForCheckout(
  db: NonNullable<ReturnType<typeof getSupabase>>,
  slug: string,
  partnerId: string,
): Promise<PartnerConnectRow | null> {
  try {
    return await findPartnerForCapsule(db, slug, partnerId);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  if (!originAllowed(req)) return originRejectedResponse();

  const limited = rateLimit(`checkout:${clientIp(req)}`, 8, 10 * 60 * 1000);
  if (!limited.ok) return rateLimitedResponse(limited.retryAfter);

  if (!stripeConfigured()) {
    return Response.json({ error: "stripe_unconfigured" }, { status: 503 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (honeypotFilled(body)) {
    return Response.json({ error: "profile" }, { status: 400 });
  }

  if (Array.isArray(body.items)) {
    return payTrip(req, body);
  }

  const slug = String(body.capsula || body.slug || "");
  const item = getBySlug(slug);
  if (!item || item.kind !== "capsule") {
    return Response.json({ error: "capsule" }, { status: 400 });
  }

  const nights = Math.min(21, Math.max(1, Number(body.nights) || 1));
  const guests = Math.min(8, Math.max(1, Number(body.guests) || 2));
  const email = String(body.email || "").trim().toLowerCase();
  const fullName = String(body.full_name || "").trim();
  if (!isPersonName(fullName) || !isEmail(email)) {
    return Response.json({ error: "profile" }, { status: 400 });
  }

  const amount = item.priceFromCLP * nights;
  const bookingId = crypto.randomUUID();
  const originUrl = appOrigin(req);
  const stripe = getStripe();
  const fromApp = String(body.source || "") === "app";
  const sessionUser = await readSession(
    cookieValue(req.headers.get("cookie"), SESSION_COOKIE),
  );

  const db = getSupabase();
  const feeBps = platformFeeBps();
  let partner: PartnerConnectRow | null = null;
  if (db) {
    partner = await partnerForCheckout(
      db,
      item.slug,
      String(body.partner_id || "").trim(),
    );
  }

  const applicationFee = partner ? platformFeeClp(amount, feeBps) : 0;
  const connectReady = isConnectReady(partner);
  let payoutMode: "connect" | "manual" | "platform" = partner
    ? connectReady
      ? "connect"
      : "manual"
    : "platform";
  const destination =
    payoutMode === "connect" ? String(partner?.stripe_account_id || "") : "";
  const partnerPayout = partner ? amount - applicationFee : 0;

  if (db) {
    const row = {
      id: bookingId,
      full_name: fullName,
      email,
      phone: String(body.phone || "").trim().slice(0, 40),
      yacht_slug: item.slug,
      capsule_slug: item.slug,
      user_id: sessionUser?.id || null,
      origin: "mapucoin",
      destination: item.city,
      guests,
      nights,
      amount,
      status: "checkout",
      partner_id: partner?.id || null,
      stripe_account_id: destination || null,
      application_fee_clp: applicationFee || null,
      partner_payout_clp: partnerPayout || null,
      payout_mode: payoutMode,
      fee_bps: partner ? feeBps : null,
      notes: JSON.stringify({
        source: fromApp ? "mapucoin-app" : "mapucoin",
        capsule: item.slug,
        nights,
        guests,
        payout_mode: payoutMode,
        application_fee_clp: applicationFee,
        fee_bps: feeBps,
      }),
    };
    const { error } = await db.from("bookings").insert(row);
    if (error) {
      const { error: fallback } = await db.from("bookings").insert({
        id: bookingId,
        full_name: fullName,
        email,
        phone: String(body.phone || "").trim().slice(0, 40),
        capsule_slug: item.slug,
        nights,
        guests,
        amount,
        status: "checkout",
      });
      if (fallback) console.error("booking_insert", error.message, fallback.message);
    }
  }

  const metadata: Stripe.MetadataParam = {
    booking_id: bookingId,
    capsule: item.slug,
    nights: String(nights),
    guests: String(guests),
    user_id: sessionUser?.id || "",
    source: fromApp ? "app" : "web",
    partner_id: partner?.id || "",
    payout_mode: payoutMode,
    application_fee_clp: String(applicationFee),
    fee_bps: String(feeBps),
  };

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    customer_email: email,
    client_reference_id: bookingId,
    success_url: fromApp
      ? `${originUrl}/app/viaje?paid=1&session_id={CHECKOUT_SESSION_ID}`
      : `${originUrl}/reserva/exito?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: fromApp
      ? `${originUrl}/app/capsulas?cancel=1`
      : `${originUrl}/capsulas/${item.slug}?cancel=1`,
    integration_identifier: `mapucoin_capsule_${crypto.randomUUID().slice(0, 8)}`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "clp",
          unit_amount: amount,
          product_data: {
            name: `${item.name} · ${nights} noche${nights > 1 ? "s" : ""}`,
            description: `${item.city} · ${guests} viajero${guests > 1 ? "s" : ""}`,
          },
        },
      },
    ],
    metadata,
  };

  if (payoutMode === "connect" && destination && applicationFee > 0) {
    sessionParams.payment_intent_data = {
      application_fee_amount: applicationFee,
      transfer_data: { destination },
    };
  }

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create(sessionParams);
  } catch (err) {
    if (payoutMode === "connect") {
      console.error("checkout_connect_fallback", stripeErrorMessage(err));
      payoutMode = "manual";
      metadata.payout_mode = "manual";
      delete sessionParams.payment_intent_data;
      sessionParams.metadata = metadata;
      session = await stripe.checkout.sessions.create(sessionParams);
      if (db) {
        await db
          .from("bookings")
          .update({
            payout_mode: "manual",
            stripe_account_id: null,
          })
          .eq("id", bookingId);
      }
    } else {
      throw err;
    }
  }

  if (db) {
    await db
      .from("bookings")
      .update({ stripe_session_id: session.id, payout_mode: payoutMode })
      .eq("id", bookingId);
  }

  return Response.json({
    id: bookingId,
    url: session.url,
    amount,
    payout_mode: payoutMode,
  });
}

async function payTrip(req: Request, body: Record<string, unknown>) {
  const email = String(body.email || "").trim().toLowerCase();
  const fullName = String(body.full_name || "").trim();
  if (!isPersonName(fullName) || !isEmail(email)) {
    return Response.json({ error: "profile" }, { status: 400 });
  }

  const requested = (body.items as unknown[]).slice(0, 24);
  const lines = requested
    .map((raw) => {
      const row = raw as { slug?: string; type?: string };
      const cat = getBySlug(String(row.slug || ""));
      const type = String(row.type || "");
      const kind =
        type === "stay" ? "capsule" : type === "food" ? "food" : type === "activity" ? "activity" : "";
      if (!cat || !kind || cat.kind !== kind || cat.priceFromCLP <= 0) return null;
      return { slug: cat.slug, type, name: cat.name, city: cat.city, amount: cat.priceFromCLP };
    })
    .filter((line): line is NonNullable<typeof line> => Boolean(line));

  if (!lines.length) {
    return Response.json({ error: "empty" }, { status: 400 });
  }

  const guests = Math.min(8, Math.max(1, Number(body.guests) || 1));
  const nights = lines.filter((line) => line.type === "stay").length || 1;
  const amount = lines.reduce((sum, line) => sum + line.amount, 0);
  const feeBps = platformFeeBps();
  const applicationFee = platformFeeClp(amount, feeBps);
  const partnerPayout = amount - applicationFee;
  const bookingId = crypto.randomUUID();
  const originUrl = appOrigin(req);
  const stripe = getStripe();
  const fromApp = String(body.source || "") === "app";
  const sessionUser = await readSession(
    cookieValue(req.headers.get("cookie"), SESSION_COOKIE),
  );
  const db = getSupabase();
  const staySlug = lines.find((line) => line.type === "stay")?.slug || lines[0].slug;

  let partner: PartnerConnectRow | null = null;
  if (db) {
    partner = await partnerForCheckout(db, staySlug, "");
  }
  const sameStay =
    lines.every((line) => line.type === "stay" && line.slug === staySlug);
  const connectReady = sameStay && isConnectReady(partner);
  let payoutMode: "connect" | "manual" = connectReady ? "connect" : "manual";
  const destination =
    payoutMode === "connect" ? String(partner?.stripe_account_id || "") : "";

  const splits = lines.map((line) => {
    const operator = operatorFor(line.slug);
    const fee = platformFeeClp(line.amount, feeBps);
    return {
      slug: line.slug,
      type: line.type,
      name: line.name,
      provider: operator?.name || partner?.id || line.name,
      amount: line.amount,
      fee,
      payout: line.amount - fee,
    };
  });

  if (db) {
    const row = {
      id: bookingId,
      full_name: fullName,
      email,
      phone: String(body.phone || "").trim().slice(0, 40),
      yacht_slug: staySlug,
      capsule_slug: staySlug,
      user_id: sessionUser?.id || null,
      origin: "mapucoin",
      destination: lines[0].city,
      guests,
      nights,
      amount,
      status: "checkout",
      partner_id: partner?.id || null,
      stripe_account_id: destination || null,
      application_fee_clp: applicationFee,
      partner_payout_clp: partnerPayout,
      payout_mode: payoutMode,
      fee_bps: feeBps,
      notes: JSON.stringify({
        source: fromApp ? "mapucoin-app-trip" : "mapucoin-trip",
        fee_bps: feeBps,
        application_fee_clp: applicationFee,
        payout_mode: payoutMode,
        lines: splits,
      }),
    };
    const { error } = await db.from("bookings").insert(row);
    if (error) {
      await db.from("bookings").insert({
        id: bookingId,
        full_name: fullName,
        email,
        capsule_slug: staySlug,
        nights,
        guests,
        amount,
        status: "checkout",
      });
    }
  }

  const metadata: Stripe.MetadataParam = {
    booking_id: bookingId,
    capsule: staySlug,
    nights: String(nights),
    guests: String(guests),
    user_id: sessionUser?.id || "",
    source: fromApp ? "app" : "web",
    partner_id: partner?.id || "",
    payout_mode: payoutMode,
    application_fee_clp: String(applicationFee),
    fee_bps: String(feeBps),
  };

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    customer_email: email,
    client_reference_id: bookingId,
    success_url: fromApp
      ? `${originUrl}/app/viaje?paid=1&session_id={CHECKOUT_SESSION_ID}`
      : `${originUrl}/reserva/exito?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: fromApp ? `${originUrl}/app/viaje?cancel=1` : `${originUrl}/#planificar`,
    integration_identifier: `mapucoin_trip_${crypto.randomUUID().slice(0, 8)}`,
    line_items: lines.map((line) => ({
      quantity: 1,
      price_data: {
        currency: "clp",
        unit_amount: line.amount,
        product_data: {
          name: line.name,
          description: line.city,
        },
      },
    })),
    metadata,
  };

  if (payoutMode === "connect" && destination && applicationFee > 0) {
    sessionParams.payment_intent_data = {
      application_fee_amount: applicationFee,
      transfer_data: { destination },
    };
  }

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create(sessionParams);
  } catch (err) {
    if (payoutMode === "connect") {
      console.error("checkout_connect_fallback", stripeErrorMessage(err));
      payoutMode = "manual";
      metadata.payout_mode = "manual";
      delete sessionParams.payment_intent_data;
      sessionParams.metadata = metadata;
      session = await stripe.checkout.sessions.create(sessionParams);
    } else {
      throw err;
    }
  }

  if (db) {
    await db
      .from("bookings")
      .update({ stripe_session_id: session.id, payout_mode: payoutMode })
      .eq("id", bookingId);
  }

  return Response.json({
    id: bookingId,
    url: session.url,
    amount,
    application_fee_clp: applicationFee,
    partner_payout_clp: partnerPayout,
    payout_mode: payoutMode,
  });
}
