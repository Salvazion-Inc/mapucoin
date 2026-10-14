import { createHmac, timingSafeEqual } from "node:crypto";
import {
  decodeBalance,
  encodeBalanceOf,
  holderQualifies,
  isEthAddress,
} from "./salvazion-premium.ts";

export const PREMIUM_COOKIE = "mapucoin_premium_key";
export const PREMIUM_COOKIE_MAX_AGE = 12 * 60 * 60;

export type VerifyReason =
  | "flag_off"
  | "invalid_wallet"
  | "unconfigured"
  | "not_holder"
  | "holder"
  | "rpc_error";

export type VerifyResult = {
  enabled: boolean;
  premium: boolean;
  reason: VerifyReason;
};

/**
 * Public read of an ERC-20 balance. The wallet is not stored.
 * When the flag is off this returns immediately and does not call `fetch`.
 */
export async function verifyHolder(input: {
  enabled: boolean;
  wallet: string;
  settings: {
    tokenAddress: string;
    rpcUrl: string;
    minRaw: bigint;
    configured: boolean;
  };
  fetchImpl?: typeof fetch;
}): Promise<VerifyResult> {
  if (!input.enabled) {
    return { enabled: false, premium: false, reason: "flag_off" };
  }
  const wallet = input.wallet.trim().slice(0, 80);
  const data = encodeBalanceOf(wallet);
  if (!data || !isEthAddress(wallet)) {
    return { enabled: true, premium: false, reason: "invalid_wallet" };
  }
  if (!input.settings.configured) {
    return { enabled: true, premium: false, reason: "unconfigured" };
  }

  const call = input.fetchImpl ?? fetch;
  try {
    const res = await call(input.settings.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_call",
        params: [{ to: input.settings.tokenAddress, data }, "latest"],
      }),
      signal: AbortSignal.timeout(8000),
      redirect: "error",
    });
    if (!res.ok) return { enabled: true, premium: false, reason: "rpc_error" };
    const json = (await res.json()) as { result?: unknown };
    if (typeof json.result !== "string") {
      return { enabled: true, premium: false, reason: "rpc_error" };
    }
    const balance = decodeBalance(json.result);
    if (balance === null) return { enabled: true, premium: false, reason: "rpc_error" };
    const holder = holderQualifies(balance, input.settings.minRaw);
    return {
      enabled: true,
      premium: holder,
      reason: holder ? "holder" : "not_holder",
    };
  } catch {
    return { enabled: true, premium: false, reason: "rpc_error" };
  }
}

export function signPremiumCookie(secret: string, now = Date.now()): string | null {
  if (!secret) return null;
  const payload = Buffer.from(
    JSON.stringify({ p: 1, exp: now + PREMIUM_COOKIE_MAX_AGE * 1000 }),
    "utf8",
  ).toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

/** True only for an unexpired grant. The cookie never contains a wallet. */
export function readPremiumCookie(
  token: string | null | undefined,
  secret: string,
  now = Date.now(),
): boolean {
  if (!secret || !token || !token.includes(".")) return false;
  const dot = token.indexOf(".");
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!payload || !sig) return false;
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const body = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      p?: number;
      exp?: number;
    };
    return body.p === 1 && typeof body.exp === "number" && body.exp > now;
  } catch {
    return false;
  }
}

export function premiumCookieHeader(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${PREMIUM_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${PREMIUM_COOKIE_MAX_AGE}${secure}`;
}

export function clearPremiumCookieHeader(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${PREMIUM_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
