import { adminAuthorized } from "@/lib/admin";
import { insertPartner, listPartners } from "@/lib/partner-store";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

const roles = [
  "capsula",
  "gastronomia",
  "actividad",
  "guia",
  "transporte",
  "vina",
] as const;

export async function GET(req: Request) {
  if (!adminAuthorized(req)) {
    return Response.json({ error: "admin" }, { status: 401 });
  }
  const db = getSupabase();
  if (!db) return Response.json({ error: "db" }, { status: 503 });

  const status = new URL(req.url).searchParams.get("status") || "pending";
  try {
    const { partners, backend } = await listPartners(db, status);
    return Response.json({ partners, backend });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "db" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const full_name = String(body.full_name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const phone = String(body.phone || "").trim();
  const role = String(body.role || "").trim();
  const business = String(body.business || "").trim();
  const city = String(body.city || "").trim();
  const notes = String(body.notes || "").trim();

  if (!full_name || !email || !business) {
    return Response.json({ error: "incomplete" }, { status: 400 });
  }
  if (!roles.includes(role as (typeof roles)[number])) {
    return Response.json({ error: "role" }, { status: 400 });
  }

  const row = {
    full_name,
    email,
    phone,
    role,
    business,
    city,
    notes,
    status: "pending",
  };

  const db = getSupabase();
  let stored = false;
  if (db) {
    const result = await insertPartner(db, row);
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: 500 });
    }
    stored = true;
  }

  return Response.json({ ok: true, stored });
}
