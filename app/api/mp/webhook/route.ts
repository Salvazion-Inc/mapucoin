import { mpEnabled, verifyMpSignature } from "@/lib/mp";
import { handleMpPaymentNotification, processMpEvent } from "@/lib/mp-payments";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * Mercado Pago notifications (topics payment and merchant_order; merchant_order is acknowledged only).
 * Signature: x-signature (ts, v1) + x-request-id + data.id, HMAC-SHA256 with MP_WEBHOOK_SECRET.
 * Idempotent: the x-request-id is recorded only after successful processing; on error it is
 * not recorded and the route answers 500 so MP retries.
 */
export async function POST(req: Request) {
  if (!mpEnabled()) return Response.json({ error: "mp_disabled" }, { status: 404 });
  const url = new URL(req.url);
  const raw = await req.text();
  const body = (() => {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {} as Record<string, unknown>;
    }
  })();
  const dataId =
    url.searchParams.get("data.id") ||
    url.searchParams.get("id") ||
    String((body.data as { id?: unknown } | undefined)?.id ?? "");
  const topic = String(
    url.searchParams.get("type") || url.searchParams.get("topic") || body.type || body.topic || "",
  );
  const requestId = req.headers.get("x-request-id") || "";

  // "Pagos (legacy)" / IPN and legacy merchant_order notifications are unsigned (?topic=…&id=…).
  // They are acknowledged with 200 and ignored: the signed Webhooks event (or /api/mp/confirm)
  // marks the booking, always re-reading the payment from MP with the partner's own token.
  if (!req.headers.get("x-signature")) {
    console.log("mp_webhook_unsigned_ignored", topic || "none", dataId ? "id" : "no_id");
    return Response.json({ ok: true, ignored: "unsigned" });
  }

  const valid = verifyMpSignature({
    xSignature: req.headers.get("x-signature"),
    xRequestId: requestId,
    dataId,
    secret: process.env.MP_WEBHOOK_SECRET,
    toleranceSeconds: 300,
  });
  if (!valid) return Response.json({ error: "signature" }, { status: 401 });

  const db = getSupabaseAdmin();
  if (!db) return Response.json({ error: "db" }, { status: 500 });

  const eventId = requestId || `${topic}:${dataId}:${String(body.action || "")}`;
  const result = await processMpEvent(db, eventId, { topic, resourceId: dataId }, async () => {
    if (topic !== "payment" || !dataId) return { retry: false }; // merchant_order: logged only
    const r = await handleMpPaymentNotification(db, dataId, String(body.user_id ?? ""));
    return { retry: r.status === "error" };
  });
  return Response.json(
    { ok: result.status === 200, ...(result.idempotent ? { idempotent: true } : {}) },
    { status: result.status },
  );
}
