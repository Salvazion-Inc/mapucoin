import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { applySecurityHeaders } from "@/lib/security-headers";
import {
  LOCALE_COOKIE,
  localeCookieHeader,
  localeFromPath,
  stripLocalePrefix,
} from "@/lib/locale";
import { SESSION_COOKIE, readSession } from "@/lib/session";
import { pageGateTarget } from "@/lib/verified-access";

const APP_HOSTS = new Set(["app.mapucoin.com", "www.app.mapucoin.com"]);
const SITE = "https://mapucoin.com";

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0] ?? "";
  const { pathname, search } = request.nextUrl;

  if (host === "www.mapucoin.com") {
    const url = request.nextUrl.clone();
    url.host = "mapucoin.com";
    url.protocol = "https:";
    return applySecurityHeaders(NextResponse.redirect(url, 308));
  }

  if (APP_HOSTS.has(host)) {
    const dest = pathname.startsWith("/app")
      ? `${SITE}${pathname}${search}`
      : `${SITE}/app${pathname === "/" ? "" : pathname}${search}`;
    return applySecurityHeaders(NextResponse.redirect(dest, 308));
  }

  const prefixed = localeFromPath(pathname);
  if (prefixed) {
    const dest = new URL(stripLocalePrefix(pathname) + search, request.url);
    const res = NextResponse.redirect(dest, 308);
    res.headers.append("Set-Cookie", localeCookieHeader(prefixed));
    return applySecurityHeaders(res);
  }

  const user = await readSession(request.cookies.get(SESSION_COOKIE)?.value);
  const gate = pageGateTarget(pathname, search, user);
  if (gate) {
    const dest = request.nextUrl.clone();
    const parsed = new URL(gate, request.url);
    dest.pathname = parsed.pathname;
    dest.search = parsed.search;
    const redirect = NextResponse.redirect(dest);
    redirect.headers.set("X-Robots-Tag", "noindex, nofollow");
    return applySecurityHeaders(redirect);
  }

  const locale = request.cookies.get(LOCALE_COOKIE)?.value;
  const res = NextResponse.next();
  if (locale) res.headers.set("x-mapucoin-locale", locale);
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/app") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/partners/onboard") ||
    pathname.startsWith("/planificar") ||
    pathname.startsWith("/reserva")
  ) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return applySecurityHeaders(res);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|favicon.png|icon.png|manifest.json|flags/|images/|videos/).*)",
  ],
};
