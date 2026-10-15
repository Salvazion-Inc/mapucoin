import {
  cookieValue,
  readSession,
  SESSION_COOKIE,
  type SessionUser,
} from "./session";

/** Pages that perform a service. Marketing routes stay off this list. */
export const SERVICE_PAGES = [
  "/app",
  "/reserva",
  "/planificar",
  "/partners/onboard",
] as const;

/**
 * API routes that perform a service. Guests get 401, unverified accounts 403.
 * Stripe webhooks, admin review, and public catalog reads are not in this list.
 */
export const SERVICE_API_ROUTES = [
  "POST /api/checkout",
  "GET /api/checkout/confirm",
  "POST /api/checkout/confirm",
  "POST /api/plan",
  "POST /api/chat",
  "POST /api/partners",
  "POST /api/partners/connect",
  "GET /api/bookings",
  "GET /api/profile",
  "PUT /api/profile",
  "GET /api/premium",
  "POST /api/premium",
] as const;

export function safeNextPath(value: string | null | undefined, fallback = "/app") {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  if (value.includes("://")) return fallback;
  return value;
}

export function isServicePage(pathname: string) {
  return SERVICE_PAGES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function nextFromSearch(search: string) {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const value = new URLSearchParams(raw).get("next");
  if (!value) return "";
  return safeNextPath(value, "");
}

/**
 * Where to send the browser before a service page renders.
 * Null means the request may continue.
 */
export function pageGateTarget(
  pathname: string,
  search: string,
  user: SessionUser | null,
) {
  if (pathname === "/verificar") {
    const requested = nextFromSearch(search);
    const next =
      requested && !requested.startsWith("/verificar") ? requested : "/app";
    if (!user) return `/signup?next=${encodeURIComponent(next)}`;
    if (user.emailVerified) return safeNextPath(next);
    return null;
  }

  if (!isServicePage(pathname)) return null;

  const next = `${pathname}${search}`;
  if (!user) return `/login?next=${encodeURIComponent(next)}`;
  if (!user.emailVerified) return `/verificar?next=${encodeURIComponent(next)}`;
  return null;
}

export async function requireVerifiedAccount(req: Request): Promise<
  | { ok: true; user: SessionUser }
  | { ok: false; response: Response }
> {
  const user = await readSession(
    cookieValue(req.headers.get("cookie"), SESSION_COOKIE),
  );
  if (!user) {
    return {
      ok: false,
      response: Response.json({ error: "auth" }, { status: 401 }),
    };
  }
  if (!user.emailVerified) {
    return {
      ok: false,
      response: Response.json({ error: "email_unverified" }, { status: 403 }),
    };
  }
  return { ok: true, user };
}
