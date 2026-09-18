import { markBookingPaid } from "@/lib/booking-paid";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import { clientIp, rateLimit, rateLimitedResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function confirm(sessionId: string) {
  if (!stripeConfigured() || !sessionId.startsWith("cs_")) {
    return { ok: false as const, error: "session" };
  }
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return markBookingPaid(session);
}

export async function GET(req: Request) {
  const limited = rateLimit(`confirm:${clientIp(req)}`, 20, 10 * 60 * 1000);
  if (!limited.ok) return rateLimitedResponse(limited.retryAfter);
  const sessionId = new URL(req.url).searchParams.get("session_id") || "";
  try {
    const result = await confirm(sessionId);
    return Response.json(result, { status: result.ok ? 200 : 400 });
  } catch {
    return Response.json({ ok: false, error: "stripe" }, { status: 502 });
  }
}

export async function POST(req: Request) {
  const limited = rateLimit(`confirm:${clientIp(req)}`, 20, 10 * 60 * 1000);
  if (!limited.ok) return rateLimitedResponse(limited.retryAfter);
  const body = await req.json().catch(() => ({}));
  const sessionId = String(body.session_id || "");
  try {
    const result = await confirm(sessionId);
    return Response.json(result, { status: result.ok ? 200 : 400 });
  } catch {
    return Response.json({ ok: false, error: "stripe" }, { status: 502 });
  }
}
