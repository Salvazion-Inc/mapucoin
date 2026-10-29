import { mpEnabled } from "@/lib/mp";
import { MP_TEST_CAPSULE, mpCheckout } from "@/lib/mp-checkout";
import { getPartnerById, isTestPartner } from "@/lib/partner-store";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireVerifiedAccount } from "@/lib/verified-access";

export const runtime = "nodejs";

/**
 * Sandbox only: one-click checkout of the hidden test capsule with the is_test partner.
 * Creates the MP preference and redirects to its init_point.
 */
export async function GET(req: Request) {
  if (!mpEnabled()) return Response.json({ error: "mp_disabled" }, { status: 404 });
  const gate = await requireVerifiedAccount(req);
  if (!gate.ok) return gate.response;
  const partnerId = new URL(req.url).searchParams.get("partner_id") || "";
  const db = getSupabaseAdmin();
  const partner = db && partnerId ? await getPartnerById(db, partnerId).catch(() => null) : null;
  if (!isTestPartner(partner)) return Response.json({ error: "partner" }, { status: 404 });

  const res = await mpCheckout(req, {
    capsula: MP_TEST_CAPSULE.slug,
    partner_id: partnerId,
    nights: 1,
    guests: 1,
    email: gate.user.email,
    full_name: "Comprador Prueba",
  });
  const data = (await res.clone().json().catch(() => ({}))) as { url?: string };
  if (res.ok && data.url) return Response.redirect(data.url, 302);
  return res;
}
