import { adminAuthorized } from "@/lib/admin";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!adminAuthorized(req)) {
    return Response.json({ error: "admin" }, { status: 401 });
  }

  const db = getSupabase();
  if (!db) return Response.json({ error: "db" }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const id = String(body.id || "").trim();
  if (!id) return Response.json({ error: "id" }, { status: 400 });

  const { data: current, error: loadErr } = await db
    .from("partners")
    .select("id, status")
    .eq("id", id)
    .maybeSingle();
  if (loadErr) return Response.json({ error: loadErr.message }, { status: 500 });
  if (!current) return Response.json({ error: "not_found" }, { status: 404 });

  const reason = String(body.reason || "").trim().slice(0, 500);

  const { data, error } = await db
    .from("partners")
    .update({
      status: "rejected",
      rejected_at: new Date().toISOString(),
      reject_reason: reason || null,
    })
    .eq("id", id)
    .select("id, status, rejected_at, reject_reason")
    .maybeSingle();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true, partner: data });
}
