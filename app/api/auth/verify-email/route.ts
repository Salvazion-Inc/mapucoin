import { NextResponse } from "next/server";
import {
  createEmailVerifyToken,
  deliverVerificationEmail,
  grantVerifiedEmail,
  readEmailVerifyToken,
  requestOrigin,
  verificationLinkExposed,
  verificationUrl,
} from "@/lib/email-verification";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { cookieValue, readSession, SESSION_COOKIE } from "@/lib/session";
import { safeNextPath } from "@/lib/verified-access";

const RESEND_WINDOW_MS = 20_000;

export const runtime = "nodejs";

function withCookies(res: NextResponse, cookies: string[]) {
  for (const cookie of cookies) res.headers.append("Set-Cookie", cookie);
  return res;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = requestOrigin(req);
  const next = safeNextPath(url.searchParams.get("next"));
  const token = await readEmailVerifyToken(url.searchParams.get("token"));
  const fail = new URL("/verificar", origin);
  fail.searchParams.set("error", "token");
  fail.searchParams.set("next", next);
  if (!token) return NextResponse.redirect(fail);

  const granted = await grantVerifiedEmail({
    email: token.email,
    cookieHeader: req.headers.get("cookie"),
  });
  if (granted.mismatch) {
    fail.searchParams.set("error", "mismatch");
    return NextResponse.redirect(fail);
  }

  const dest = granted.user
    ? new URL(next, origin)
    : new URL(`/login?next=${encodeURIComponent(next)}`, origin);
  return withCookies(NextResponse.redirect(dest), granted.cookies);
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { token?: unknown };
  const tokenRaw = String(body.token || "");
  if (tokenRaw) {
    const token = await readEmailVerifyToken(tokenRaw);
    if (!token) {
      return NextResponse.json({ error: "token" }, { status: 400 });
    }
    const granted = await grantVerifiedEmail({
      email: token.email,
      cookieHeader: req.headers.get("cookie"),
    });
    if (granted.mismatch) {
      return NextResponse.json({ error: "mismatch" }, { status: 403 });
    }
    const res = NextResponse.json({
      ok: true,
      user: granted.user,
      emailVerified: Boolean(granted.user?.emailVerified),
    });
    return withCookies(res, granted.cookies);
  }

  const user = await readSession(
    cookieValue(req.headers.get("cookie"), SESSION_COOKIE),
  );
  if (!user) {
    return NextResponse.json({ error: "auth" }, { status: 401 });
  }
  if (user.emailVerified) {
    return NextResponse.json({ ok: true, already: true, user });
  }

  const limited = rateLimit(
    `verify-resend:${user.id}:${clientIp(req)}`,
    1,
    RESEND_WINDOW_MS,
  );
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, delivered: false, error: "rate_limited", retryAfter: limited.retryAfter },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  const next = safeNextPath(String(bodyNext(body)));
  const token = await createEmailVerifyToken(user.email);
  const url = verificationUrl(req, token, next);
  const delivered = await deliverVerificationEmail({
    to: user.email,
    name: user.name,
    url,
  });
  return NextResponse.json({
    ok: true,
    delivered,
    retryAfter: RESEND_WINDOW_MS / 1000,
    devUrl: verificationLinkExposed() ? url : undefined,
  });
}

function bodyNext(body: { token?: unknown; next?: unknown }) {
  return typeof body.next === "string" ? body.next : "/app";
}
