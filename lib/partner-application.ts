import { validateChileanRut } from "./rut";

/**
 * Partner checklist (razón social, RUT, offer, photos).
 * Unset or any value other than 1/true/on is OFF, including Production.
 * Rollback is setting this to 0 and redeploying. It does not delete rows.
 */
export function partnerApplicationV2Enabled(
  env: NodeJS.ProcessEnv = process.env,
) {
  const raw = String(env.MAPUCOIN_PARTNER_APPLICATION_V2 || "")
    .trim()
    .toLowerCase();
  return raw === "1" || raw === "true" || raw === "on";
}

export const CHILE_REGIONS = [
  "Arica y Parinacota",
  "Tarapacá",
  "Antofagasta",
  "Atacama",
  "Coquimbo",
  "Valparaíso",
  "Metropolitana de Santiago",
  "O'Higgins",
  "Maule",
  "Ñuble",
  "Biobío",
  "La Araucanía",
  "Los Ríos",
  "Los Lagos",
  "Aysén del General Carlos Ibáñez del Campo",
  "Magallanes y de la Antártica Chilena",
] as const;

export const PARTNER_ROLES = [
  "capsula",
  "gastronomia",
  "actividad",
  "guia",
  "transporte",
  "vina",
] as const;

export type PartnerRole = (typeof PARTNER_ROLES)[number];
export type OfferUnit = "noche" | "persona" | "experiencia";
export type EntityType = "empresa" | "persona_natural";

/** At least 3 photos, at most 4. Four keeps a multipart post under the platform body limit. */
export const PARTNER_PHOTO_MIN = 3;
export const PARTNER_PHOTO_MAX = 4;
export const PARTNER_PHOTO_MAX_BYTES = 800_000;
/** Signed photo links for the reviewer. Ten minutes. */
export const PARTNER_PHOTO_SIGNED_SECONDS = 10 * 60;

/** Whole partner post, including up to 4 photos, stays under the platform body limit. */
export const PARTNER_BODY_MAX_BYTES = 3_600_000;

export function declaredBodyTooLarge(
  header: string | null | undefined,
  max = PARTNER_BODY_MAX_BYTES,
) {
  if (header == null || header.trim() === "") return false;
  const size = Number(header);
  return Number.isFinite(size) && size > max;
}

/** Stops reading once the body passes the cap, before it is parsed. */
export async function readCappedBody(
  req: Request,
  max = PARTNER_BODY_MAX_BYTES,
): Promise<{ ok: true; bytes: Uint8Array } | { ok: false; error: "photos_size" }> {
  if (declaredBodyTooLarge(req.headers.get("content-length"), max)) {
    return { ok: false, error: "photos_size" };
  }
  if (!req.body) return { ok: true, bytes: new Uint8Array() };
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > max) {
      await reader.cancel().catch(() => undefined);
      return { ok: false, error: "photos_size" };
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { ok: true, bytes };
}
export const PARTNER_PHOTO_BUCKET = "partner-application-photos";

const OFFER_UNITS = new Set<OfferUnit>(["noche", "persona", "experiencia"]);

export type PartnerOffer = {
  name: string;
  price_clp: number;
  unit: OfferUnit;
  min_stay_nights: number | null;
  capacity: number | null;
};

export type PartnerPhotoInput = {
  bytes: Uint8Array;
};

export type PartnerDossierPhoto = {
  path: string;
  url: string | null;
};

export type PartnerDossier = {
  legal_name: string;
  rut: string;
  entity_type: EntityType;
  category: PartnerRole;
  region: string;
  comuna: string;
  presence_url: string;
  description: string;
  offers: PartnerOffer[];
  sernatur_registered: boolean;
  sernatur_number: string | null;
  terms_accepted_at: string | null;
  terms_version: string | null;
  privacy_version: string | null;
  photos: PartnerDossierPhoto[];
};

export type ChecklistValue = {
  full_name: string;
  email: string;
  role: PartnerRole;
  business: string;
  legal_name: string;
  rut: string;
  entity_type: EntityType;
  region: string;
  comuna: string;
  presence_url: string;
  description: string;
  offers: PartnerOffer[];
  sernatur_registered: boolean;
  sernatur_number: string | null;
  terms_accepted: true;
};

export type ChecklistError =
  | "incomplete"
  | "email"
  | "email_mismatch"
  | "role"
  | "rut"
  | "entity_type"
  | "region"
  | "comuna"
  | "presence_url"
  | "description"
  | "offers"
  | "stay"
  | "photos"
  | "photos_type"
  | "photos_size"
  | "sernatur"
  | "terms";

const REGION_SET = new Set<string>(CHILE_REGIONS);

export function imageKind(
  bytes: Uint8Array,
): "image/jpeg" | "image/png" | "image/webp" | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

export function photoExtension(kind: NonNullable<ReturnType<typeof imageKind>>) {
  if (kind === "image/png") return "png";
  if (kind === "image/webp") return "webp";
  return "jpg";
}

function text(value: unknown) {
  return String(value ?? "").trim();
}

function validPresenceUrl(value: string) {
  if (value.length < 12 || value.length > 300) return false;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  if (url.username || url.password) return false;
  const host = url.hostname.toLowerCase();
  if (!host || host === "localhost" || host.endsWith(".local")) return false;
  if (host === "instagram.com" || host.endsWith(".instagram.com")) return true;
  return host.includes(".") && !/^\d+\.\d+\.\d+\.\d+$/.test(host);
}

function readFlag(value: unknown) {
  const raw = text(value).toLowerCase();
  if (["si", "sí", "yes", "true", "1", "on"].includes(raw)) return true;
  if (["no", "false", "0", "off"].includes(raw)) return false;
  return null;
}

function optionalCount(value: unknown, min: number, max: number) {
  if (value == null || value === "") return { ok: true as const, value: null };
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) return { ok: false as const };
  return { ok: true as const, value: n };
}

function parseOffers(value: unknown, role: PartnerRole) {
  let raw = value;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return { ok: false as const, error: "offers" as const };
    }
  }
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > 6) {
    return { ok: false as const, error: "offers" as const };
  }
  const offers: PartnerOffer[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") {
      return { ok: false as const, error: "offers" as const };
    }
    const row = item as Record<string, unknown>;
    const name = text(row.name).slice(0, 80);
    if (name.length < 2) return { ok: false as const, error: "offers" as const };
    const price = Number(row.price_clp);
    if (!Number.isInteger(price) || price < 1 || price > 50_000_000) {
      return { ok: false as const, error: "offers" as const };
    }
    const unit = text(row.unit) as OfferUnit;
    if (!OFFER_UNITS.has(unit)) {
      return { ok: false as const, error: "offers" as const };
    }
    const stay = optionalCount(row.min_stay_nights, 1, 90);
    const capacity = optionalCount(row.capacity, 1, 500);
    if (!stay.ok || !capacity.ok) {
      return { ok: false as const, error: "stay" as const };
    }
    const lodging = role === "capsula" || unit === "noche";
    if (lodging && (stay.value == null || capacity.value == null)) {
      return { ok: false as const, error: "stay" as const };
    }
    offers.push({
      name,
      price_clp: price,
      unit,
      min_stay_nights: stay.value,
      capacity: capacity.value,
    });
  }
  return { ok: true as const, offers };
}

export function validatePartnerChecklist(input: {
  full_name: unknown;
  email: unknown;
  account_email: unknown;
  role: unknown;
  business: unknown;
  legal_name: unknown;
  rut: unknown;
  entity_type: unknown;
  region: unknown;
  comuna: unknown;
  presence_url: unknown;
  description: unknown;
  offers: unknown;
  sernatur_registered: unknown;
  sernatur_number: unknown;
  terms_accepted: unknown;
  photos: PartnerPhotoInput[];
}): { ok: true; value: ChecklistValue } | { ok: false; error: ChecklistError } {
  const full_name = text(input.full_name);
  if (full_name.length < 2 || full_name.length > 120 || !/[\p{L}]/u.test(full_name)) {
    return { ok: false, error: "incomplete" };
  }
  const email = text(input.email).toLowerCase();
  const account = text(input.account_email).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
    return { ok: false, error: "email" };
  }
  if (!account || email !== account) return { ok: false, error: "email_mismatch" };

  const role = text(input.role) as PartnerRole;
  if (!PARTNER_ROLES.includes(role)) return { ok: false, error: "role" };

  const business = text(input.business);
  if (business.length < 2 || business.length > 160) {
    return { ok: false, error: "incomplete" };
  }
  const legal_name = text(input.legal_name);
  if (legal_name.length < 2 || legal_name.length > 160) {
    return { ok: false, error: "incomplete" };
  }

  const rut = validateChileanRut(text(input.rut));
  if (!rut.ok) return { ok: false, error: "rut" };

  const entity_type = text(input.entity_type) as EntityType;
  if (entity_type !== "empresa" && entity_type !== "persona_natural") {
    return { ok: false, error: "entity_type" };
  }

  const region = text(input.region);
  if (!REGION_SET.has(region)) return { ok: false, error: "region" };
  const comuna = text(input.comuna);
  if (
    comuna.length < 2 ||
    comuna.length > 80 ||
    !/^[\p{L}\d][\p{L}\d .'\u2019-]{1,79}$/u.test(comuna)
  ) {
    return { ok: false, error: "comuna" };
  }

  const presence_url = text(input.presence_url);
  if (!validPresenceUrl(presence_url)) {
    return { ok: false, error: "presence_url" };
  }

  const description = text(input.description);
  if (description.length < 20 || description.length > 600) {
    return { ok: false, error: "description" };
  }

  const offers = parseOffers(input.offers, role);
  if (!offers.ok) return offers;

  const registered = readFlag(input.sernatur_registered);
  if (registered == null) return { ok: false, error: "sernatur" };
  const sernatur_number = text(input.sernatur_number);
  if (registered) {
    if (!/^[A-Za-z0-9][A-Za-z0-9./-]{2,39}$/.test(sernatur_number)) {
      return { ok: false, error: "sernatur" };
    }
  } else if (sernatur_number) {
    return { ok: false, error: "sernatur" };
  }

  const accepted = readFlag(input.terms_accepted);
  if (accepted !== true) return { ok: false, error: "terms" };

  const photos = input.photos || [];
  if (photos.length < PARTNER_PHOTO_MIN || photos.length > PARTNER_PHOTO_MAX) {
    return { ok: false, error: "photos" };
  }
  for (const photo of photos) {
    if (photo.bytes.byteLength <= 0 || photo.bytes.byteLength > PARTNER_PHOTO_MAX_BYTES) {
      return { ok: false, error: "photos_size" };
    }
    if (!imageKind(photo.bytes)) return { ok: false, error: "photos_type" };
  }

  return {
    ok: true,
    value: {
      full_name,
      email,
      role,
      business,
      legal_name,
      rut: rut.rut,
      entity_type,
      region,
      comuna,
      presence_url,
      description,
      offers: offers.offers,
      sernatur_registered: registered,
      sernatur_number: registered ? sernatur_number : null,
      terms_accepted: true,
    },
  };
}
