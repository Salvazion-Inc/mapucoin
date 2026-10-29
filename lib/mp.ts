import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { DEFAULT_FEE_BPS } from "@/lib/partners";

/**
 * Mercado Pago Split 1:1 (Chile), sandbox only.
 * Docs: mercadopago.cl/developers/es/docs/split-payments/split-1-1
 * Production stays on Stripe: mpEnabled() is false when VERCEL_ENV=production.
 */
export const MP_API = "https://api.mercadopago.com";
export const MP_AUTH_URL = "https://auth.mercadopago.cl/authorization";

export function mpEnabled(env: Record<string, string | undefined> = process.env) {
  if (env.VERCEL_ENV === "production") return false;
  return (
    env.PAYMENTS_PROVIDER === "mp" &&
    Boolean(env.MP_ACCESS_TOKEN && env.MP_CLIENT_ID && env.MP_CLIENT_SECRET)
  );
}

/** Marketplace fee in CLP (integer). 12% default; partner keeps the rest. */
export function mpMarketplaceFeeClp(amount: number, bps = DEFAULT_FEE_BPS) {
  const total = Math.round(Number(amount) || 0);
  if (total <= 1) return 0;
  const fee = Math.round((total * bps) / 10000);
  return Math.min(total - 1, Math.max(0, fee));
}

/** Parses `x-signature: ts=...,v1=...`. */
export function parseMpSignature(header: string | null | undefined) {
  let ts = "";
  let v1 = "";
  for (const part of String(header || "").split(",")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    const key = part.slice(0, eq).trim().toLowerCase();
    const value = part.slice(eq + 1).trim();
    if (key === "ts") ts = value;
    else if (key === "v1") v1 = value;
  }
  return { ts, v1 };
}

/** Manifest per MP docs: id:[data.id];request-id:[x-request-id];ts:[ts]; (missing pairs omitted). */
export function mpManifest(dataId: string, requestId: string, ts: string) {
  const parts: string[] = [];
  const id = /^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId;
  if (id) parts.push(`id:${id}`);
  if (requestId) parts.push(`request-id:${requestId}`);
  parts.push(`ts:${ts}`);
  return parts.join(";") + ";";
}

export function verifyMpSignature(opts: {
  xSignature: string | null | undefined;
  xRequestId: string | null | undefined;
  dataId: string | null | undefined;
  secret: string | undefined;
  toleranceSeconds?: number;
  nowMs?: number;
}): boolean {
  const { ts, v1 } = parseMpSignature(opts.xSignature);
  if (!opts.secret || !ts || !v1 || !/^\d+$/.test(ts)) return false;
  const manifest = mpManifest(String(opts.dataId || "").trim(), String(opts.xRequestId || "").trim(), ts);
  const expected = createHmac("sha256", opts.secret).update(manifest).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(v1);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  if (opts.toleranceSeconds !== undefined) {
    const now = opts.nowMs ?? Date.now();
    if (Math.abs(now - Number(ts) * 1000) / 1000 > opts.toleranceSeconds) return false;
  }
  return true;
}

/** OAuth `state`: partner id + nonce, HMAC-signed with the app's client secret. */
export function signOauthState(partnerId: string, secret: string) {
  const nonce = randomBytes(8).toString("hex");
  const payload = `${partnerId}.${nonce}`;
  const mac = createHmac("sha256", secret).update(payload).digest("hex").slice(0, 32);
  return `${payload}.${mac}`;
}

export function readOauthState(state: string, secret: string): string | null {
  const parts = String(state || "").split(".");
  if (parts.length !== 3) return null;
  const [partnerId, nonce, mac] = parts;
  const expected = createHmac("sha256", secret).update(`${partnerId}.${nonce}`).digest("hex").slice(0, 32);
  const a = Buffer.from(expected);
  const b = Buffer.from(mac);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return partnerId || null;
}

export function mpRedirectUri(origin: string) {
  return `${origin.replace(/\/$/, "")}/api/mp/oauth/callback`;
}

export function mpAuthorizationUrl(clientId: string, redirectUri: string, state: string) {
  const u = new URL(MP_AUTH_URL);
  u.searchParams.set("client_id", clientId);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("platform_id", "mp");
  u.searchParams.set("state", state);
  u.searchParams.set("redirect_uri", redirectUri);
  return u.toString();
}

export type MpPreferenceInput = {
  bookingId: string;
  title: string;
  description: string;
  amount: number;
  email: string;
  successUrl: string;
  failureUrl: string;
  notificationUrl: string;
  feeBps?: number;
};

/** Body for POST /checkout/preferences (Checkout Pro), created with the seller's OAuth token. */
export function mpPreferenceBody(input: MpPreferenceInput) {
  const amount = Math.round(input.amount);
  return {
    items: [
      {
        id: input.bookingId,
        title: input.title,
        description: input.description,
        quantity: 1,
        currency_id: "CLP",
        unit_price: amount,
      },
    ],
    payer: { email: input.email },
    external_reference: input.bookingId,
    marketplace_fee: mpMarketplaceFeeClp(amount, input.feeBps),
    notification_url: input.notificationUrl,
    back_urls: {
      success: input.successUrl,
      failure: input.failureUrl,
      pending: input.successUrl,
    },
    auto_return: "approved",
  };
}

export async function mpFetch(path: string, token: string, init: RequestInit = {}) {
  const res = await fetch(`${MP_API}${path}`, {
    ...init,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: res.ok, status: res.status, data };
}

/** Origin of this deployment (Preview URL), not NEXT_PUBLIC_APP_URL, so OAuth/webhooks hit the sandbox. */
export function mpOrigin(req: Request) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  return host ? `${proto}://${host}` : "https://mapucoin.com";
}
