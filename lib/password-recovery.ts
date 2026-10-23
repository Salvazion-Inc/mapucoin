/**
 * Password recovery uses the service-role admin API only.
 * A missing service-role key does not fall back to the browser key.
 * The email link is on mapucoin.com (localhost only outside production)
 * and the API body never includes that link.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendTransactionalEmail, requestOrigin } from "./email-verification";
import { GOOGLE_MARKER } from "./google-oauth";
import { isEmail, originAllowed, originRejectedResponse } from "./http-guard";
import { hashPassword } from "./passwords";
import { clientIp, rateLimit } from "./rate-limit";
import {
  ACCOUNTS_COOKIE,
  accountsCookie,
  cookieValue,
  readAccounts,
  readSignedValue,
  signAccounts,
  signValue,
} from "./session";

export const RECOVERY_COOKIE = "mapucoin_recovery";
export const RECOVERY_TTL_SEC = 15 * 60;
export const UPDATE_PASSWORD_PATH = "/auth/update-password";
export const EXPIRED_LOGIN_PATH = "/login?notice=link_expired";
export const FORGOT_EMAIL_LIMIT = 3;
export const FORGOT_IP_LIMIT = 5;
export const FORGOT_WINDOW_MS = 15 * 60 * 1000;
export const UPDATE_LIMIT = 8;

export const RECOVERY_EMAIL_SUBJECT = "Restablece tu contraseña en Mapucoin";

export const RECOVERY_EMAIL_BODY = {
  intro:
    "Recibimos una solicitud para restablecer la contraseña de tu cuenta Mapucoin. Este enlace caduca en 15 minutos y solo se puede usar una vez.",
  action: "Restablecer contraseña",
  ignore: "Si no fuiste tú, ignora este correo. Tu contraseña no cambiará.",
} as const;

const JTI_FIELD = "mapucoin_recovery_jti";
const NEUTRAL_BODY = { ok: true } as const;

type AppMeta = Record<string, unknown>;

type RecoveryPayload = {
  kind: "password-recovery";
  email: string;
  userId: string;
  tokenHash: string;
  jti: string;
  exp: number;
};

export type RecoveryLink =
  | {
      ok: true;
      userId: string;
      email: string;
      name: string;
      hashedToken: string;
      appMetadata: AppMeta;
    }
  | { ok: false };

export type RecoveryAdmin = {
  generateLink(email: string, redirectTo: string): Promise<RecoveryLink>;
  getUser(userId: string): Promise<{ id: string; email: string; appMetadata: AppMeta } | null>;
  setRecoveryJti(userId: string, jti: string, appMetadata: AppMeta): Promise<boolean>;
  clearRecoveryJti(userId: string, appMetadata: AppMeta): Promise<boolean>;
  verifyRecovery(tokenHash: string): Promise<boolean>;
  updatePassword(userId: string, password: string): Promise<boolean>;
};

export type RecoveryDeps = {
  env?: NodeJS.ProcessEnv;
  fetchImpl?: typeof fetch;
  admin?: RecoveryAdmin | null;
  now?: number;
};

const consumed = new Map<string, number>();

export function resetPasswordRecoveryMemory() {
  consumed.clear();
}

function rememberConsumed(jti: string, exp: number) {
  const now = Math.floor(Date.now() / 1000);
  if (consumed.size > 5000) {
    for (const [key, until] of consumed) {
      if (until <= now) consumed.delete(key);
    }
  }
  consumed.set(jti, exp);
}

function wasConsumed(jti: string, nowMs: number) {
  const exp = consumed.get(jti);
  if (!exp) return false;
  if (exp <= Math.floor(nowMs / 1000)) {
    consumed.delete(jti);
    return false;
  }
  return true;
}

function sameString(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cleanName(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim().slice(0, 80);
}

export function recoveryEmailHtml(opts: { name: string; url: string }) {
  const name = cleanName(opts.name);
  const greeting = name ? `Hola ${escapeHtml(name)},` : "Hola,";
  return `<p>${greeting}</p><p>${RECOVERY_EMAIL_BODY.intro}</p><p><a href="${escapeHtml(opts.url)}">${RECOVERY_EMAIL_BODY.action}</a></p><p>${RECOVERY_EMAIL_BODY.ignore}</p>`;
}

function cleanHost(value: string) {
  const host = value.split(",")[0]?.trim() || "";
  if (!host || /[\s/@\\]/.test(host)) return "";
  return host;
}

function isLocalHost(host: string) {
  return host.includes("localhost") || host.startsWith("127.");
}

/** Public origin placed in the recovery email. Production never follows the request host. */
export function recoveryEmailOrigin(req: Request, env: NodeJS.ProcessEnv = process.env) {
  const host = cleanHost(
    req.headers.get("x-forwarded-host") || req.headers.get("host") || "",
  );
  const local = Boolean(host) && isLocalHost(host);
  if (local && env["VERCEL_ENV"] !== "production") {
    const proto = (req.headers.get("x-forwarded-proto") || "http").split(",")[0].trim();
    return `${proto}://${host}`;
  }
  return "https://mapucoin.com";
}

export function recoveryRedirectTo(origin: string) {
  const url = new URL("/auth/callback", origin);
  url.searchParams.set("next", UPDATE_PASSWORD_PATH);
  return url.toString();
}

export function recoveryEmailUrl(origin: string, token: string) {
  const url = new URL("/auth/callback", origin);
  url.searchParams.set("token", token);
  url.searchParams.set("type", "recovery");
  url.searchParams.set("next", UPDATE_PASSWORD_PATH);
  return url.toString();
}

function requestIsSecure(req: Request) {
  const proto = (req.headers.get("x-forwarded-proto") || "").split(",")[0].trim();
  if (proto) return proto === "https";
  return new URL(req.url).protocol === "https:";
}

export function recoveryCookie(token: string, maxAge: number, secure: boolean) {
  const base = `${RECOVERY_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.max(0, maxAge)}`;
  return secure ? `${base}; Secure` : base;
}

export function clearRecoveryCookie(secure: boolean) {
  return recoveryCookie("", 0, secure);
}

function noStore(extra?: Record<string, string>) {
  return { "Cache-Control": "no-store", ...extra };
}

function neutralResponse() {
  return NextResponse.json(NEUTRAL_BODY, { headers: noStore() });
}

function limitedResponse(retryAfter: number) {
  return NextResponse.json(
    { error: "rate_limited" },
    {
      status: 429,
      headers: noStore({ "Retry-After": String(retryAfter) }),
    },
  );
}

function memoryAuthStorage() {
  const bag = new Map<string, string>();
  return {
    getItem(key: string) {
      return bag.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      bag.set(key, value);
    },
    removeItem(key: string) {
      bag.delete(key);
    },
  };
}

function serviceClient(env: NodeJS.ProcessEnv): SupabaseClient | null {
  const url = String(env["NEXT_PUBLIC_SUPABASE_URL"] || "").trim();
  const key = String(env["SUPABASE_SERVICE_ROLE_KEY"] || "").trim();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storage: memoryAuthStorage(),
    },
  });
}

function metaOf(value: unknown): AppMeta {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return { ...(value as AppMeta) };
}

function displayName(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") return "";
  const record = metadata as Record<string, unknown>;
  return cleanName(String(record.full_name || record.name || ""));
}

export function createRecoveryAdmin(env: NodeJS.ProcessEnv = process.env): RecoveryAdmin | null {
  const supabase = serviceClient(env);
  if (!supabase) return null;
  return {
    async generateLink(email, redirectTo) {
      try {
        const { data, error } = await supabase.auth.admin.generateLink({
          type: "recovery",
          email,
          options: { redirectTo },
        });
        const link = data as {
          user?: {
            id?: string;
            email?: string | null;
            user_metadata?: Record<string, unknown> | null;
            app_metadata?: Record<string, unknown> | null;
          } | null;
          properties?: { hashed_token?: string | null } | null;
        } | null;
        const hashedToken = String(link?.properties?.hashed_token || "");
        const userId = String(link?.user?.id || "");
        if (error || !userId || !hashedToken) return { ok: false };
        return {
          ok: true,
          userId,
          email: String(link?.user?.email || email).trim().toLowerCase(),
          name: displayName(link?.user?.user_metadata),
          hashedToken,
          appMetadata: metaOf(link?.user?.app_metadata),
        };
      } catch {
        return { ok: false };
      }
    },
    async getUser(userId) {
      try {
        const { data, error } = await supabase.auth.admin.getUserById(userId);
        const email = String(data?.user?.email || "").trim().toLowerCase();
        if (error || !data.user || !email) return null;
        return { id: data.user.id, email, appMetadata: metaOf(data.user.app_metadata) };
      } catch {
        return null;
      }
    },
    async setRecoveryJti(userId, jti, appMetadata) {
      try {
        const { error } = await supabase.auth.admin.updateUserById(userId, {
          app_metadata: { ...appMetadata, [JTI_FIELD]: jti },
        });
        return !error;
      } catch {
        return false;
      }
    },
    async clearRecoveryJti(userId, appMetadata) {
      try {
        const { error } = await supabase.auth.admin.updateUserById(userId, {
          app_metadata: { ...appMetadata, [JTI_FIELD]: null },
        });
        return !error;
      } catch {
        return false;
      }
    },
    async verifyRecovery(tokenHash) {
      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        });
        return !error;
      } catch {
        return false;
      }
    },
    async updatePassword(userId, password) {
      try {
        const { error } = await supabase.auth.admin.updateUserById(userId, { password });
        return !error;
      } catch {
        return false;
      }
    },
  };
}

function resolveAdmin(deps: RecoveryDeps, env: NodeJS.ProcessEnv) {
  if (Object.prototype.hasOwnProperty.call(deps, "admin")) return deps.admin ?? null;
  return createRecoveryAdmin(env);
}

export async function createRecoveryToken(
  input: { email: string; userId: string; tokenHash: string; jti: string },
  nowMs = Date.now(),
) {
  const payload: RecoveryPayload = {
    kind: "password-recovery",
    email: input.email.trim().toLowerCase(),
    userId: input.userId,
    tokenHash: input.tokenHash,
    jti: input.jti,
    exp: Math.floor(nowMs / 1000) + RECOVERY_TTL_SEC,
  };
  return signValue(JSON.stringify(payload));
}

export async function readRecoveryToken(token: string | null | undefined, nowMs = Date.now()) {
  if (!token || token.length > 3500) return null;
  const raw = await readSignedValue(token);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<RecoveryPayload>;
    if (data.kind !== "password-recovery") return null;
    if (!data.email || !data.userId || !data.tokenHash || !data.jti || typeof data.exp !== "number") {
      return null;
    }
    if (data.exp <= Math.floor(nowMs / 1000)) return null;
    return {
      email: data.email.trim().toLowerCase(),
      userId: data.userId,
      tokenHash: data.tokenHash,
      jti: data.jti,
      exp: data.exp,
    };
  } catch {
    return null;
  }
}

async function deliverRecovery(opts: {
  to: string;
  name: string;
  url: string;
  env: NodeJS.ProcessEnv;
  fetchImpl: typeof fetch;
}) {
  return sendTransactionalEmail(
    {
      to: opts.to,
      subject: RECOVERY_EMAIL_SUBJECT,
      html: recoveryEmailHtml({ name: opts.name, url: opts.url }),
      kind: "password recovery email",
    },
    opts.env,
    opts.fetchImpl,
  );
}

export async function requestPasswordReset(req: Request, deps: RecoveryDeps = {}) {
  if (!originAllowed(req)) return originRejectedResponse();

  const env = deps.env || process.env;
  const now = deps.now ?? Date.now();
  const fetchImpl = deps.fetchImpl || fetch;
  const ipLimit = rateLimit(`forgot-password:${clientIp(req)}`, FORGOT_IP_LIMIT, FORGOT_WINDOW_MS);
  if (!ipLimit.ok) return limitedResponse(ipLimit.retryAfter);

  const body = (await req.json().catch(() => ({}))) as { email?: unknown };
  const email = String(body.email || "").trim().toLowerCase();
  if (!isEmail(email)) {
    return NextResponse.json({ error: "email" }, { status: 400, headers: noStore() });
  }

  const emailLimit = rateLimit(`forgot-password-email:${email}`, FORGOT_EMAIL_LIMIT, FORGOT_WINDOW_MS);
  if (!emailLimit.ok) return limitedResponse(emailLimit.retryAfter);

  const admin = resolveAdmin(deps, env);
  if (!admin) return neutralResponse();

  const origin = recoveryEmailOrigin(req, env);
  let generated: RecoveryLink = { ok: false };
  try {
    generated = await admin.generateLink(email, recoveryRedirectTo(origin));
  } catch {
    generated = { ok: false };
  }
  if (!generated.ok) return neutralResponse();

  const jti = crypto.randomUUID().replace(/-/g, "");
  const saved = await admin.setRecoveryJti(generated.userId, jti, generated.appMetadata);
  if (!saved) {
    console.error("[mapucoin] password recovery link was not sent");
    return neutralResponse();
  }

  const token = await createRecoveryToken(
    {
      email: generated.email,
      userId: generated.userId,
      tokenHash: generated.hashedToken,
      jti,
    },
    now,
  );
  const url = recoveryEmailUrl(origin, token);
  const delivered = await deliverRecovery({
    to: generated.email,
    name: generated.name,
    url,
    env,
    fetchImpl,
  });
  if (!delivered) {
    console.error("[mapucoin] password recovery link was not sent");
  }
  return neutralResponse();
}

async function accountPasswordCookie(cookieHeader: string | null, email: string, password: string) {
  const users = await readAccounts(cookieValue(cookieHeader, ACCOUNTS_COOKIE));
  const account = users.find((item) => item.email === email);
  if (!account || account.hash === GOOGLE_MARKER) return null;
  account.hash = hashPassword(password);
  return accountsCookie(await signAccounts(users));
}

function tokenFromRequest(req: Request) {
  return cookieValue(req.headers.get("cookie"), RECOVERY_COOKIE);
}

export async function inspectRecoveryRequest(req: Request, deps: RecoveryDeps = {}) {
  const env = deps.env || process.env;
  const now = deps.now ?? Date.now();
  const parsed = await readRecoveryToken(tokenFromRequest(req), now);
  if (!parsed || wasConsumed(parsed.jti, now)) {
    return NextResponse.json({ error: "token" }, { status: 400, headers: noStore() });
  }
  const admin = resolveAdmin(deps, env);
  if (!admin) {
    return NextResponse.json({ error: "token" }, { status: 400, headers: noStore() });
  }
  const user = await admin.getUser(parsed.userId);
  const jti = user ? String(user.appMetadata[JTI_FIELD] || "") : "";
  if (!user || user.email !== parsed.email || !jti || !sameString(jti, parsed.jti)) {
    return NextResponse.json({ error: "token" }, { status: 400, headers: noStore() });
  }
  return NextResponse.json({ ok: true }, { headers: noStore() });
}

export async function updateRecoveredPassword(req: Request, deps: RecoveryDeps = {}) {
  if (!originAllowed(req)) return originRejectedResponse();
  const env = deps.env || process.env;
  const now = deps.now ?? Date.now();
  const secure = requestIsSecure(req);
  const ipLimit = rateLimit(`update-password:${clientIp(req)}`, UPDATE_LIMIT, FORGOT_WINDOW_MS);
  if (!ipLimit.ok) return limitedResponse(ipLimit.retryAfter);

  const body = (await req.json().catch(() => ({}))) as {
    password?: unknown;
    confirm?: unknown;
  };
  const password = String(body.password || "");
  const confirm = String(body.confirm || "");
  if (password.length < 8 || password.length > 128) {
    return NextResponse.json({ error: "password" }, { status: 400, headers: noStore() });
  }
  if (password !== confirm) {
    return NextResponse.json({ error: "mismatch" }, { status: 400, headers: noStore() });
  }

  const fail = () => {
    const res = NextResponse.json({ error: "token" }, { status: 400, headers: noStore() });
    res.headers.append("Set-Cookie", clearRecoveryCookie(secure));
    return res;
  };

  const parsed = await readRecoveryToken(tokenFromRequest(req), now);
  if (!parsed || wasConsumed(parsed.jti, now)) return fail();

  const admin = resolveAdmin(deps, env);
  if (!admin) return fail();
  const user = await admin.getUser(parsed.userId);
  const jti = user ? String(user.appMetadata[JTI_FIELD] || "") : "";
  if (!user || user.email !== parsed.email || !jti || !sameString(jti, parsed.jti)) return fail();

  const burned = await admin.verifyRecovery(parsed.tokenHash);
  if (!burned) return fail();
  const updated = await admin.updatePassword(parsed.userId, password);
  if (!updated) return fail();

  rememberConsumed(parsed.jti, parsed.exp);
  await admin.clearRecoveryJti(parsed.userId, user.appMetadata);
  const vault = await accountPasswordCookie(req.headers.get("cookie"), parsed.email, password);

  const res = NextResponse.json({ ok: true, next: "/login" }, { headers: noStore() });
  res.headers.append("Set-Cookie", clearRecoveryCookie(secure));
  if (vault) res.headers.append("Set-Cookie", vault);
  return res;
}

export async function recoveryCallbackResponse(req: Request, nowMs = Date.now()) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const origin = requestOrigin(req);
  const parsed = await readRecoveryToken(token, nowMs);
  if (!parsed || !token) {
    const res = NextResponse.redirect(new URL(EXPIRED_LOGIN_PATH, origin), 303);
    res.headers.set("Cache-Control", "no-store");
    return res;
  }
  const res = NextResponse.redirect(new URL(UPDATE_PASSWORD_PATH, origin), 303);
  const maxAge = Math.max(1, parsed.exp - Math.floor(nowMs / 1000));
  res.headers.append("Set-Cookie", recoveryCookie(token, maxAge, origin.startsWith("https://")));
  res.headers.set("Cache-Control", "no-store");
  return res;
}
