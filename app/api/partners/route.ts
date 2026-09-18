import { adminAuthorized } from "@/lib/admin";
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

const ADMIN_COLUMNS =
  "id, full_name, email, phone, role, business, city, notes, status, slug, lat, lng, price_from_clp, offer_summary, landscape, capsule_slug, stripe_account_id, charges_enabled, payouts_enabled, details_submitted, connect_country, connect_blocked, created_at, approved_at, rejected_at";

export async function GET(req: Request) {
  if (!adminAuthorized(req)) {
    return Response.json({ error: "admin" }, { status: 401 });
  }
  const db = getSupabase();
  if (!db) return Response.json({ error: "db" }, { status: 503 });

  const status = new URL(req.url).searchParams.get("status") || "pending";
  let q = db
    .from("partners")
    .select(ADMIN_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(200);
  if (status !== "all") q = q.eq("status", status);

  const { data, error } = await q;
  if (!error) return Response.json({ partners: data || [] });

  const { data: basic, error: basicErr } = await db
    .from("partners")
    .select("id, full_name, email, phone, role, business, city, notes, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (basicErr) return Response.json({ error: error.message }, { status: 500 });
  const rows =
    status === "all"
      ? basic || []
      : (basic || []).filter((row) => row.status === status);
  return Response.json({ partners: rows, schema: "legacy" });
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
