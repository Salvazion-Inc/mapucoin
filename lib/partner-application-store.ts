import type { SupabaseClient } from "@supabase/supabase-js";
import {
  PARTNER_PHOTO_BUCKET,
  imageKind,
  photoExtension,
  type ChecklistValue,
  type PartnerDossier,
  type PartnerOffer,
  type PartnerPhotoInput,
} from "./partner-application";

function missingRelation(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    /schema cache|does not exist|bucket not found/i.test(error.message || "")
  );
}

export async function assertDossierStore(db: SupabaseClient) {
  const table = await db.from("partner_application_details").select("id").limit(1);
  if (table.error) {
    return { ok: false as const, error: "dossier_store" };
  }
  const bucket = await db.storage.getBucket(PARTNER_PHOTO_BUCKET);
  if (bucket.error || !bucket.data || bucket.data.public) {
    return { ok: false as const, error: "dossier_store" };
  }
  return { ok: true as const };
}

export async function uploadPartnerPhotos(
  db: SupabaseClient,
  accountId: string,
  photos: PartnerPhotoInput[],
) {
  const folder = `${accountId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 48) || "account"}/${crypto.randomUUID()}`;
  const paths: string[] = [];
  for (let i = 0; i < photos.length; i += 1) {
    const kind = imageKind(photos[i].bytes);
    if (!kind) {
      await removePartnerPhotos(db, paths);
      return { ok: false as const, error: "photos_type" };
    }
    const path = `${folder}/${i + 1}.${photoExtension(kind)}`;
    const { error } = await db.storage.from(PARTNER_PHOTO_BUCKET).upload(path, photos[i].bytes, {
      contentType: kind,
      upsert: false,
    });
    if (error) {
      await removePartnerPhotos(db, paths);
      return { ok: false as const, error: "dossier_store" };
    }
    paths.push(path);
  }
  return { ok: true as const, paths };
}

export async function removePartnerPhotos(db: SupabaseClient, paths: string[]) {
  if (!paths.length) return;
  await db.storage.from(PARTNER_PHOTO_BUCKET).remove(paths).catch(() => undefined);
}

export async function savePartnerDossier(
  db: SupabaseClient,
  row: ChecklistValue & {
    application_id: string;
    application_source: "partners" | "applications";
    account_id: string;
    photo_paths: string[];
    terms_accepted_at: string;
  },
) {
  const { error } = await db.from("partner_application_details").insert({
    application_id: row.application_id,
    application_source: row.application_source,
    account_id: row.account_id,
    account_email: row.email,
    legal_name: row.legal_name,
    rut: row.rut,
    entity_type: row.entity_type,
    category: row.role,
    region: row.region,
    comuna: row.comuna,
    presence_url: row.presence_url,
    description: row.description,
    offers: row.offers,
    sernatur_registered: row.sernatur_registered,
    sernatur_number: row.sernatur_number,
    terms_accepted_at: row.terms_accepted_at,
    photo_paths: row.photo_paths,
  });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function deleteOwnPendingApplication(
  db: SupabaseClient,
  id: string,
  source: "partners" | "applications",
) {
  let query = db.from(source).delete().eq("id", id).eq("status", "pending");
  if (source === "applications") query = query.like("notes", "%mapucoin%");
  await query;
}

function asOffers(value: unknown): PartnerOffer[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => item && typeof item === "object") as PartnerOffer[];
}

async function signedPhotoMap(db: SupabaseClient, paths: string[]) {
  const unique = [...new Set(paths.filter(Boolean))];
  const map = new Map<string, string | null>();
  if (!unique.length) return map;
  const signed = await db.storage
    .from(PARTNER_PHOTO_BUCKET)
    .createSignedUrls(unique, 60 * 60);
  if (signed.error || !signed.data) {
    for (const path of unique) map.set(path, null);
    return map;
  }
  for (const item of signed.data) {
    const path = String(item.path || "");
    map.set(path, item.error ? null : item.signedUrl || null);
  }
  return map;
}

export async function attachPartnerDossiers<T extends { id: string }>(
  db: SupabaseClient,
  partners: T[],
): Promise<(T & { dossier?: PartnerDossier })[]> {
  if (!partners.length) return partners;
  try {
    const ids = partners.map((partner) => partner.id).filter(Boolean);
    const { data, error } = await db
      .from("partner_application_details")
      .select(
        "application_id, legal_name, rut, entity_type, category, region, comuna, presence_url, description, offers, sernatur_registered, sernatur_number, terms_accepted_at, photo_paths",
      )
      .in("application_id", ids);
    if (error || !data) {
      if (error && !missingRelation(error)) return partners;
      return partners;
    }
    const rows = data as Record<string, unknown>[];
    const paths = rows.flatMap((row) =>
      Array.isArray(row.photo_paths) ? (row.photo_paths as string[]) : [],
    );
    const urls = await signedPhotoMap(db, paths);
    const byId = new Map(rows.map((row) => [String(row.application_id), row]));
    return partners.map((partner) => {
      const row = byId.get(partner.id);
      if (!row) return partner;
      const photoPaths = Array.isArray(row.photo_paths)
        ? (row.photo_paths as string[])
        : [];
      const dossier: PartnerDossier = {
        legal_name: String(row.legal_name || ""),
        rut: String(row.rut || ""),
        entity_type:
          row.entity_type === "persona_natural" ? "persona_natural" : "empresa",
        category: (row.category as PartnerDossier["category"]) || "capsula",
        region: String(row.region || ""),
        comuna: String(row.comuna || ""),
        presence_url: String(row.presence_url || ""),
        description: String(row.description || ""),
        offers: asOffers(row.offers),
        sernatur_registered: Boolean(row.sernatur_registered),
        sernatur_number: row.sernatur_number ? String(row.sernatur_number) : null,
        terms_accepted_at: row.terms_accepted_at
          ? String(row.terms_accepted_at)
          : null,
        photos: photoPaths.map((path) => ({
          path,
          url: urls.get(path) ?? null,
        })),
      };
      return { ...partner, dossier };
    });
  } catch {
    return partners;
  }
}
