import { NextResponse } from "next/server";
import { applyCookies, createRouteSupabase } from "@/lib/supabase-route";
import {
  googleFailUrl,
  parseAuthFrom,
  publicOrigin,
  safeNext,
} from "@/lib/google-oauth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = safeNext(url.searchParams.get("next"));
  const from = parseAuthFrom(url.searchParams.get("from"));
  const origin = publicOrigin(req);
  const pending: Parameters<typeof applyCookies>[1] = [];
  const supabase = createRouteSupabase(req, pending);

  if (!supabase) {
    return NextResponse.redirect(
      googleFailUrl(req, { next, from, reason: "unconfigured" }),
    );
  }

  const redirectTo = new URL("/auth/callback", origin);
  redirectTo.searchParams.set("next", next);
  redirectTo.searchParams.set("from", from);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectTo.toString(),
      skipBrowserRedirect: true,
      queryParams: { prompt: "select_account" },
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(
      googleFailUrl(req, { next, from, reason: "failed" }),
    );
  }

  return applyCookies(NextResponse.redirect(data.url), pending);
}
