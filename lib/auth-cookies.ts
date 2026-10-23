import { OAUTH_STATE_COOKIE } from "./google-oauth";
import { PROFILE_COOKIE } from "./profile";
import { SESSION_COOKIE, VERIFIED_COOKIE } from "./session";

const SESSION_COOKIE_NAMES = [
  SESSION_COOKIE,
  VERIFIED_COOKIE,
  PROFILE_COOKIE,
  OAUTH_STATE_COOKIE,
  "mapucoin_recovery",
];

function cookieNames(header: string | null) {
  if (!header) return [];
  return header
    .split(";")
    .map((part) => part.trim().split("=")[0] || "")
    .filter(Boolean);
}

export function expireCookie(name: string) {
  const expired = "Expires=Thu, 01 Jan 1970 00:00:00 GMT";
  const common = `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; ${expired}`;
  return [common, `${common}; Secure`];
}

/** Session, verification, profile, oauth, and Supabase auth cookies. */
export function clearAuthCookieHeaders(cookieHeader: string | null) {
  const names = new Set<string>(SESSION_COOKIE_NAMES);
  for (const name of cookieNames(cookieHeader)) {
    if (name.startsWith("sb-")) names.add(name);
  }
  return [...names].flatMap((name) => expireCookie(name));
}
