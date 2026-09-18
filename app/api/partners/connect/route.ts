import { adminAuthorized } from "@/lib/admin";
import {
  getPartnerByEmail,
  getPartnerById,
  updatePartner,
  type PartnerRecord,
} from "@/lib/partner-store";
import { clientIp, rateLimit, rateLimitedResponse } from "@/lib/rate-limit";
import { CONNECT_COUNTRY } from "@/lib/partners";
import {
  appOrigin,
  getStripe,
  stripeConfigured,
  stripeErrorCode,
  stripeErrorMessage,
} from "@/lib/stripe";
import { getSupabase } from "@/lib/supabase";
import type Stripe from "stripe";

export const runtime = "nodejs";

function stripeAccountPatch(account: Stripe.Account) {
  return {
    stripe_account_id: account.id,
    charges_enabled: Boolean(account.charges_enabled),
    payouts_enabled: Boolean(account.payouts_enabled),
    details_submitted: Boolean(account.details_submitted),
    connect_country: account.country || CONNECT_COUNTRY,
    connect_blocked: null as string | null,
  };
}

async function loadPartner(
  db: NonNullable<ReturnType<typeof getSupabase>>,
  body: Record<string, unknown>,
  asAdmin: boolean,
): Promise<{ error: "not_found" | "email" | "id" | "ambiguous" | null; partner: PartnerRecord | null }> {
  const id = String(body.id || "").trim();
  const email = String(body.email || "").trim().toLowerCase();

  if (id) {
    const partner = await getPartnerById(db, id);
    if (!partner) return { error: "not_found", partner: null };
    if (!asAdmin) {
      if (!email || email !== String(partner.email || "").toLowerCase()) {
        return { error: "email", partner: null };
      }
    }
    return { error: null, partner };
  }

  if (!email) return { error: "id", partner: null };

  const rows = await getPartnerByEmail(db, email);
  if (!rows.length) return { error: "not_found", partner: null };
  if (rows.length > 1) return { error: "ambiguous", partner: null };
  return { error: null, partner: rows[0] };
}

async function createExpressAccount(
  stripe: Stripe,
  partner: { id: string; email: string; business: string; offer_summary?: string | null },
) {
  return stripe.accounts.create({
    type: "express",
    country: CONNECT_COUNTRY,
    email: partner.email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_profile: {
      name: partner.business,
      product_description: (partner.offer_summary || partner.business).slice(
        0,
        400,
      ),
    },
    metadata: {
      partner_id: partner.id,
      origin: "mapucoin",
    },
  });
}

export async function POST(req: Request) {
  const limited = rateLimit(`partners-connect:${clientIp(req)}`, 8, 10 * 60 * 1000);
  if (!limited.ok) return rateLimitedResponse(limited.retryAfter);

  if (!stripeConfigured()) {
    return Response.json({ error: "stripe_unconfigured" }, { status: 503 });
  }

  const db = getSupabase();
  if (!db) return Response.json({ error: "db" }, { status: 503 });

  const asAdmin = adminAuthorized(req);
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  let loaded: Awaited<ReturnType<typeof loadPartner>>;
  try {
    loaded = await loadPartner(db, body, asAdmin);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "db" },
      { status: 500 },
    );
  }
  if (loaded.error || !loaded.partner) {
    const status =
      loaded.error === "not_found" ? 404 : loaded.error === "ambiguous" ? 409 : 400;
    return Response.json({ error: loaded.error || "id" }, { status });
  }

  const partner = loaded.partner;
  if (partner.status !== "approved") {
    return Response.json({ error: "not_approved" }, { status: 409 });
  }

  const stripe = getStripe();
  const origin = appOrigin(req);

  let accountId = String(partner.stripe_account_id || "");
  if (!accountId) {
    try {
      const account = await createExpressAccount(stripe, {
        id: partner.id,
        email: String(partner.email || ""),
        business: String(partner.business || ""),
        offer_summary: partner.offer_summary,
      });
      accountId = account.id;
      await updatePartner(db, partner.id, stripeAccountPatch(account));
    } catch (err) {
      const reason = [
        stripeErrorCode(err),
        stripeErrorMessage(err),
      ]
        .filter(Boolean)
        .join(": ");
      await updatePartner(db, partner.id, {
        connect_blocked: reason.slice(0, 500) || "connect_blocked",
        connect_country: CONNECT_COUNTRY,
      });
      return Response.json({
        ok: false,
        blocked: true,
        payout_mode: "manual",
        country: CONNECT_COUNTRY,
        reason,
      });
    }
  }

  try {
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/api/partners/connect/refresh?id=${partner.id}`,
      return_url: `${origin}/partners/onboard/return?id=${partner.id}`,
      type: "account_onboarding",
    });
    return Response.json({
      ok: true,
      url: link.url,
      account: accountId,
      payout_mode: "connect",
    });
  } catch (err) {
    const reason = [
      stripeErrorCode(err),
      stripeErrorMessage(err),
    ]
      .filter(Boolean)
      .join(": ");
    await updatePartner(db, partner.id, {
      connect_blocked: reason.slice(0, 500) || "account_link_blocked",
    });
    return Response.json({
      ok: false,
      blocked: true,
      payout_mode: "manual",
      country: CONNECT_COUNTRY,
      reason,
    });
  }
}
