import { adminAuthorized } from "@/lib/admin";
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

const CONNECT_SELECT =
  "id, email, business, status, offer_summary, stripe_account_id, charges_enabled, payouts_enabled, details_submitted, connect_country, connect_blocked";

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
) {
  const id = String(body.id || "").trim();
  const email = String(body.email || "").trim().toLowerCase();

  if (id) {
    const { data, error } = await db
      .from("partners")
      .select(CONNECT_SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return { error: "not_found" as const, partner: null };
    if (!asAdmin) {
      if (!email || email !== String(data.email || "").toLowerCase()) {
        return { error: "email" as const, partner: null };
      }
    }
    return { error: null, partner: data };
  }

  if (!email) return { error: "id" as const, partner: null };

  const { data, error } = await db
    .from("partners")
    .select(CONNECT_SELECT)
    .eq("email", email)
    .eq("status", "approved")
    .order("approved_at", { ascending: false })
    .limit(2);
  if (error) throw new Error(error.message);
  if (!data?.length) return { error: "not_found" as const, partner: null };
  if (data.length > 1) return { error: "ambiguous" as const, partner: null };
  return { error: null, partner: data[0] };
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
      const account = await createExpressAccount(stripe, partner);
      accountId = account.id;
      const { error } = await db
        .from("partners")
        .update(stripeAccountPatch(account))
        .eq("id", partner.id);
      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
    } catch (err) {
      const reason = [
        stripeErrorCode(err),
        stripeErrorMessage(err),
      ]
        .filter(Boolean)
        .join(": ");
      await db
        .from("partners")
        .update({
          connect_blocked: reason.slice(0, 500) || "connect_blocked",
          connect_country: CONNECT_COUNTRY,
        })
        .eq("id", partner.id);
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
    await db
      .from("partners")
      .update({
        connect_blocked: reason.slice(0, 500) || "account_link_blocked",
      })
      .eq("id", partner.id);
    return Response.json({
      ok: false,
      blocked: true,
      payout_mode: "manual",
      country: CONNECT_COUNTRY,
      reason,
    });
  }
}
