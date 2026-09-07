import { getBySlug } from "@/lib/catalog";
import { getSupabase } from "@/lib/supabase";
import { appOrigin, getStripe, stripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!stripeConfigured()) {
    return Response.json({ error: "stripe_unconfigured" }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const slug = String(body.capsula || body.slug || "");
  const item = getBySlug(slug);
  if (!item || item.kind !== "capsule") {
    return Response.json({ error: "capsule" }, { status: 400 });
  }

  const nights = Math.min(21, Math.max(1, Number(body.nights) || 1));
  const guests = Math.min(8, Math.max(1, Number(body.guests) || 2));
  const email = String(body.email || "").trim();
  const fullName = String(body.full_name || "").trim();
  if (!email || !fullName) {
    return Response.json({ error: "profile" }, { status: 400 });
  }

  const amount = item.priceFromCLP * nights;
  const bookingId = crypto.randomUUID();
  const originUrl = appOrigin(req);
  const stripe = getStripe();

  const db = getSupabase();
  if (db) {
    await db.from("bookings").insert({
      id: bookingId,
      full_name: fullName,
      email,
      phone: String(body.phone || ""),
      capsule_slug: item.slug,
      nights,
      guests,
      amount,
      status: "checkout",
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    client_reference_id: bookingId,
    success_url: `${originUrl}/reserva/exito?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${originUrl}/reserva?capsula=${item.slug}&cancel=1`,
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
    metadata: {
      booking_id: bookingId,
      capsule: item.slug,
      nights: String(nights),
      guests: String(guests),
    },
  });

  if (db) {
    await db
      .from("bookings")
      .update({ stripe_session_id: session.id })
      .eq("id", bookingId);
  }

  return Response.json({
    id: bookingId,
    url: session.url,
    amount,
  });
}
