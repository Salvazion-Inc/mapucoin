import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  gatePremiumAccess,
  premiumKeySettings,
  premiumOriginAllowed,
  readPremiumKeyEnabled,
} from "@/lib/salvazion-premium";
import {
  PREMIUM_COOKIE,
  clearPremiumCookieHeader,
  premiumCookieHeader,
  readPremiumCookie,
  signPremiumCookie,
  verifyHolder,
} from "@/lib/salvazion-premium-server";
import { cookieValue } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function disabled() {
  const res = NextResponse.json({ enabled: false, premium: false });
  res.headers.append("Set-Cookie", clearPremiumCookieHeader());
  return res;
}

export async function GET(req: Request) {
  const settings = premiumKeySettings();
  if (!readPremiumKeyEnabled() || !settings.enabled) return disabled();

  const token = cookieValue(req.headers.get("cookie"), PREMIUM_COOKIE);
  const grant = gatePremiumAccess(
    true,
    readPremiumCookie(token, settings.secret),
  );
  return NextResponse.json(grant);
}

export async function POST(req: Request) {
  if (!readPremiumKeyEnabled()) return disabled();
  if (!premiumOriginAllowed(req.headers.get("origin"))) {
    return NextResponse.json({ error: "origin" }, { status: 403 });
  }

  const limit = rateLimit(`premium:${clientIp(req)}`, 8, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { enabled: true, premium: false, reason: "rate" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const body = (await req.json().catch(() => ({}))) as { wallet?: unknown };
  const settings = premiumKeySettings();
  const result = await verifyHolder({
    enabled: true,
    wallet: String(body.wallet ?? ""),
    settings,
  });
  const headers = new Headers();
  let persisted = false;
  if (result.premium) {
    const token = signPremiumCookie(settings.secret);
    if (token) {
      headers.append("Set-Cookie", premiumCookieHeader(token));
      persisted = true;
    }
  }
  return NextResponse.json(
    {
      enabled: true,
      premium: result.premium,
      reason: result.reason,
      persisted,
    },
    { headers },
  );
}
