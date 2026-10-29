import { MP_API, mpEnabled, mpRedirectUri, readOauthState } from "@/lib/mp";
import { mpOrigin } from "@/lib/mp";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

/** Sandbox result page: the outcome stays visible (no client redirect to /#partners). */
function result(status: number, outcome: "linked" | "error", detail: string) {
  const title = outcome === "linked" ? "Mercado Pago vinculado (sandbox)" : "Error al vincular Mercado Pago (sandbox)";
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>${title}</title></head><body style="font-family:system-ui;max-width:40rem;margin:4rem auto;padding:0 1rem"><h1>${title}</h1><p>Resultado: <strong data-mp-oauth="${outcome}">${outcome}</strong></p><p>${detail}</p></body></html>`;
  return new Response(html, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}

/** OAuth redirect_uri: exchanges `code` for the seller token and stores it server-side only. */
export async function GET(req: Request) {
  if (!mpEnabled()) return result(404, "error", "mp_disabled");
  const url = new URL(req.url);
  const code = url.searchParams.get("code") || "";
  const partnerId = readOauthState(
    url.searchParams.get("state") || "",
    process.env.MP_CLIENT_SECRET as string,
  );
  if (!code || !partnerId) return result(400, "error", "state");

  const db = getSupabaseAdmin();
  if (!db) return result(503, "error", "db");

  const origin = mpOrigin(req);
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
    return result(502, "error", "oauth_exchange");
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
    return result(500, "error", "store");
  }
  console.log("mp_oauth_linked", partnerId);
  return result(200, "linked", `Partner ${partnerId} vinculado.`);
}
