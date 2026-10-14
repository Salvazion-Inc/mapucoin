/**
 * $SALVAZION is an access key for Mapucoin Premium (MTP v1.1.0 Constraint 7).
 * It is not priced, not stored, and not treated as an investment.
 * The flag defaults off: an unset or unrecognized value never grants Premium.
 */

const ENABLED = new Set(["1", "true", "yes", "on"]);

export function isSalvazionPremiumKeyEnabled(raw: string | undefined | null): boolean {
  return ENABLED.has((raw ?? "").trim().toLowerCase());
}

export function readPremiumKeyEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return isSalvazionPremiumKeyEnabled(env.SALVAZION_PREMIUM_KEY_ENABLED);
}

/** Same-origin check that does not depend on the payments client. */
export function premiumOriginAllowed(
  originHeader: string | null,
  appUrl = process.env.NEXT_PUBLIC_APP_URL || "",
): boolean {
  const origin = (originHeader || "").trim();
  if (!origin) return true;
  let host = "";
  try {
    host = new URL(origin).host.toLowerCase();
  } catch {
    return false;
  }
  if (host === "localhost" || host.startsWith("localhost:")) return true;
  if (host === "127.0.0.1" || host.startsWith("127.0.0.1:")) return true;
  if (host === "mapucoin.com" || host === "www.mapucoin.com") return true;
  if (host.endsWith(".vercel.app") && host.includes("mapucoin")) return true;
  try {
    return Boolean(appUrl) && new URL(appUrl).host.toLowerCase() === host;
  } catch {
    return false;
  }
}

export function isEthAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}

/** Smallest-unit threshold. Missing, zero, or non-integer values stay at 1. */
export function parseMinRaw(raw: string | undefined | null): bigint {
  const value = (raw ?? "").trim();
  if (!/^[1-9]\d*$/.test(value)) return BigInt(1);
  return BigInt(value);
}

export function isAllowedRpcUrl(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  if (url.username || url.password) return false;
  return !isBlockedHost(url.hostname);
}

function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host === "metadata.google.internal"
  ) {
    return true;
  }
  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!ipv4) return false;
  const parts = ipv4.slice(1).map(Number);
  if (parts.some((n) => n > 255)) return true;
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

export type PremiumKeySettings = {
  enabled: boolean;
  tokenAddress: string;
  rpcUrl: string;
  minRaw: bigint;
  secret: string;
  configured: boolean;
};

export function premiumKeySettings(
  env: Record<string, string | undefined> = process.env,
): PremiumKeySettings {
  const tokenAddress = (env.SALVAZION_TOKEN_ADDRESS || "").trim();
  const rpcUrl = (env.SALVAZION_RPC_URL || "").trim();
  return {
    enabled: isSalvazionPremiumKeyEnabled(env.SALVAZION_PREMIUM_KEY_ENABLED),
    tokenAddress,
    rpcUrl,
    minRaw: parseMinRaw(env.SALVAZION_MIN_RAW),
    secret: (env.SALVAZION_PREMIUM_KEY_SECRET || "").trim(),
    configured: isEthAddress(tokenAddress) && isAllowedRpcUrl(rpcUrl),
  };
}

/** ERC-20 balanceOf(address). Returns null when the address is not usable. */
export function encodeBalanceOf(holder: string): string | null {
  const wallet = holder.trim();
  if (!isEthAddress(wallet)) return null;
  return `0x70a08231${wallet.slice(2).toLowerCase().padStart(64, "0")}`;
}

export function decodeBalance(hex: string): bigint | null {
  const value = hex.trim();
  if (!/^0x[0-9a-fA-F]{1,64}$/.test(value)) return null;
  try {
    return BigInt(value);
  } catch {
    return null;
  }
}

export function holderQualifies(balanceRaw: bigint, minRaw: bigint): boolean {
  return balanceRaw >= minRaw;
}

/**
 * Flag off always denies Premium, including when a leftover cookie says otherwise.
 * That is the rollback path: flip the env off and every grant becomes inert.
 */
export function gatePremiumAccess(
  enabled: boolean,
  cookiePremium: boolean,
): { enabled: boolean; premium: boolean } {
  if (!enabled) return { enabled: false, premium: false };
  return { enabled: true, premium: cookiePremium };
}
