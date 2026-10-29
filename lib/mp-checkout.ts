import { getBySlug } from "@/lib/catalog";
import { isEmail, isPersonName } from "@/lib/http-guard";
import { mpFetch, mpMarketplaceFeeClp, mpPreferenceBody } from "@/lib/mp";
import { mpOrigin } from "@/lib/mp";
import { findPartnerForCapsule, isTestPartner } from "@/lib/partner-store";
import { platformFeeBps } from "@/lib/partners";
import { cookieValue, readSession, SESSION_COOKIE } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";

/** Hidden sandbox capsule: only reachable with an is_test partner, never in the catalog. */
export const MP_TEST_CAPSULE = {
  slug: "mp-sandbox-capsula-prueba",
  kind: "capsule" as const,
  name: "Cápsula Prueba MP (sandbox)",
  city: "Sandbox",
  priceFromCLP: 10000,
};

/** Capsule checkout through Mercado Pago Checkout Pro with marketplace_fee (Split 1:1). */
export async function mpCheckout(req: Request, body: Record<string, unknown>) {
  if (Array.isArray(body.items)) {
    return Response.json({ error: "mp_trip_unsupported" }, { status: 400 });
  }
  const requestedSlug = String(body.capsula || body.slug || "");
  const db = getSupabaseAdmin();
  if (!db) return Response.json({ error: "db" }, { status: 503 });
  const partner = await findPartnerForCapsule(db, requestedSlug, String(body.partner_id || "").trim(), {
    allowTest: true,
  }).catch(() => null);
  const item =
    requestedSlug === MP_TEST_CAPSULE.slug && isTestPartner(partner)
      ? MP_TEST_CAPSULE
      : getBySlug(requestedSlug);
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

  if (!partner) return Response.json({ error: "mp_no_partner" }, { status: 409 });
  const { data: account } = await db
    .from("mp_partner_accounts")
    .select("access_token")
    .eq("partner_id", partner.id)
    .maybeSingle();
  if (!account?.access_token) {
    return Response.json({ error: "mp_partner_unlinked" }, { status: 409 });
  }

  const amount = item.priceFromCLP * nights;
  const feeBps = platformFeeBps();
  const fee = mpMarketplaceFeeClp(amount, feeBps);
  const bookingId = crypto.randomUUID();
  const origin = mpOrigin(req);
  const fromApp = String(body.source || "") === "app";
  const sessionUser = await readSession(cookieValue(req.headers.get("cookie"), SESSION_COOKIE));

  const { error: insertError } = await db.from("bookings").insert({
    id: bookingId,
    full_name: fullName,
    email,
    phone: String(body.phone || "").trim().slice(0, 40),
    capsule_slug: item.slug,
    user_id: sessionUser?.id || null,
    origin: "mapucoin",
    destination: item.city,
    guests,
    nights,
    amount,
    status: "checkout",
    partner_id: partner.id,
    application_fee_clp: fee,
    partner_payout_clp: amount - fee,
    payout_mode: "mp_split",
    fee_bps: feeBps,
    notes: JSON.stringify({ provider: "mp", capsule: item.slug, nights, guests, fee_bps: feeBps }),
  });
  if (insertError) console.error("mp_booking_insert", insertError.message);

  const pref = mpPreferenceBody({
    bookingId,
    title: `${item.name} · ${nights} noche${nights > 1 ? "s" : ""}`,
    description: `${item.city} · ${guests} viajero${guests > 1 ? "s" : ""}`,
    amount,
    feeBps,
    successUrl: fromApp ? `${origin}/app/viaje?paid=1&mp=1` : `${origin}/reserva/exito?mp=1`,
    failureUrl: fromApp ? `${origin}/app/capsulas?cancel=1` : `${origin}/capsulas/${item.slug}?cancel=1`,
    notificationUrl: `${origin}/api/mp/webhook`,
  });
  const res = await mpFetch("/checkout/preferences", account.access_token as string, {
    method: "POST",
    body: JSON.stringify(pref),
  });
  if (!res.ok || typeof res.data.id !== "string") {
    console.error("mp_preference", res.status, String(res.data.message || ""));
    return Response.json({ error: "mp_preference" }, { status: 502 });
  }
  await db.from("bookings").update({ mp_preference_id: res.data.id }).eq("id", bookingId);
  return Response.json({
    id: bookingId,
    url: String(res.data.init_point || ""),
    amount,
    marketplace_fee: fee,
    payout_mode: "mp_split",
  });
}
