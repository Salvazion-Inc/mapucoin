import type { SupabaseClient } from "@supabase/supabase-js";
import {
  publicPartners,
  type PartnerConnectRow,
  type PublicPartner,
} from "./partners";
import { getSupabase } from "./supabase";

const MARK = "mapucoin_p2:";

export type PartnerRecord = PartnerConnectRow & {
  full_name?: string;
  email?: string;
  phone?: string;
  business?: string;
  city?: string;
  notes?: string;
  role?: string;
  lat?: number | null;
  lng?: number | null;
  price_from_clp?: number | null;
  offer_summary?: string | null;
  landscape?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  reject_reason?: string | null;
  connect_country?: string | null;
  created_at?: string | null;
  source?: "partners" | "applications";
};

type Extra = {
  role?: string;
  city?: string;
  notes?: string;
  slug?: string | null;
  lat?: number | null;
  lng?: number | null;
  price_from_clp?: number | null;
  offer_summary?: string | null;
  landscape?: string | null;
  capsule_slug?: string | null;
  stripe_account_id?: string | null;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  details_submitted?: boolean;
  connect_country?: string | null;
  connect_blocked?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  reject_reason?: string | null;
};

const PARTNER_SELECT =
  "id, full_name, email, phone, role, business, city, notes, status, slug, lat, lng, price_from_clp, offer_summary, landscape, capsule_slug, stripe_account_id, charges_enabled, payouts_enabled, details_submitted, connect_country, connect_blocked, created_at, approved_at, rejected_at, reject_reason";

let tableState: "partners" | "applications" | null = null;

function missingTable(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  return (
    error.code === "PGRST205" ||
    /schema cache|does not exist/i.test(error.message || "")
  );
}

export async function partnerBackend(db: SupabaseClient) {
  if (tableState) return tableState;
  const { error } = await db.from("partners").select("id").limit(1);
  tableState = missingTable(error) ? "applications" : "partners";
  return tableState;
}

function parsePacked(notes: string): { extra: Extra; original: string; role?: string; city?: string } {
  const raw = notes || "";
  const idx = raw.indexOf(MARK);
  if (idx >= 0) {
    try {
      const extra = JSON.parse(raw.slice(idx + MARK.length)) as Extra;
      return {
        extra,
        original: String(extra.notes || raw.slice(0, idx).trim()),
        role: extra.role,
        city: extra.city,
      };
    } catch {
      /* legacy */
    }
  }
  const m = raw.match(/^\[mapucoin:([a-z_]+)\]\s*([^·\n]*)(?:[·\n]\s*([\s\S]*))?$/);
  if (m) {
    return {
      extra: {},
      original: (m[3] || "").trim(),
      role: m[1],
      city: m[2].trim(),
    };
  }
  return { extra: {}, original: raw };
}

function isMapucoinApplication(notes: string) {
  const n = notes || "";
  return n.includes(MARK) || n.includes("[mapucoin:");
}

function packNotes(human: string, extra: Extra) {
  const prefix = extra.role
    ? `[mapucoin:${extra.role}] ${extra.city || ""}${human ? ` · ${human}` : ""}\n`
    : human
      ? `${human}\n`
      : "";
  return `${prefix}${MARK}${JSON.stringify({ ...extra, notes: human })}`;
}

function fromPartners(row: Record<string, unknown>): PartnerRecord {
  return {
    ...(row as PartnerRecord),
    source: "partners",
  };
}

function fromApplication(row: Record<string, unknown>): PartnerRecord {
  const parsed = parsePacked(String(row.notes || ""));
  const e = parsed.extra;
  return {
    id: String(row.id),
    full_name: String(row.full_name || ""),
    email: String(row.email || ""),
    phone: String(row.phone || ""),
    role: String(e.role || parsed.role || row.role || ""),
    business: String(row.yacht_name || ""),
    city: String(e.city || parsed.city || ""),
    notes: parsed.original,
    status: String(row.status || "pending"),
    slug: e.slug ?? null,
    lat: e.lat ?? null,
    lng: e.lng ?? null,
    price_from_clp: e.price_from_clp ?? null,
    offer_summary: e.offer_summary ?? null,
    landscape: e.landscape ?? null,
    capsule_slug: e.capsule_slug ?? null,
    stripe_account_id: e.stripe_account_id ?? null,
    charges_enabled: Boolean(e.charges_enabled),
    payouts_enabled: Boolean(e.payouts_enabled),
    details_submitted: Boolean(e.details_submitted),
    connect_country: e.connect_country ?? null,
    connect_blocked: e.connect_blocked ?? null,
    created_at: (row.created_at as string) || null,
    approved_at: e.approved_at ?? null,
    rejected_at: e.rejected_at ?? null,
    reject_reason: e.reject_reason ?? null,
    source: "applications",
  };
}

export async function insertPartner(
  db: SupabaseClient,
  row: {
    full_name: string;
    email: string;
    phone: string;
    role: string;
    business: string;
    city: string;
    notes: string;
    status: string;
  },
) {
  const backend = await partnerBackend(db);
  if (backend === "partners") {
    const { error } = await db.from("partners").insert(row);
    if (!error) return { ok: true as const };
    if (!missingTable(error)) return { ok: false as const, error: error.message };
    tableState = "applications";
  }
  const { error } = await db.from("applications").insert({
    full_name: row.full_name,
    email: row.email,
    phone: row.phone,
    role: "owner",
    yacht_name: row.business,
    notes: packNotes(row.notes, { role: row.role, city: row.city }),
    status: row.status,
  });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function listPartners(
  db: SupabaseClient,
  status: string,
): Promise<{ partners: PartnerRecord[]; backend: "partners" | "applications" }> {
  const backend = await partnerBackend(db);
  if (backend === "partners") {
    let q = db
      .from("partners")
      .select(PARTNER_SELECT)
      .order("created_at", { ascending: false })
      .limit(200);
    if (status !== "all") q = q.eq("status", status);
    const { data, error } = await q;
    if (!error) {
      return {
        partners: (data || []).map((row) => fromPartners(row as Record<string, unknown>)),
        backend,
      };
    }
    if (!missingTable(error)) throw new Error(error.message);
    tableState = "applications";
  }

  const { data, error } = await db
    .from("applications")
    .select("id, full_name, email, phone, role, yacht_name, notes, status, created_at")
    .order("created_at", { ascending: false })
    .limit(400);
  if (error) throw new Error(error.message);
  const partners = (data || [])
    .filter((row) => isMapucoinApplication(String(row.notes || "")))
    .map((row) => fromApplication(row as Record<string, unknown>))
    .filter((row) => status === "all" || row.status === status);
  return { partners, backend: "applications" };
}

export async function getPartnerById(
  db: SupabaseClient,
  id: string,
): Promise<PartnerRecord | null> {
  const backend = await partnerBackend(db);
  if (backend === "partners") {
    const { data, error } = await db
      .from("partners")
      .select(PARTNER_SELECT)
      .eq("id", id)
      .maybeSingle();
    if (!error && data) return fromPartners(data as Record<string, unknown>);
    if (error && !missingTable(error)) return null;
  }
  const { data } = await db
    .from("applications")
    .select("id, full_name, email, phone, role, yacht_name, notes, status, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!data || !isMapucoinApplication(String(data.notes || ""))) return null;
  return fromApplication(data as Record<string, unknown>);
}

export async function getPartnerByEmail(
  db: SupabaseClient,
  email: string,
): Promise<PartnerRecord[]> {
  const backend = await partnerBackend(db);
  if (backend === "partners") {
    const { data, error } = await db
      .from("partners")
      .select(PARTNER_SELECT)
      .eq("email", email)
      .eq("status", "approved")
      .order("approved_at", { ascending: false })
      .limit(5);
    if (!error) return (data || []).map((row) => fromPartners(row as Record<string, unknown>));
    if (!missingTable(error)) return [];
  }
  const { data } = await db
    .from("applications")
    .select("id, full_name, email, phone, role, yacht_name, notes, status, created_at")
    .eq("email", email)
    .eq("status", "approved")
    .limit(8);
  return (data || [])
    .filter((row) => isMapucoinApplication(String(row.notes || "")))
    .map((row) => fromApplication(row as Record<string, unknown>));
}

export async function findPartnerForCapsule(
  db: SupabaseClient,
  slug: string,
  partnerId: string,
): Promise<PartnerRecord | null> {
  if (partnerId) {
    const row = await getPartnerById(db, partnerId);
    return row?.status === "approved" ? row : null;
  }
  const listed = await listPartners(db, "approved");
  return (
    listed.partners.find(
      (p) => p.slug === slug || p.capsule_slug === slug,
    ) || null
  );
}

export async function listApprovedPublic(
  db: SupabaseClient,
): Promise<PublicPartner[]> {
  const listed = await listPartners(db, "approved");
  return publicPartners(
    listed.partners.map((p) => ({
      id: p.id,
      slug: p.slug,
      business: p.business,
      city: p.city,
      role: p.role,
      lat: p.lat,
      lng: p.lng,
      price_from_clp: p.price_from_clp,
      offer_summary: p.offer_summary,
      landscape: p.landscape,
    })),
  );
}

export async function updatePartner(
  db: SupabaseClient,
  id: string,
  patch: Partial<PartnerRecord>,
): Promise<PartnerRecord | null> {
  const current = await getPartnerById(db, id);
  if (!current) return null;
  const next: PartnerRecord = { ...current, ...patch, id };
  const backend = await partnerBackend(db);

  if (backend === "partners" && current.source !== "applications") {
    const { error } = await db.from("partners").update(patch).eq("id", id);
    if (!error) return getPartnerById(db, id);
    if (!missingTable(error)) throw new Error(error.message);
  }

  const extra: Extra = {
    role: next.role,
    city: next.city,
    notes: next.notes,
    slug: next.slug ?? null,
    lat: next.lat ?? null,
    lng: next.lng ?? null,
    price_from_clp: next.price_from_clp ?? null,
    offer_summary: next.offer_summary ?? null,
    landscape: next.landscape ?? null,
    capsule_slug: next.capsule_slug ?? null,
    stripe_account_id: next.stripe_account_id ?? null,
    charges_enabled: Boolean(next.charges_enabled),
    payouts_enabled: Boolean(next.payouts_enabled),
    details_submitted: Boolean(next.details_submitted),
    connect_country: next.connect_country ?? null,
    connect_blocked: next.connect_blocked ?? null,
    approved_at: next.approved_at ?? null,
    rejected_at: next.rejected_at ?? null,
    reject_reason: next.reject_reason ?? null,
  };
  const { error } = await db
    .from("applications")
    .update({
      status: next.status,
      yacht_name: next.business,
      notes: packNotes(String(next.notes || ""), extra),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  return getPartnerById(db, id);
}

export async function syncStripeAccount(
  account: {
    id: string;
    charges_enabled?: boolean | null;
    payouts_enabled?: boolean | null;
    details_submitted?: boolean | null;
    country?: string | null;
    metadata?: Record<string, string> | null;
  },
) {
  const db = getSupabase();
  if (!db) return;
  const patch = {
    stripe_account_id: account.id,
    charges_enabled: Boolean(account.charges_enabled),
    payouts_enabled: Boolean(account.payouts_enabled),
    details_submitted: Boolean(account.details_submitted),
    connect_country: account.country || "CL",
    connect_blocked: null as string | null,
  };
  const listed = await listPartners(db, "all");
  const match =
    listed.partners.find((p) => p.stripe_account_id === account.id) ||
    listed.partners.find((p) => p.id === account.metadata?.partner_id);
  if (!match) return;
  await updatePartner(db, match.id, patch);
}
