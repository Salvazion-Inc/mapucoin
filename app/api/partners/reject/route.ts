import { adminAuthorized } from "@/lib/admin";
import { clientIp, rateLimit, rateLimitedResponse } from "@/lib/rate-limit";
import { getPartnerById, updatePartner } from "@/lib/partner-store";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const limited = rateLimit(`partners-reject:${clientIp(req)}`, 30, 60 * 1000);
  if (!limited.ok) return rateLimitedResponse(limited.retryAfter);
  if (!adminAuthorized(req)) {
    return Response.json({ error: "admin" }, { status: 401 });
  }

  const db = getSupabase();
  if (!db) return Response.json({ error: "db" }, { status: 503 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (body.ids != null || Array.isArray(body.id)) {
    return Response.json({ error: "id" }, { status: 400 });
  }
  const id = String(body.id || "").trim();
  if (!id || id.length > 80) return Response.json({ error: "id" }, { status: 400 });

  const current = await getPartnerById(db, id);
  if (!current) return Response.json({ error: "not_found" }, { status: 404 });

  const reason = String(body.reason || "").trim().slice(0, 500);

  try {
    const partner = await updatePartner(db, id, {
      status: "rejected",
      rejected_at: new Date().toISOString(),
      reject_reason: reason || null,
    });
    return Response.json({
      ok: true,
      partner: partner
        ? {
            id: partner.id,
            status: partner.status,
            rejected_at: partner.rejected_at,
            reject_reason: partner.reject_reason,
          }
        : null,
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "db" },
      { status: 500 },
    );
  }
}
