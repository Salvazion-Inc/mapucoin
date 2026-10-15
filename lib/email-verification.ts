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

export function requestOrigin(req: Request) {
  const host = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "")
    .split(",")[0]
    .trim();
  if (host.includes("localhost") || host.startsWith("127.")) {
    const proto = req.headers.get("x-forwarded-proto") || "http";
    return `${proto}://${host}`;
  }
  const env = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  if (env) return env;
  if (host) {
    const proto = req.headers.get("x-forwarded-proto") || "https";
    return `${proto}://${host}`;
  }
  return "https://mapucoin.com";
}

export function verificationLinkExposed(env: NodeJS.ProcessEnv = process.env) {
  if (env.MAPUCOIN_DEV_VERIFY === "1") return true;
  if (env.VERCEL_ENV === "production") return false;
  return env.NODE_ENV !== "production";
}

export function verificationUrl(req: Request, token: string, next: string) {
  const url = new URL("/api/auth/verify-email", requestOrigin(req));
  url.searchParams.set("token", token);
  url.searchParams.set("next", safeNextPath(next));
  return url.toString();
}

export async function deliverVerificationEmail(opts: {
  to: string;
  name: string;
  url: string;
}) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  if (!key || !from) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: opts.to,
        subject: "Verifica tu correo en Mapucoin",
        text: `Hola ${opts.name},\n\nConfirma tu correo para una experiencia personalizada en Mapucoin. Con la cuenta verificada puedes reservar cápsulas, armar el viaje, usar el concierge y postular como partner.\n\n${opts.url}\n`,
      }),
    });
    return res.ok;
  } catch {
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
    user = { ...session, email: session.email, emailVerified: true };
    cookies.push(sessionCookie(await createSessionToken(user)));
  } else if (account) {
    user = {
      id: account.id,
      email: account.email,
      name: account.name,
      emailVerified: true,
    };
    cookies.push(sessionCookie(await createSessionToken(user)));
  }

  return { mismatch: false as const, cookies, user };
}
