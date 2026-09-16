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
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.png|icon.png|manifest.json|flags/|images/|videos/).*)",
  ],
};
