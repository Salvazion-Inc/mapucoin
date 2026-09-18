import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  LOCALE_COOKIE,
  localeCookieHeader,
  localeFromPath,
  stripLocalePrefix,
} from "@/lib/locale";
import { SESSION_COOKIE, readSession } from "@/lib/session";

const APP_HOSTS = new Set(["app.mapucoin.com", "www.app.mapucoin.com"]);
const SITE = "https://mapucoin.com";

const BASE_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const CHECKOUT_CSP = [
  BASE_CSP,
  "form-action 'self' https://checkout.stripe.com https://*.stripe.com",
].join("; ");

const ADMIN_CSP = [
  BASE_CSP,
  "form-action 'self'",
].join("; ");

function applySecurityHeaders(request: NextRequest, res: NextResponse) {
  const { pathname } = request.nextUrl;
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );

  if (pathname.startsWith("/admin")) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Content-Security-Policy", ADMIN_CSP);
    return;
  }

  if (
    pathname.startsWith("/reserva") ||
    pathname.startsWith("/api/checkout")
  ) {
    res.headers.set("Content-Security-Policy", CHECKOUT_CSP);
  }
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0] ?? "";
  const { pathname, search } = request.nextUrl;

  if (host === "www.mapucoin.com") {
    const url = request.nextUrl.clone();
    url.host = "mapucoin.com";
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  if (APP_HOSTS.has(host)) {
    const dest = pathname.startsWith("/app")
      ? `${SITE}${pathname}${search}`
      : `${SITE}/app${pathname === "/" ? "" : pathname}${search}`;
    return NextResponse.redirect(dest, 308);
  }

  const prefixed = localeFromPath(pathname);
  if (prefixed) {
    const dest = new URL(stripLocalePrefix(pathname) + search, request.url);
    const res = NextResponse.redirect(dest, 308);
    res.headers.append("Set-Cookie", localeCookieHeader(prefixed));
    applySecurityHeaders(request, res);
    return res;
  }

  if (pathname.startsWith("/app")) {
    const user = await readSession(request.cookies.get(SESSION_COOKIE)?.value);
    if (!user) {
      const login = request.nextUrl.clone();
      login.pathname = "/login";
      login.search = `?next=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(login);
    }
  }

  const locale = request.cookies.get(LOCALE_COOKIE)?.value;
  const res = NextResponse.next();
  if (locale) res.headers.set("x-mapucoin-locale", locale);
  applySecurityHeaders(request, res);
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.png|icon.png|manifest.json|flags/|images/|videos/).*)",
  ],
};
