import {
  ACCOUNTS_COOKIE,
  accountsCookie,
  cookieValue,
  createSessionToken,
  readAccounts,
  readSession,
  readSignedValue,
  SESSION_COOKIE,
  sessionCookie,
  signAccounts,
  signValue,
  VERIFIED_COOKIE,
  verifiedCookie,
  type SessionUser,
} from "./session";
import { persistVerifiedAccountByEmail } from "./account-verification";
import { safeNextPath } from "./verified-access";

const VERIFY_TTL_SEC = 60 * 60 * 24;

export function resolveEmailVerified(
  email: string,
  account: { emailVerified?: boolean } | null | undefined,
  verifiedEmails: string[],
) {
  const normalized = email.trim().toLowerCase();
  if (account?.emailVerified === true) return true;
  return verifiedEmails.includes(normalized);
}

export async function readVerifiedEmails(token: string | null | undefined) {
  const raw = await readSignedValue(token);
  if (!raw) return [] as string[];
  try {
    const data = JSON.parse(raw) as { emails?: unknown };
    if (!Array.isArray(data.emails)) return [];
    return data.emails
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
  } catch {
    return [];
  }
}

export async function verifiedEmailsFrom(cookieHeader: string | null) {
  return readVerifiedEmails(cookieValue(cookieHeader, VERIFIED_COOKIE));
}

async function signVerifiedList(emails: string[]) {
  return signValue(JSON.stringify({ emails }));
}

export async function rememberVerifiedEmail(
  cookieHeader: string | null,
  email: string,
) {
  const list = await verifiedEmailsFrom(cookieHeader);
  const normalized = email.trim().toLowerCase();
  if (normalized && !list.includes(normalized)) list.push(normalized);
  while (list.length > 50) list.shift();
  return verifiedCookie(await signVerifiedList(list));
}

export async function createEmailVerifyToken(email: string) {
  const payload = {
    kind: "email-verify",
    email: email.trim().toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + VERIFY_TTL_SEC,
  };
  return signValue(JSON.stringify(payload));
}

export async function readEmailVerifyToken(token: string | null | undefined) {
  const raw = await readSignedValue(token);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as {
      kind?: string;
      email?: string;
      exp?: number;
    };
    if (data.kind !== "email-verify" || !data.email || !data.exp) return null;
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return { email: data.email.trim().toLowerCase() };
  } catch {
    return null;
  }
}

function cleanHost(value: string) {
  const host = value.split(",")[0]?.trim() || "";
  if (!host || /[\s/@\\]/.test(host)) return "";
  return host;
}

function isLocalHost(host: string) {
  return host.includes("localhost") || host.startsWith("127.");
}

function isProductionHost(host: string) {
  return (
    host === "mapucoin.com" ||
    host === "www.mapucoin.com" ||
    host.endsWith(".mapucoin.com")
  );
}

/**
 * Origin of the deployment that is handling this request.
 * Preview links must stay on that deployment: the request host, otherwise
 * VERCEL_URL. NEXT_PUBLIC_APP_URL is not consulted, and there is no
 * baked-in production domain.
 */
export function requestOrigin(req: Request, env: NodeJS.ProcessEnv = process.env) {
  const host = cleanHost(
    req.headers.get("x-forwarded-host") || req.headers.get("host") || "",
  );
  const vercelHost = cleanHost(
    (env["VERCEL_URL"] || "").replace(/^https?:\/\//, "").replace(/\/$/, ""),
  );
  const local = Boolean(host) && isLocalHost(host);
  const proto =
    req.headers.get("x-forwarded-proto") || (local ? "http" : "https");

  if (local && host) return `${proto}://${host}`;

  const offProduction = env["VERCEL_ENV"] !== "production";
  if (offProduction && host && isProductionHost(host) && vercelHost) {
    return `https://${vercelHost}`;
  }
  if (host) return `${proto}://${host}`;
  if (vercelHost) return `https://${vercelHost}`;
  return "http://127.0.0.1:3000";
}

export function verificationLinkExposed(env: NodeJS.ProcessEnv = process.env) {
  if (env["VERCEL_ENV"] === "production") return false;
  // Bracket access so Next does not inline the flag at build time.
  if (env["MAPUCOIN_DEV_VERIFY"] === "1") return true;
  return env["VERCEL_ENV"] !== "production";
}

export function verificationUrl(req: Request, token: string, next: string) {
  const url = new URL("/api/auth/verify-email", requestOrigin(req));
  url.searchParams.set("token", token);
  url.searchParams.set("next", safeNextPath(next));
  return url.toString();
}

const RESEND_EMAILS_URL = "https://api.resend.com/emails";

function mailConfig(env: NodeJS.ProcessEnv) {
  // Bracket access and trim at call time. Next must not inline the key at
  // build, and a pasted Vercel value often keeps a trailing newline.
  const key = String(env["RESEND_API_KEY"] || "").trim();
  const from = String(env["MAIL_FROM"] || "").trim();
  return { key, from };
}

function redactSecrets(text: string, key: string) {
  let out = text.replace(/Bearer\s+\S+/gi, "Bearer [redacted]");
  out = out.replace(/\bre_[A-Za-z0-9_]+\b/g, "[redacted]");
  if (key) out = out.split(key).join("[redacted]");
  return out.slice(0, 800);
}

function logMailFailure(reason: string, detail?: { status?: number; body?: string; key?: string }) {
  const body = redactSecrets(detail?.body || "", detail?.key || "");
  const status = detail?.status == null ? "" : ` status=${detail.status}`;
  console.error(`[mapucoin] verification email failed: ${reason}${status}${body ? ` body=${body}` : ""}`);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function deliverVerificationEmail(
  opts: { to: string; name: string; url: string },
  env: NodeJS.ProcessEnv = process.env,
  fetchImpl: typeof fetch = fetch,
) {
  const { key, from } = mailConfig(env);
  if (!key || !from) {
    const reason = !key && !from
      ? "missing RESEND_API_KEY and MAIL_FROM"
      : !key
        ? "missing RESEND_API_KEY"
        : "missing MAIL_FROM";
    logMailFailure(reason);
    return false;
  }
  const subject = "Verifica tu correo en Mapucoin";
  const html = `<p>Hola ${escapeHtml(opts.name)},</p><p>Confirma tu correo para una experiencia personalizada en Mapucoin. Con la cuenta verificada puedes reservar cápsulas, armar el viaje, usar el concierge y postular como partner.</p><p><a href="${escapeHtml(opts.url)}">Verificar correo</a></p>`;
  try {
    const res = await fetchImpl(RESEND_EMAILS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: opts.to,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      logMailFailure("resend rejected the send", { status: res.status, body, key });
      return false;
    }
    return true;
  } catch (error) {
    const body = error instanceof Error ? error.message : "fetch failed";
    logMailFailure("resend request threw", { body, key });
    return false;
  }
}

export async function grantVerifiedEmail(opts: {
  email: string;
  cookieHeader: string | null;
}) {
  const email = opts.email.trim().toLowerCase();
  const session = await readSession(
    cookieValue(opts.cookieHeader, SESSION_COOKIE),
  );
  if (session && session.email.toLowerCase() !== email) {
    return { mismatch: true as const, cookies: [] as string[], user: null };
  }

  const accounts = await readAccounts(
    cookieValue(opts.cookieHeader, ACCOUNTS_COOKIE),
  );
  const account = accounts.find((item) => item.email === email);
  if (account) account.emailVerified = true;

  const list = await verifiedEmailsFrom(opts.cookieHeader);
  if (!list.includes(email)) list.push(email);
  while (list.length > 50) list.shift();

  const cookies = [verifiedCookie(await signVerifiedList(list))];
  if (accounts.length) cookies.push(accountsCookie(await signAccounts(accounts)));

  let user: SessionUser | null = null;
  if (session) {
    user = {
      ...session,
      email: session.email,
      emailVerified: true,
      legacyVerification: false,
    };
    cookies.push(sessionCookie(await createSessionToken(user)));
  } else if (account) {
    user = {
      id: account.id,
      email: account.email,
      name: account.name,
      emailVerified: true,
      legacyVerification: false,
    };
    cookies.push(sessionCookie(await createSessionToken(user)));
  }

  await persistVerifiedAccountByEmail(email);
  return { mismatch: false as const, cookies, user };
}
