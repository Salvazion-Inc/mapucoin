import { adminAuthorized } from "@/lib/admin";
import {
  honeypotFilled,
  isEmail,
  isPersonName,
  originAllowed,
  originRejectedResponse,
} from "@/lib/http-guard";
import { insertPartner, listPartners } from "@/lib/partner-store";
import {
  clientIp,
  rateLimit,
  rateLimitedResponse,
} from "@/lib/rate-limit";
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
  const limited = rateLimit(`partners-admin:${clientIp(req)}`, 40, 60 * 1000);
  if (!limited.ok) return rateLimitedResponse(limited.retryAfter);
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
  if (!originAllowed(req)) return originRejectedResponse();

  const limited = rateLimit(`partners:${clientIp(req)}`, 5, 10 * 60 * 1000);
  if (!limited.ok) return rateLimitedResponse(limited.retryAfter);

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (honeypotFilled(body)) {
    return Response.json({ ok: true, stored: true });
  }

  const full_name = String(body.full_name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const phone = String(body.phone || "").trim().slice(0, 40);
  const role = String(body.role || "").trim();
  const business = String(body.business || "").trim().slice(0, 160);
  const city = String(body.city || "").trim().slice(0, 80);
  const notes = String(body.notes || "").trim().slice(0, 2000);

  if (!isPersonName(full_name) || !business) {
    return Response.json({ error: "incomplete" }, { status: 400 });
  }
  if (!isEmail(email)) {
    return Response.json({ error: "email" }, { status: 400 });
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
