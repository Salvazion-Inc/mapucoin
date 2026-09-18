import {
  destinations,
  landscapes,
  type Landscape,
} from "./catalog";

export const DEFAULT_FEE_BPS = 1200;
export const CONNECT_COUNTRY = "CL";

export const PUBLIC_PARTNER_COLUMNS =
  "id, slug, business, city, role, lat, lng, price_from_clp, offer_summary, landscape";

export type PublicPartner = {
  id: string;
  slug: string;
  business: string;
  city: string;
  role: string;
  lat: number;
  lng: number;
  price_from_clp: number;
  offer_summary: string;
  landscape: Landscape | null;
};

export type PartnerConnectRow = {
  id: string;
  slug?: string | null;
  capsule_slug?: string | null;
  stripe_account_id?: string | null;
  charges_enabled?: boolean | null;
  payouts_enabled?: boolean | null;
  details_submitted?: boolean | null;
  connect_blocked?: string | null;
  status?: string | null;
};

const landscapeIds = new Set(landscapes.map((l) => l.id));

export function isLandscape(value: unknown): value is Landscape {
  return typeof value === "string" && landscapeIds.has(value as Landscape);
}

export function platformFeeBps() {
  const n = Number(process.env.MAPUCOIN_PLATFORM_FEE_BPS);
  if (!Number.isFinite(n) || n < 0 || n > 10000) return DEFAULT_FEE_BPS;
  return Math.round(n);
}

/** CLP has no decimals. Fee is always < amount so Stripe accepts it. */
export function platformFeeClp(amount: number, bps = platformFeeBps()) {
  const total = Math.round(Number(amount) || 0);
  if (total <= 1) return 0;
  const fee = Math.round((total * bps) / 10000);
  return Math.min(total - 1, Math.max(0, fee));
}

export function isConnectReady(row: PartnerConnectRow | null | undefined) {
  const id = String(row?.stripe_account_id || "");
  return Boolean(
    row &&
      /^acct_[A-Za-z0-9]+$/.test(id) &&
      row.charges_enabled &&
      row.payouts_enabled,
  );
}

export function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return slug;
}

/** Mainland + Rapa Nui + Juan Fernández. Rejects invented overseas coords. */
export function inChile(lat: number, lng: number) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat < -57 || lat > -17) return false;
  if (lng < -110.5 || lng > -66) return false;
  return true;
}

export function catalogHint(city: string) {
  const q = city.trim().toLowerCase();
  if (!q) return null;
  const d = destinations.find(
    (x) =>
      x.city.toLowerCase() === q ||
      x.slug === q ||
      x.name.toLowerCase() === q,
  );
  if (!d) return null;
  return {
    lat: d.lat,
    lng: d.lng,
    landscape: (d.landscapes?.[0] as Landscape | undefined) || null,
    city: d.city,
  };
}

export function toPublicPartner(
  row: Record<string, unknown> | null | undefined,
): PublicPartner | null {
  if (!row) return null;
  const slug = String(row.slug || "").trim();
  const lat = Number(row.lat);
  const lng = Number(row.lng);
  if (!slug || !inChile(lat, lng)) return null;
  const id = String(row.id || "").trim();
  if (!id) return null;
  return {
    id,
    slug,
    business: String(row.business || "").slice(0, 160),
    city: String(row.city || "").slice(0, 80),
    role: String(row.role || "").slice(0, 40),
    lat,
    lng,
    price_from_clp: Math.max(0, Math.round(Number(row.price_from_clp) || 0)),
    offer_summary: String(row.offer_summary || "").slice(0, 280),
    landscape: isLandscape(row.landscape) ? row.landscape : null,
  };
}

export function publicPartners(rows: unknown[] | null | undefined) {
  return (rows || [])
    .map((row) => toPublicPartner(row as Record<string, unknown>))
    .filter((p): p is PublicPartner => Boolean(p?.id && p.business));
}
