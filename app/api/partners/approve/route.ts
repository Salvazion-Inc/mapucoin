import { adminAuthorized } from "@/lib/admin";
import { getPartnerById, listPartners, updatePartner } from "@/lib/partner-store";
import {
  catalogHint,
  inChile,
  isLandscape,
  slugify,
} from "@/lib/partners";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

async function uniqueSlug(
  db: NonNullable<ReturnType<typeof getSupabase>>,
  raw: string,
  excludeId: string,
) {
  const base = slugify(raw) || `partner-${excludeId.slice(0, 8)}`;
  const { partners } = await listPartners(db, "all");
  const taken = new Set(
    partners
      .filter((p) => p.id !== excludeId && p.slug)
      .map((p) => String(p.slug)),
  );
  if (!taken.has(base)) return base;
  for (let i = 2; i < 14; i += 1) {
    const slug = `${base}-${i}`;
    if (!taken.has(slug)) return slug;
  }
  return `${base}-${excludeId.slice(0, 8)}`;
}

export async function POST(req: Request) {
  if (!adminAuthorized(req)) {
    return Response.json({ error: "admin" }, { status: 401 });
  }

  const db = getSupabase();
  if (!db) return Response.json({ error: "db" }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const id = String(body.id || "").trim();
  if (!id) return Response.json({ error: "id" }, { status: 400 });

  const current = await getPartnerById(db, id);
  if (!current) return Response.json({ error: "not_found" }, { status: 404 });
  if (current.status === "rejected") {
    return Response.json({ error: "rejected" }, { status: 409 });
  }

  const hint = catalogHint(String(body.city || current.city || ""));
  const lat = Number(body.lat ?? current.lat ?? hint?.lat);
  const lng = Number(body.lng ?? current.lng ?? hint?.lng);
  if (!inChile(lat, lng)) {
    return Response.json({ error: "geo" }, { status: 400 });
  }

  const price = Math.round(
    Number(body.price_from_clp ?? current.price_from_clp),
  );
  if (!Number.isFinite(price) || price <= 0) {
    return Response.json({ error: "price_from_clp" }, { status: 400 });
  }

  const offer_summary = String(
    body.offer_summary ?? current.offer_summary ?? "",
  ).trim();
  if (!offer_summary) {
    return Response.json({ error: "offer_summary" }, { status: 400 });
  }

  const landscapeRaw = String(
    body.landscape ?? current.landscape ?? hint?.landscape ?? "",
  ).trim();
  if (!isLandscape(landscapeRaw)) {
    return Response.json({ error: "landscape" }, { status: 400 });
  }

  const slug = await uniqueSlug(
    db,
    String(body.slug || current.slug || current.business || ""),
    id,
  );

  const capsule_slug = String(
    body.capsule_slug ?? current.capsule_slug ?? "",
  ).trim();

  try {
    const partner = await updatePartner(db, id, {
      status: "approved",
      slug,
      lat,
      lng,
      price_from_clp: price,
      offer_summary,
      landscape: landscapeRaw,
      capsule_slug: capsule_slug || null,
      approved_at: new Date().toISOString(),
      rejected_at: null,
      reject_reason: null,
    });
    return Response.json({ ok: true, partner });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "db" },
      { status: 500 },
    );
  }
}
