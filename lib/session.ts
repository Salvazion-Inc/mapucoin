import { parseLocale, type Locale } from "./locale";

export const SESSION_COOKIE = "mapucoin_session";
export const ACCOUNTS_COOKIE = "mapucoin_accounts";
export const VERIFIED_COOKIE = "mapucoin_verified";
const DAY = 60 * 60 * 24;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  /** Pre-gate account that still has to confirm once. Not a stored false flag. */
  legacyVerification?: boolean;
  /**
   * Copy of app_metadata.session_version baked into the HMAC cookie.
   * Leave unset when issuing a session so the current server value is looked up.
   */
  sessionVersion?: number;
};

export type AccountRecord = {
  id: string;
  email: string;
  name: string;
  hash: string;
  emailVerified?: boolean;
};

type SessionPayload = {
  id: string;
  email: string;
  name?: string;
  emailVerified?: boolean;
  legacyVerification?: boolean;
  /** session_version at the time the cookie was signed. Absent cookies count as 0. */
  sv?: number;
  exp: number;
};

/** app_metadata key. Supabase already stores this JSON; no table migration. */
export const SESSION_VERSION_FIELD = "session_version";

/**
 * Dev-only signing key. Production never uses it: a missing AUTH_SECRET throws
 * so a cookie signed with a known string cannot be accepted or issued.
 */
const DEV_AUTH_SECRET = "mapucoin-dev-only-auth-secret";

export class AuthSecretError extends Error {
  constructor() {
    super("AUTH_SECRET is required in production");
    this.name = "AuthSecretError";
  }
}

export function sessionVersionOf(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(n) || n < 0 || n > 1_000_000_000) return 0;
  return n;
}

export function resolveAuthSecret(env: NodeJS.ProcessEnv = process.env): string {
  const configured = String(env.AUTH_SECRET || "").trim();
  if (configured) return configured;
  if (env.VERCEL_ENV === "production") throw new AuthSecretError();
  return DEV_AUTH_SECRET;
}

/** 500 JSON when production has no AUTH_SECRET. Null when a secret is available. */
export function authSecretFailureResponse(): Response | null {
  try {
    resolveAuthSecret();
    return null;
  } catch (error) {
    if (!(error instanceof AuthSecretError)) throw error;
    return Response.json(
      { error: "server" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}

function secret() {
  return resolveAuthSecret();
}

type SessionVersionSource = (userId: string) => Promise<number | null>;

let sessionVersionSource: SessionVersionSource | null = null;

/** Tests inject the user's app_metadata version. Production reads Supabase. */
export function setSessionVersionSource(source: SessionVersionSource | null) {
  sessionVersionSource = source;
}

function serverEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY") {
  if (typeof window !== "undefined") return "";
  return String(process.env[name] || "");
}

/**
 * Current session_version for a Supabase user.
 * Null means the check cannot run (no admin key, transport error, or unknown id).
 * A stored user with no field is version 0.
 */
async function lookupSessionVersion(userId: string): Promise<number | null> {
  if (!userId) return null;
  if (sessionVersionSource) return sessionVersionSource(userId);
  const url = serverEnv("NEXT_PUBLIC_SUPABASE_URL").replace(/\/$/, "");
  const key = serverEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  try {
    const res = await fetch(`${url}/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      app_metadata?: { session_version?: unknown };
      user?: { app_metadata?: { session_version?: unknown } };
    };
    const raw =
      body.app_metadata?.session_version ?? body.user?.app_metadata?.session_version;
    if (raw === undefined || raw === null) return 0;
    return sessionVersionOf(raw);
  } catch {
    return null;
  }
}

function bytesToB64Url(bytes: Uint8Array) {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64UrlToBytes(value: string) {
  const pad = "=".repeat((4 - (value.length % 4)) % 4);
  const b64 = (value + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmac(message: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );
  return bytesToB64Url(new Uint8Array(sig));
}

export async function signValue(value: string) {
  const sig = await hmac(value);
  return `${bytesToB64Url(new TextEncoder().encode(value))}.${sig}`;
}

export async function readSignedValue(token: string | undefined | null) {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  let raw: string;
  try {
    raw = new TextDecoder().decode(b64UrlToBytes(body));
  } catch {
    return null;
  }
  const expected = await hmac(raw);
  if (expected.length !== sig.length) return null;
  let ok = 0;
  for (let i = 0; i < expected.length; i += 1) {
    ok |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return ok === 0 ? raw : null;
}

export async function createSessionToken(user: SessionUser) {
  const sv =
    user.sessionVersion === undefined
      ? ((await lookupSessionVersion(user.id)) ?? 0)
      : sessionVersionOf(user.sessionVersion);
  const payload: SessionPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified === true,
    legacyVerification: user.legacyVerification === true,
    sv,
    exp: Math.floor(Date.now() / 1000) + 30 * DAY,
  };
  return signValue(JSON.stringify(payload));
}

export async function readSession(
  token: string | undefined | null,
): Promise<SessionUser | null> {
  const raw = await readSignedValue(token);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as SessionPayload;
    if (!data?.email || !data?.id || data.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    const sv = sessionVersionOf(data.sv);
    const current = await lookupSessionVersion(data.id);
    if (current != null && current !== sv) return null;
    return {
      id: data.id,
      email: data.email,
      name: data.name || data.email,
      emailVerified: data.emailVerified === true,
      legacyVerification: data.legacyVerification === true,
      sessionVersion: sv,
    };
  } catch (error) {
    if (error instanceof AuthSecretError) throw error;
    return null;
  }
}

export async function readAccounts(
  token: string | undefined | null,
): Promise<AccountRecord[]> {
  const raw = await readSignedValue(token);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as { users?: AccountRecord[] };
    return Array.isArray(data.users) ? data.users : [];
  } catch {
    return [];
  }
}

export async function signAccounts(users: AccountRecord[]) {
  return signValue(JSON.stringify({ users }));
}

export function sessionCookie(token: string) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * DAY}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function accountsCookie(token: string) {
  return `${ACCOUNTS_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${400 * DAY}`;
}

export function verifiedCookie(token: string) {
  return `${VERIFIED_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${400 * DAY}`;
}

export function cookieValue(header: string | null | undefined, name: string) {
  if (!header) return null;
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export function localeFromRequest(value: string | undefined | null): Locale {
  return parseLocale(value);
}
