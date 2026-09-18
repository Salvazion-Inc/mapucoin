import { CONNECT_COUNTRY } from "@/lib/partners";
import { appOrigin, getStripe, stripeConfigured } from "@/lib/stripe";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!stripeConfigured()) {
    return Response.json({ error: "stripe_unconfigured" }, { status: 503 });
  }

  const id = new URL(req.url).searchParams.get("id") || "";
  if (!id) return Response.json({ error: "id" }, { status: 400 });

  const db = getSupabase();
  if (!db) return Response.json({ error: "db" }, { status: 503 });

  const { data: partner } = await db
    .from("partners")
    .select("id, stripe_account_id, status")
    .eq("id", id)
    .maybeSingle();
  if (!partner?.stripe_account_id || partner.status !== "approved") {
    return Response.redirect(
      `${appOrigin(req)}/partners/onboard?id=${encodeURIComponent(id)}&error=account`,
      302,
    );
  }

  const stripe = getStripe();
  const origin = appOrigin(req);
  try {
    const link = await stripe.accountLinks.create({
      account: partner.stripe_account_id,
      refresh_url: `${origin}/api/partners/connect/refresh?id=${partner.id}`,
      return_url: `${origin}/partners/onboard/return?id=${partner.id}`,
      type: "account_onboarding",
    });
    return Response.redirect(link.url, 302);
  } catch {
    await db
      .from("partners")
      .update({
        connect_blocked: "account_link_refresh_failed",
        connect_country: CONNECT_COUNTRY,
      })
      .eq("id", partner.id);
    return Response.redirect(
      `${origin}/partners/onboard?id=${encodeURIComponent(id)}&error=link`,
      302,
    );
  }
}
