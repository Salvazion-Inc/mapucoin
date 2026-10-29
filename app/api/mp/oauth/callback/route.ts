import { MP_API, mpEnabled, mpRedirectUri, readOauthState } from "@/lib/mp";
import { appOrigin } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

/** OAuth redirect_uri: exchanges `code` for the seller token and stores it server-side only. */
export async function GET(req: Request) {
  if (!mpEnabled()) return Response.json({ error: "mp_disabled" }, { status: 404 });
  const url = new URL(req.url);
  const code = url.searchParams.get("code") || "";
  const partnerId = readOauthState(
    url.searchParams.get("state") || "",
    process.env.MP_CLIENT_SECRET as string,
  );
  if (!code || !partnerId) return Response.json({ error: "state" }, { status: 400 });

  const db = getSupabaseAdmin();
  if (!db) return Response.json({ error: "db" }, { status: 503 });

  const origin = appOrigin(req);
  const form = new URLSearchParams({
    client_id: process.env.MP_CLIENT_ID as string,
    client_secret: process.env.MP_CLIENT_SECRET as string,
    grant_type: "authorization_code",
    code,
    redirect_uri: mpRedirectUri(origin),
  });
  const res = await fetch(`${MP_API}/oauth/token`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || typeof data.access_token !== "string") {
    console.error("mp_oauth_exchange", res.status, String(data.error || data.message || ""));
    return Response.json({ error: "oauth_exchange" }, { status: 502 });
  }

  const expiresIn = Number(data.expires_in);
  const { error } = await db.from("mp_partner_accounts").upsert({
    partner_id: partnerId,
    mp_user_id: data.user_id != null ? String(data.user_id) : null,
    access_token: data.access_token,
    refresh_token: typeof data.refresh_token === "string" ? data.refresh_token : null,
    public_key: typeof data.public_key === "string" ? data.public_key : null,
    live_mode: typeof data.live_mode === "boolean" ? data.live_mode : null,
    expires_at: Number.isFinite(expiresIn)
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    console.error("mp_oauth_store", error.message);
    return Response.json({ error: "store" }, { status: 500 });
  }
  return Response.redirect(`${origin}/partners?mp=linked`, 302);
}
