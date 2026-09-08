import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  LOCALE_COOKIE,
  localeCookieHeader,
  localeFromPath,
  stripLocalePrefix,
} from "@/lib/locale";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const prefixed = localeFromPath(pathname);
  if (prefixed) {
    const dest = new URL(stripLocalePrefix(pathname) + search, request.url);
    const res = NextResponse.redirect(dest, 308);
    res.headers.append("Set-Cookie", localeCookieHeader(prefixed));
    return res;
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
