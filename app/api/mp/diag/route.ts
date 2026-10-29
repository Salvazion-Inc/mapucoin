import { mpEnabled, mpFetch } from "@/lib/mp";
import { getPartnerById, isTestPartner } from "@/lib/partner-store";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const pick = (o: Record<string, unknown>, keys: string[]) =>
  Object.fromEntries(keys.map((k) => [k, o?.[k] ?? null]));

/**
 * Sandbox-only diagnostics for the is_test partner: preference and payments, no tokens.
 * Preview only (mpEnabled). Remove before any production rollout.
 */
export async function GET(req: Request) {
  if (!mpEnabled()) return Response.json({ error: "mp_disabled" }, { status: 404 });
  const u = new URL(req.url);
  const partnerId = u.searchParams.get("partner_id") || "";
  const prefId = u.searchParams.get("pref_id") || "";
  const db = getSupabaseAdmin();
  const partner = db && partnerId ? await getPartnerById(db, partnerId).catch(() => null) : null;
  if (!db || !isTestPartner(partner)) return Response.json({ error: "partner" }, { status: 404 });
  const { data: acct } = await db
    .from("mp_partner_accounts")
    .select("access_token, mp_user_id, live_mode")
    .eq("partner_id", partnerId)
    .maybeSingle();
  if (!acct?.access_token) return Response.json({ error: "unlinked" }, { status: 409 });
  const token = acct.access_token as string;
  const tokenKind = token.startsWith("TEST-") ? "TEST" : token.startsWith("APP_USR-") ? "APP_USR" : "other";

  const me = await mpFetch("/users/me", token);
  const integ = await mpFetch("/users/me", process.env.MP_ACCESS_TOKEN as string);
  const integKind = String(process.env.MP_ACCESS_TOKEN || "").startsWith("TEST-") ? "TEST" : "APP_USR";
  const out: Record<string, unknown> = {
    integrator: { token_kind: integKind, ...pick(integ.data, ["id", "site_id", "country_id", "tags"]) },
    seller: { mp_user_id: acct.mp_user_id, live_mode: acct.live_mode, token_kind: tokenKind },
    users_me: pick(me.data, ["id", "nickname", "site_id", "country_id", "tags", "user_type", "status"]),
  };
  if (prefId) {
    const pref = await mpFetch(`/checkout/preferences/${encodeURIComponent(prefId)}`, token);
    const d = pref.data;
    out.preference = {
      http: pref.status,
      ...pick(d, ["id", "live_mode", "collector_id", "client_id", "marketplace", "marketplace_fee", "operation_type", "auto_return", "notification_url", "external_reference", "back_urls", "init_point", "sandbox_init_point", "date_created", "binary_mode", "site_id", "purpose"]),
      payer: d?.payer ? { email: (d.payer as { email?: string }).email ?? null } : null,
      items: Array.isArray(d?.items)
        ? (d.items as Record<string, unknown>[]).map((i) => pick(i, ["id", "title", "currency_id", "unit_price", "quantity"]))
        : null,
    };
    const ext = String(d?.external_reference || "");
    const search = await mpFetch(
      `/v1/payments/search?sort=date_created&criteria=desc&limit=20${ext ? `&external_reference=${encodeURIComponent(ext)}` : ""}`,
      token,
    );
    out.payments_by_external_reference = {
      http: search.status,
      results: Array.isArray(search.data.results)
        ? (search.data.results as Record<string, unknown>[]).map((p) =>
            pick(p, ["id", "status", "status_detail", "date_created", "transaction_amount", "currency_id", "payment_method_id", "live_mode", "collector_id", "external_reference", "fee_details"]),
          )
        : search.data,
    };
  }
  const recent = await mpFetch(`/v1/payments/search?sort=date_created&criteria=desc&limit=10&range=date_created&begin_date=NOW-2HOURS&end_date=NOW`, token);
  out.payments_recent = {
    http: recent.status,
    results: Array.isArray(recent.data.results)
      ? (recent.data.results as Record<string, unknown>[]).map((p) =>
          pick(p, ["id", "status", "status_detail", "date_created", "transaction_amount", "external_reference", "live_mode"]),
        )
      : recent.data,
  };
  return Response.json(out, { headers: { "cache-control": "no-store" } });
}
