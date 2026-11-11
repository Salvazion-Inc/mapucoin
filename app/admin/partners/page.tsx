"use client";

import { destinations, formatCLP, landscapes } from "@/lib/catalog";
import type { OfferUnit, PartnerDossier } from "@/lib/partner-application";
import { partnerApplicationCopy } from "@/lib/partner-application-copy";
import { catalogHint } from "@/lib/partners";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

const dossierCopy = partnerApplicationCopy.es;

const SECRET_KEY = "mapucoin_admin_secret";

type PartnerRow = {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  role?: string;
  business?: string;
  city?: string;
  notes?: string;
  status?: string;
  slug?: string | null;
  lat?: number | null;
  lng?: number | null;
  price_from_clp?: number | null;
  offer_summary?: string | null;
  landscape?: string | null;
  capsule_slug?: string | null;
  charges_enabled?: boolean | null;
  payouts_enabled?: boolean | null;
  stripe_account_id?: string | null;
  created_at?: string | null;
  dossier?: PartnerDossier;
};

type StatusFilter = "pending" | "approved" | "rejected";

function headers(secret: string) {
  return {
    Authorization: `Bearer ${secret}`,
    "Content-Type": "application/json",
  };
}

export default function AdminPartnersPage() {
  const [secret, setSecret] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(
    async (token: string, status: StatusFilter) => {
      setBusy(true);
      setError("");
      const res = await fetch(`/api/partners?status=${status}`, {
        headers: headers(token),
      }).catch(() => null);
      setBusy(false);
      if (!res) {
        setError("No se pudo conectar.");
        return false;
      }
      if (res.status === 401) {
        setError("Secret incorrecto o ausente.");
        setUnlocked(false);
        return false;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Error al listar.");
        return false;
      }
      setPartners(Array.isArray(data.partners) ? data.partners : []);
      setUnlocked(true);
      return true;
    },
    [],
  );

  useEffect(() => {
    const stored = sessionStorage.getItem(SECRET_KEY) || "";
    if (!stored) return;
    setSecret(stored);
    load(stored, filter);
  }, [filter, load]);

  async function unlock(e: FormEvent) {
    e.preventDefault();
    const token = secret.trim();
    if (!token) {
      setError("Ingresa MAPUCOIN_ADMIN_SECRET.");
      return;
    }
    const ok = await load(token, filter);
    if (ok) sessionStorage.setItem(SECRET_KEY, token);
  }

  function logout() {
    sessionStorage.removeItem(SECRET_KEY);
    setUnlocked(false);
    setPartners([]);
    setSecret("");
  }

  if (!unlocked) {
    return (
      <form onSubmit={unlock} className="reserva-glass mx-auto max-w-md space-y-4 rounded-[1.75rem] p-7">
        <p className="kicker">Admin</p>
        <h1 className="font-display text-3xl">Partners</h1>
        <p className="text-sm text-sand/65">
          Página interna. No aparece en el menú. Usa el mismo secret que
          MAPUCOIN_ADMIN_SECRET (o AUTH_SECRET).
        </p>
        <label className="block text-sm">
          Secret
          <input
            type="password"
            autoComplete="current-password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="mt-1 w-full rounded-xl border border-earth/15 bg-black/50 px-3 py-2.5"
          />
        </label>
        <button className="btn-gold w-full" disabled={busy}>
          {busy ? "Entrando…" : "Entrar"}
        </button>
        {error && <p className="text-sm text-clay">{error}</p>}
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="kicker">Admin</p>
          <h1 className="font-display text-3xl">Partners</h1>
        </div>
        <button type="button" className="btn-ghost text-sm" onClick={logout}>
          Cerrar
        </button>
      </header>
      <div className="flex flex-wrap gap-2">
        {(["pending", "approved", "rejected"] as StatusFilter[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`rounded-full px-4 py-1.5 text-sm ${
              filter === id ? "bg-gold-deep text-white" : "border border-gold/30"
            }`}
          >
            {id}
          </button>
        ))}
      </div>
      {notice && <p className="text-sm text-moss">{notice}</p>}
      {error && <p className="text-sm text-clay">{error}</p>}
      {busy && <p className="text-sm text-sand/60">Cargando…</p>}
      {!busy && partners.length === 0 && (
        <p className="reserva-glass rounded-3xl p-6 text-sand/70">
          No hay postulaciones {filter}. No se inventan partners.
        </p>
      )}
      <ul className="space-y-5">
        {partners.map((p) => (
          <li key={p.id}>
            <PartnerCard
              partner={p}
              secret={secret}
              onDone={async (msg) => {
                setNotice(msg);
                await load(secret, filter);
              }}
              onError={setError}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function unitLabel(unit: OfferUnit) {
  if (unit === "noche") return dossierCopy.unitNoche;
  if (unit === "persona") return dossierCopy.unitPersona;
  return dossierCopy.unitExperiencia;
}

function PartnerDossierView({ dossier }: { dossier: PartnerDossier }) {
  const entity =
    dossier.entity_type === "persona_natural"
      ? dossierCopy.entityPersona
      : dossierCopy.entityEmpresa;
  const accepted = dossier.terms_accepted_at
    ? new Date(dossier.terms_accepted_at).toLocaleString("es-CL")
    : "";
  return (
    <div className="mt-4 space-y-3 rounded-2xl border border-gold/20 p-4 text-sm">
      <p className="text-xs tracking-[0.16em] text-gold uppercase">
        {dossierCopy.adminLegal}
      </p>
      <p>
        {dossier.legal_name} · {dossierCopy.rut} {dossier.rut} · {dossierCopy.adminEntity}{" "}
        {entity}
      </p>
      <p>
        {dossierCopy.adminRegion} {dossier.region} · {dossierCopy.adminComuna} {dossier.comuna}
      </p>
      <p>
        {dossierCopy.adminPresence}{" "}
        <a
          href={dossier.presence_url}
          className="underline"
          target="_blank"
          rel="noreferrer"
        >
          {dossier.presence_url}
        </a>
      </p>
      <p>
        {dossierCopy.adminDescription} {dossier.description}
      </p>
      <div>
        <p className="text-sand/70">{dossierCopy.adminOffers}</p>
        <ul className="mt-1 space-y-1">
          {dossier.offers.map((item) => (
            <li key={`${item.name}-${item.price_clp}-${item.unit}`}>
              {item.name} · {formatCLP(item.price_clp)} · {unitLabel(item.unit)}
              {item.min_stay_nights
                ? ` · ${dossierCopy.minStay} ${item.min_stay_nights}`
                : ""}
              {item.capacity ? ` · ${dossierCopy.capacity} ${item.capacity}` : ""}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-sand/70">{dossierCopy.adminPhotos}</p>
        <ul className="mt-2 grid grid-cols-3 gap-2">
          {dossier.photos.map((photo) => (
            <li key={photo.path}>
              {photo.url ? (
                <a href={photo.url} target="_blank" rel="noreferrer">
                  <img
                    src={photo.url}
                    alt={dossierCopy.adminPhotoAlt}
                    className="h-28 w-full rounded-xl object-cover"
                  />
                </a>
              ) : (
                <p className="flex h-28 items-center justify-center rounded-xl border border-earth/20 text-xs text-sand/50">
                  {dossierCopy.adminPhotoMissing}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
      <p>
        {dossierCopy.adminSernatur}{" "}
        {dossier.sernatur_registered && dossier.sernatur_number
          ? dossier.sernatur_number
          : dossierCopy.adminSernaturNone}
      </p>
      <p>
        {dossierCopy.adminTerms}
        {accepted ? ` ${accepted}` : ""}
      </p>
    </div>
  );
}

function PartnerCard({
  partner,
  secret,
  onDone,
  onError,
}: {
  partner: PartnerRow;
  secret: string;
  onDone: (msg: string) => Promise<void>;
  onError: (msg: string) => void;
}) {
  const hint = useMemo(
    () => catalogHint(partner.dossier?.comuna || partner.city || ""),
    [partner.city, partner.dossier?.comuna],
  );
  const firstOffer = partner.dossier?.offers?.[0];
  const [lat, setLat] = useState(String(partner.lat ?? hint?.lat ?? ""));
  const [lng, setLng] = useState(String(partner.lng ?? hint?.lng ?? ""));
  const [price, setPrice] = useState(
    String(partner.price_from_clp || firstOffer?.price_clp || ""),
  );
  const [slug, setSlug] = useState(partner.slug || partner.capsule_slug || "");
  const [landscape, setLandscape] = useState(
    partner.landscape || hint?.landscape || "desierto",
  );
  const [offer, setOffer] = useState(
    partner.offer_summary || partner.dossier?.description || partner.notes || "",
  );
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  function applyHint() {
    if (!hint) return;
    setLat(String(hint.lat));
    setLng(String(hint.lng));
    if (hint.landscape) setLandscape(hint.landscape);
  }

  function applyDestination(city: string) {
    const d = destinations.find((x) => x.city === city);
    if (!d) return;
    setLat(String(d.lat));
    setLng(String(d.lng));
    if (d.landscapes?.[0]) setLandscape(d.landscapes[0]);
  }

  async function approve(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/partners/approve", {
      method: "POST",
      headers: headers(secret),
      body: JSON.stringify({
        id: partner.id,
        lat: Number(lat),
        lng: Number(lng),
        price_from_clp: Number(price),
        slug,
        landscape,
        offer_summary: offer,
        city: partner.city,
      }),
    }).catch(() => null);
    setBusy(false);
    if (!res) return onError("Red.");
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) return onError("Secret incorrecto.");
    if (!res.ok) return onError(data.error || "No se pudo aprobar.");
    await onDone(`Aprobado: ${partner.business || partner.id}`);
  }

  async function reject() {
    setBusy(true);
    const res = await fetch("/api/partners/reject", {
      method: "POST",
      headers: headers(secret),
      body: JSON.stringify({ id: partner.id, reason }),
    }).catch(() => null);
    setBusy(false);
    if (!res) return onError("Red.");
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) return onError("Secret incorrecto.");
    if (!res.ok) return onError(data.error || "No se pudo rechazar.");
    await onDone(`Rechazado: ${partner.business || partner.id}`);
  }

  return (
    <article className="reserva-glass rounded-[1.5rem] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.16em] text-gold uppercase">
            {partner.role} · {partner.city || "—"}
          </p>
          <h2 className="font-display mt-1 text-2xl">
            {partner.business || "Sin negocio"}
          </h2>
          <p className="mt-1 text-sm text-sand/70">
            {partner.full_name} · {partner.email}
            {partner.phone ? ` · ${partner.phone}` : ""}
          </p>
        </div>
        <p className="text-xs text-sand/45">{partner.status}</p>
      </div>
      {partner.dossier ? <PartnerDossierView dossier={partner.dossier} /> : null}
      {partner.notes && partner.notes !== partner.dossier?.description && (
        <p className="mt-3 text-sm text-sand/75">{partner.notes}</p>
      )}
      {partner.status === "approved" && (
        <p className="mt-3 text-xs text-sand/55">
          slug {partner.slug || "—"} · Connect{" "}
          {partner.charges_enabled && partner.payouts_enabled
            ? "listo"
            : partner.stripe_account_id
              ? "en curso"
              : "pendiente"}
          {partner.price_from_clp
            ? ` · ${formatCLP(partner.price_from_clp)}`
            : ""}
        </p>
      )}
      {partner.status === "pending" && (
        <form onSubmit={approve} className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="text-xs">
            Destino catálogo (coords reales)
            <select
              className="mt-1 w-full rounded-xl border border-earth/15 bg-black/50 px-3 py-2"
              defaultValue={partner.city || ""}
              onChange={(e) => applyDestination(e.target.value)}
            >
              <option value="">Elegir…</option>
              {destinations.map((d) => (
                <option key={d.slug} value={d.city}>
                  {d.city}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="btn-ghost self-end text-xs"
            onClick={applyHint}
          >
            Usar coords del territorio
          </button>
          <label className="text-xs">
            lat
            <input
              required
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="mt-1 w-full rounded-xl border border-earth/15 bg-black/50 px-3 py-2"
            />
          </label>
          <label className="text-xs">
            lng
            <input
              required
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="mt-1 w-full rounded-xl border border-earth/15 bg-black/50 px-3 py-2"
            />
          </label>
          <label className="text-xs">
            Precio desde (CLP)
            <input
              required
              type="number"
              min={1}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 w-full rounded-xl border border-earth/15 bg-black/50 px-3 py-2"
            />
          </label>
          <label className="text-xs">
            slug
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="capsula-atacama-star"
              className="mt-1 w-full rounded-xl border border-earth/15 bg-black/50 px-3 py-2"
            />
          </label>
          <label className="text-xs">
            paisaje
            <select
              value={landscape}
              onChange={(e) => setLandscape(e.target.value)}
              className="mt-1 w-full rounded-xl border border-earth/15 bg-black/50 px-3 py-2"
            >
              {landscapes.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs sm:col-span-2">
            oferta
            <textarea
              required
              rows={3}
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              className="mt-1 w-full rounded-xl border border-earth/15 bg-black/50 px-3 py-2"
            />
          </label>
          <button className="btn-gold sm:col-span-2" disabled={busy}>
            {busy ? "Guardando…" : "Aprobar"}
          </button>
          <label className="text-xs sm:col-span-2">
            Motivo de rechazo
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 w-full rounded-xl border border-earth/15 bg-black/50 px-3 py-2"
            />
          </label>
          <button
            type="button"
            className="btn-ghost sm:col-span-2"
            disabled={busy}
            onClick={reject}
          >
            Rechazar
          </button>
        </form>
      )}
    </article>
  );
}
