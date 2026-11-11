import { adminAuthorized } from "@/lib/admin";
import {
  honeypotFilled,
  isEmail,
  isPersonName,
  originAllowed,
  originRejectedResponse,
} from "@/lib/http-guard";
import {
  PARTNER_PHOTO_MAX,
  PARTNER_PHOTO_MAX_BYTES,
  partnerApplicationV2Enabled,
  validatePartnerChecklist,
} from "@/lib/partner-application";
import { attachPartnerDossiers, assertDossierStore, deleteOwnPendingApplication, removePartnerPhotos, savePartnerDossier, uploadPartnerPhotos } from "@/lib/partner-application-store";
import { partnerDelivery } from "@/lib/partner-delivery";
import { insertPartner, listPartners } from "@/lib/partner-store";
import {
  clientIp,
  rateLimit,
  rateLimitedResponse,
} from "@/lib/rate-limit";
import { getSupabase } from "@/lib/supabase";
import { requireVerifiedAccount } from "@/lib/verified-access";

export const runtime = "nodejs";

const roles = [
  "capsula",
  "gastronomia",
  "actividad",
  "guia",
  "transporte",
  "vina",
] as const;

async function readSubmission(req: Request) {
  const type = req.headers.get("content-type") || "";
  if (type.includes("multipart/form-data")) {
    const form = await req.formData().catch(() => null);
    if (!form) return { ok: false as const, error: "incomplete" };
    const body: Record<string, unknown> = {};
    const photos: File[] = [];
    for (const [key, value] of form.entries()) {
      if (key === "photos" && value instanceof File) photos.push(value);
      else if (typeof value === "string") body[key] = value;
    }
    return { ok: true as const, body, photos };
  }
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: true as const, body, photos: [] as File[] };
}

async function photoInputs(files: File[]) {
  if (files.length > PARTNER_PHOTO_MAX) {
    return { ok: false as const, error: "photos" };
  }
  const photos: { bytes: Uint8Array }[] = [];
  for (const file of files) {
    if (file.size > PARTNER_PHOTO_MAX_BYTES) {
      return { ok: false as const, error: "photos_size" };
    }
    photos.push({ bytes: new Uint8Array(await file.arrayBuffer()) });
  }
  return { ok: true as const, photos };
}

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
    const { partners, backend } = await listPartners(db, status, { scope: "admin" });
    const visible = await attachPartnerDossiers(db, partners);
    return Response.json(
      { partners: visible, backend },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "db" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const gate = await requireVerifiedAccount(req);
  if (!gate.ok) return gate.response;

  if (!originAllowed(req)) return originRejectedResponse();

  const limited = rateLimit(`partners:${clientIp(req)}`, 5, 10 * 60 * 1000);
  if (!limited.ok) return rateLimitedResponse(limited.retryAfter);

  const submission = await readSubmission(req);
  if (!submission.ok) {
    return Response.json({ error: submission.error }, { status: 400 });
  }
  if (honeypotFilled(submission.body)) {
    return Response.json({ ok: true, stored: true });
  }

  const body = submission.body;
  if (partnerApplicationV2Enabled()) {
    const loaded = await photoInputs(submission.photos);
    if (!loaded.ok) return Response.json({ error: loaded.error }, { status: 400 });
    const validated = validatePartnerChecklist({
      full_name: body.full_name,
      email: body.email,
      account_email: gate.user.email,
      role: body.role,
      business: body.business,
      legal_name: body.legal_name,
      rut: body.rut,
      entity_type: body.entity_type,
      region: body.region,
      comuna: body.comuna,
      presence_url: body.presence_url,
      description: body.description,
      offers: body.offers_json ?? body.offers,
      sernatur_registered: body.sernatur_registered,
      sernatur_number: body.sernatur_number,
      terms_accepted: body.terms_accepted,
      photos: loaded.photos,
    });
    if (!validated.ok) {
      return Response.json({ error: validated.error }, { status: 400 });
    }

    const delivery = partnerDelivery();
    if (!delivery.store) {
      return Response.json({
        ok: true,
        stored: false,
        preview: true,
        notified: false,
      });
    }

    const db = getSupabase();
    if (!db) return Response.json({ error: "dossier_store" }, { status: 503 });
    const ready = await assertDossierStore(db);
    if (!ready.ok) return Response.json({ error: "dossier_store" }, { status: 503 });

    const uploaded = await uploadPartnerPhotos(db, gate.user.id, loaded.photos);
    if (!uploaded.ok) {
      return Response.json({ error: "dossier_store" }, { status: 503 });
    }
    const value = validated.value;
    const result = await insertPartner(db, {
      full_name: value.full_name,
      email: value.email,
      phone: "",
      role: value.role,
      business: value.business,
      city: value.comuna,
      notes: value.description,
      status: "pending",
    });
    if (!result.ok) {
      await removePartnerPhotos(db, uploaded.paths);
      return Response.json({ error: result.error }, { status: 500 });
    }
    const saved = await savePartnerDossier(db, {
      ...value,
      application_id: result.id,
      application_source: result.source,
      account_id: gate.user.id,
      photo_paths: uploaded.paths,
      terms_accepted_at: new Date().toISOString(),
    });
    if (!saved.ok) {
      await deleteOwnPendingApplication(db, result.id, result.source);
      await removePartnerPhotos(db, uploaded.paths);
      return Response.json({ error: "dossier_store" }, { status: 503 });
    }
    return Response.json({
      ok: true,
      stored: true,
      preview: false,
      notified: false,
    });
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

  const delivery = partnerDelivery();
  if (!delivery.store) {
    return Response.json({
      ok: true,
      stored: false,
      preview: true,
      notified: false,
    });
  }

  const db = getSupabase();
  let stored = false;
  if (db) {
    const result = await insertPartner(db, row);
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: 500 });
    }
    stored = true;
  }

  return Response.json({
    ok: true,
    stored,
    preview: false,
    notified: delivery.notify,
  });
}
