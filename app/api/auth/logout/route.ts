import { NextResponse } from "next/server";
import { clearAuthCookieHeaders } from "@/lib/auth-cookies";
import { originRejectedResponse, requestSourceAllowed } from "@/lib/http-guard";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!requestSourceAllowed(req)) return originRejectedResponse();
  const cookies = clearAuthCookieHeaders(req.headers.get("cookie"));
  const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  for (const cookie of cookies) res.headers.append("Set-Cookie", cookie);
  return res;
}
