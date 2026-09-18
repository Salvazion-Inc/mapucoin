import { adminSecretConfigured } from "@/lib/admin";
import { googleConfigured } from "@/lib/google-oauth";
import { platformFeeBps } from "@/lib/partners";
import { getSupabase } from "@/lib/supabase";
import { stripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET() {
  const grok = Boolean(process.env.XAI_API_KEY);
  const stripe = stripeConfigured();
  const db = getSupabase();
  let supabase = false;
  if (db) {
    const { error } = await db.from("bookings").select("id").limit(1);
    supabase = !error || error.code === "PGRST116";
    if (error && /schema cache|does not exist|PGRST205/i.test(error.message)) {
      supabase = false;
    } else if (!error) {
      supabase = true;
    } else {
      supabase = true;
    }
  }

  const google = googleConfigured();
  return Response.json({
    ok: grok && stripe && Boolean(db),
    grok,
    stripe,
    google,
    supabase: Boolean(db),
    supabaseReachable: supabase,
    app: process.env.NEXT_PUBLIC_APP_URL || "",
    platform_fee_bps: platformFeeBps(),
    admin: adminSecretConfigured(),
  });
}
