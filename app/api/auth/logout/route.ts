import { NextResponse } from "next/server";
import { clearAuthCookieHeaders } from "@/lib/auth-cookies";
import { requestOrigin } from "@/lib/email-verification";
import { safeNextPath } from "@/lib/verified-access";

export const runtime = "nodejs";

function logoutDestination(req: Request) {
  const next = new URL(req.url).searchParams.get("next");
  if (!next) return "/";
  return safeNextPath(next, "/");
}

function cleared(req: Request, redirectTo: string | null) {
  const cookies = clearAuthCookieHeaders(req.headers.get("cookie"));
  const res = redirectTo
    ? NextResponse.redirect(new URL(redirectTo, requestOrigin(req)), 303)
    : NextResponse.json({ ok: true });
  for (const cookie of cookies) res.headers.append("Set-Cookie", cookie);
  return res;
}

export async function GET(req: Request) {
  return cleared(req, logoutDestination(req));
}

export async function POST(req: Request) {
  return cleared(req, null);
}
