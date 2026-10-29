import { adminAuthorized } from "@/lib/admin";
import { mpAuthorizationUrl, mpEnabled, mpRedirectUri, signOauthState } from "@/lib/mp";
import { getPartnerById, isTestPartner } from "@/lib/partner-store";
import { appOrigin } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireVerifiedAccount } from "@/lib/verified-access";

export const runtime = "nodejs";

/** Sends an approved partner to Mercado Pago to authorize Mapucoin (OAuth, Split 1:1). */
export async function GET(req: Request) {
  if (!mpEnabled()) return Response.json({ error: "mp_disabled" }, { status: 404 });
  const partnerId = new URL(req.url).searchParams.get("partner_id") || "";
  const db = getSupabaseAdmin();
  if (!db || !partnerId) return Response.json({ error: "partner" }, { status: 400 });
  const partner = await getPartnerById(db, partnerId).catch(() => null);
  const testPartner = isTestPartner(partner);
  if (!partner || (partner.status !== "approved" && !testPartner)) {
    return Response.json({ error: "partner" }, { status: 404 });
  }
  // Sandbox test partner (is_test, Preview only via mpEnabled): no Mapucoin session needed,
  // the MP test seller login is the gate. Real partners need their verified account or admin.
  if (!testPartner && !adminAuthorized(req)) {
    const gate = await requireVerifiedAccount(req);
    if (!gate.ok) return gate.response;
    if (gate.user.email.toLowerCase() !== String(partner.email || "").toLowerCase()) {
      return Response.json({ error: "forbidden" }, { status: 403 });
    }
  }
  const state = signOauthState(partner.id, process.env.MP_CLIENT_SECRET as string);
  const url = mpAuthorizationUrl(
    process.env.MP_CLIENT_ID as string,
    mpRedirectUri(appOrigin(req)),
    state,
  );
  return Response.redirect(url, 302);
}
