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
  let dbError = "";
  if (db) {
    const { error } = await db.from("bookings").select("id").limit(1);
    supabase = !error;
    if (error) dbError = error.code || "error";
  }

  const google = googleConfigured();
  const ok = grok && stripe && Boolean(db) && supabase;
  return Response.json({
    ok,
    grok,
    stripe,
    google,
    supabase: Boolean(db),
    supabaseReachable: supabase,
    app: process.env.NEXT_PUBLIC_APP_URL || "",
    platform_fee_bps: platformFeeBps(),
    admin: adminSecretConfigured(),
    ...(dbError ? { supabaseError: dbError } : {}),
  }, { status: db && !supabase ? 500 : 200 });
}
