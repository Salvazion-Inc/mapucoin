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
    const { error: partnerErr } = await db.from("partners").insert(row);
    if (!partnerErr) {
      stored = true;
    } else {
      const { error: appErr } = await db.from("applications").insert({
        full_name,
        email,
        phone,
        role: "owner",
        yacht_name: business,
        notes: `[mapucoin:${role}] ${city}${notes ? ` · ${notes}` : ""}`,
        status: "pending",
      });
      if (appErr) {
        return Response.json({ error: appErr.message }, { status: 500 });
      }
      stored = true;
    }
  }

  return Response.json({ ok: true, stored });
}
