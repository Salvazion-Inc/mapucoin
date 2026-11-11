"use client";

import { t } from "@/lib/copy";
import { useLocale } from "@/lib/locale-context";
import {
  CHILE_REGIONS,
  PARTNER_PHOTO_MAX,
  PARTNER_PHOTO_MAX_BYTES,
  PARTNER_PHOTO_MIN,
  type OfferUnit,
} from "@/lib/partner-application";
import { preparePartnerPhoto } from "@/lib/prepare-partner-photo";
import {
  herePath,
  redirectForStatus,
  redirectUnlessVerified,
} from "@/lib/service-redirect";
import { useSessionIdentity } from "@/lib/use-session-identity";
import { FormEvent, useEffect, useMemo, useState } from "react";

const roleIds = [
  "capsula",
  "gastronomia",
  "actividad",
  "guia",
  "transporte",
  "vina",
] as const;

const units: OfferUnit[] = ["noche", "persona", "experiencia"];

type OfferDraft = {
  key: string;
  name: string;
  price: string;
  unit: OfferUnit;
  minStay: string;
  capacity: string;
};

function blankOffer(unit: OfferUnit): OfferDraft {
  return {
    key: crypto.randomUUID(),
    name: "",
    price: "",
    unit,
    minStay: "",
    capacity: "",
  };
}

function unitForRole(role: string): OfferUnit {
  if (role === "capsula") return "noche";
  if (role === "gastronomia" || role === "transporte") return "persona";
  return "experiencia";
}

export default function PartnerChecklistForm() {
  const { locale } = useLocale();
  const c = t(locale);
  const d = c.partners.dossier;
  const identity = useSessionIdentity();
  const [status, setStatus] = useState<"idle" | "ok" | "err" | "loading">("idle");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<(typeof roleIds)[number]>("capsula");
  const [legalName, setLegalName] = useState("");
  const [rut, setRut] = useState("");
  const [entityType, setEntityType] = useState<"empresa" | "persona_natural">("empresa");
  const [region, setRegion] = useState("");
  const [comuna, setComuna] = useState("");
  const [presenceUrl, setPresenceUrl] = useState("");
  const [description, setDescription] = useState("");
  const [offers, setOffers] = useState<OfferDraft[]>([blankOffer("noche")]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoNote, setPhotoNote] = useState("");
  const [sernatur, setSernatur] = useState<"si" | "no" | "">("");
  const [sernaturNumber, setSernaturNumber] = useState("");
  const [terms, setTerms] = useState(false);

  useEffect(() => {
    if (!identity) return;
    setFullName((current) => current || identity.name);
    setEmail(identity.email);
  }, [identity]);

  const previews = useMemo(
    () => photos.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [photos],
  );
  useEffect(() => {
    return () => {
      for (const item of previews) URL.revokeObjectURL(item.url);
    };
  }, [previews]);

  function fail(text: string) {
    setStatus("err");
    setMessage(text);
  }

  function messageFor(code: string) {
    if (code === "email") return c.partners.invalidEmail;
    if (code === "email_mismatch") return d.emailMismatch;
    if (code === "rut") return d.rutInvalid;
    if (code === "presence_url") return d.presenceInvalid;
    if (code === "offers") return d.offerNeed;
    if (code === "stay") return d.stayNeed;
    if (code === "photos") return d.photosNeed;
    if (code === "photos_type") return d.photosType;
    if (code === "photos_size") return d.photosSize;
    if (code === "sernatur") return d.sernaturNeed;
    if (code === "terms") return d.termsNeed;
    if (code === "dossier_store") return d.dossierStore;
    if (code === "rate_limited") return c.reserva.rateLimited;
    return d.incompleteV2;
  }

  async function onPhotos(list: FileList | null) {
    const picked = Array.from(list || []);
    if (picked.length < PARTNER_PHOTO_MIN || picked.length > PARTNER_PHOTO_MAX) {
      setPhotos([]);
      setPhotoNote(d.photosNeed);
      return;
    }
    const prepared: File[] = [];
    for (const file of picked) {
      const next = await preparePartnerPhoto(file, PARTNER_PHOTO_MAX_BYTES).catch(
        () => file,
      );
      if (next.size > PARTNER_PHOTO_MAX_BYTES) {
        setPhotos([]);
        setPhotoNote(d.photosSize);
        return;
      }
      prepared.push(next);
    }
    setPhotos(prepared);
    setPhotoNote("");
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const website = String(new FormData(form).get("website") || "");
    if (fullName.trim().length < 2 || !legalName.trim()) {
      fail(d.incompleteV2);
      return;
    }
    if (photos.length < PARTNER_PHOTO_MIN) {
      fail(d.photosNeed);
      return;
    }
    if (!terms) {
      fail(d.termsNeed);
      return;
    }
    setStatus("loading");
    const next = herePath().includes("#") ? herePath() : `${herePath()}#partners`;
    if (await redirectUnlessVerified(next)) return;

    const fd = new FormData();
    fd.set("website", website);
    fd.set("full_name", fullName.trim());
    fd.set("email", (identity?.email || email).trim());
    fd.set("role", role);
    fd.set("business", String(new FormData(form).get("business") || ""));
    fd.set("legal_name", legalName.trim());
    fd.set("rut", rut.trim());
    fd.set("entity_type", entityType);
    fd.set("region", region);
    fd.set("comuna", comuna.trim());
    fd.set("presence_url", presenceUrl.trim());
    fd.set("description", description.trim());
    fd.set(
      "offers_json",
      JSON.stringify(
        offers.map((offer) => ({
          name: offer.name.trim(),
          price_clp: Number(offer.price.replace(/\D/g, "")),
          unit: offer.unit,
          min_stay_nights: offer.minStay ? Number(offer.minStay) : null,
          capacity: offer.capacity ? Number(offer.capacity) : null,
        })),
      ),
    );
    fd.set("sernatur_registered", sernatur);
    fd.set("sernatur_number", sernatur === "si" ? sernaturNumber.trim() : "");
    fd.set("terms_accepted", terms ? "true" : "false");
    for (const file of photos) fd.append("photos", file);

    const res = await fetch("/api/partners", { method: "POST", body: fd }).catch(
      () => null,
    );
    const body = res ? await res.json().catch(() => ({})) : {};
    if (res && redirectForStatus(res.status, body.error, next)) return;
    if (!res || !res.ok) {
      fail(messageFor(String(body.error || "")));
      return;
    }
    setPreview(Boolean(body.preview));
    setStatus("ok");
    setMessage(
      body.preview ? c.partners.previewOk : body.stored ? c.partners.ok : c.partners.okNoDb,
    );
  }

  if (status === "ok") {
    return (
      <div className="reserva-glass space-y-4 rounded-[1.75rem] p-6 md:p-8">
        <p className="kicker">{c.partners.kicker}</p>
        <h3 className="font-display text-3xl text-sand">
          {preview ? c.partners.previewOk : c.partners.ok}
        </h3>
        {preview ? null : <p className="text-sand/80">{c.partners.okLead}</p>}
        <p className="text-sm text-sand/55">{c.partners.privacy}</p>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => {
            setStatus("idle");
            setMessage("");
            setPreview(false);
          }}
        >
          {c.partners.another}
        </button>
      </div>
    );
  }

  const unitLabel: Record<OfferUnit, string> = {
    noche: d.unitNoche,
    persona: d.unitPersona,
    experiencia: d.unitExperiencia,
  };
  const field =
    "mt-1 w-full rounded-xl border border-earth/15 bg-black/50 px-3 py-2.5";

  return (
    <form
      onSubmit={onSubmit}
      data-partner-checklist="on"
      className="reserva-glass relative space-y-6 rounded-[1.75rem] p-6 md:p-8"
    >
      <fieldset className="space-y-4">
        <legend className="text-xs tracking-[0.16em] text-gold uppercase">
          {d.legalKicker}
        </legend>
        <label className="block text-sm font-medium text-sand">
          {c.partners.name}
          <input
            name="full_name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={120}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={field}
          />
        </label>
        <label className="block text-sm font-medium text-sand">
          {d.legalName}
          <input
            name="legal_name"
            required
            minLength={2}
            maxLength={160}
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
            className={field}
          />
        </label>
        <label className="block text-sm font-medium text-sand">
          {d.rut}
          <input
            name="rut"
            required
            inputMode="text"
            autoComplete="off"
            placeholder={d.rutPlaceholder}
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            className={field}
          />
        </label>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-sand">{d.entityType}</legend>
          <label className="flex items-center gap-2 text-sm text-sand/90">
            <input
              type="radio"
              name="entity_type"
              value="empresa"
              checked={entityType === "empresa"}
              onChange={() => setEntityType("empresa")}
              required
            />
            {d.entityEmpresa}
          </label>
          <label className="flex items-center gap-2 text-sm text-sand/90">
            <input
              type="radio"
              name="entity_type"
              value="persona_natural"
              checked={entityType === "persona_natural"}
              onChange={() => setEntityType("persona_natural")}
            />
            {d.entityPersona}
          </label>
        </fieldset>
      </fieldset>

      <fieldset className="space-y-4 border-t border-gold/15 pt-4">
        <legend className="text-xs tracking-[0.16em] text-gold uppercase">
          {c.partners.business}
        </legend>
        <label className="block text-sm font-medium text-sand">
          {c.partners.role}
          <select
            name="role"
            required
            value={role}
            onChange={(e) => {
              const next = e.target.value as (typeof roleIds)[number];
              setRole(next);
              setOffers((current) =>
                current.map((offer, index) =>
                  index === 0 ? { ...offer, unit: unitForRole(next) } : offer,
                ),
              );
            }}
            className={field}
          >
            {roleIds.map((id) => (
              <option key={id} value={id}>
                {c.partnerRoles[id]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-sand">
          {c.partners.business}
          <input name="business" required maxLength={160} className={field} />
        </label>
        <label className="block text-sm font-medium text-sand">
          {d.region}
          <select
            name="region"
            required
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className={field}
          >
            <option value="" disabled>
              {d.regionPlaceholder}
            </option>
            {CHILE_REGIONS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-sand">
          {d.comuna}
          <input
            name="comuna"
            required
            minLength={2}
            maxLength={80}
            value={comuna}
            onChange={(e) => setComuna(e.target.value)}
            className={field}
          />
        </label>
        <label className="block text-sm font-medium text-sand">
          {d.presenceUrl}
          <input
            name="presence_url"
            type="url"
            required
            inputMode="url"
            value={presenceUrl}
            onChange={(e) => setPresenceUrl(e.target.value)}
            className={field}
          />
          <span className="mt-1 block text-xs font-normal text-sand/50">{d.presenceHint}</span>
        </label>
        <label className="block text-sm font-medium text-sand">
          {d.description}
          <textarea
            name="description"
            required
            minLength={20}
            maxLength={600}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={field}
          />
          <span className="mt-1 block text-xs font-normal text-sand/50">
            {d.descriptionHint}
          </span>
        </label>
      </fieldset>

      <fieldset className="space-y-4 border-t border-gold/15 pt-4">
        <legend className="text-xs tracking-[0.16em] text-gold uppercase">
          {d.offerKicker}
        </legend>
        {offers.map((offer, index) => (
          <div key={offer.key} className="space-y-3 rounded-2xl border border-earth/15 p-3">
            <label className="block text-sm font-medium text-sand">
              {d.offerName}
              <input
                required
                maxLength={80}
                value={offer.name}
                onChange={(e) =>
                  setOffers((current) =>
                    current.map((item) =>
                      item.key === offer.key ? { ...item, name: e.target.value } : item,
                    ),
                  )
                }
                className={field}
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-medium text-sand">
                {d.offerPrice}
                <input
                  required
                  inputMode="numeric"
                  value={offer.price}
                  onChange={(e) =>
                    setOffers((current) =>
                      current.map((item) =>
                        item.key === offer.key ? { ...item, price: e.target.value } : item,
                      ),
                    )
                  }
                  className={field}
                />
              </label>
              <label className="block text-sm font-medium text-sand">
                {d.offerUnit}
                <select
                  value={offer.unit}
                  onChange={(e) =>
                    setOffers((current) =>
                      current.map((item) =>
                        item.key === offer.key
                          ? { ...item, unit: e.target.value as OfferUnit }
                          : item,
                      ),
                    )
                  }
                  className={field}
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unitLabel[unit]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-sand">
                {d.minStay}
                <input
                  inputMode="numeric"
                  min={1}
                  max={90}
                  value={offer.minStay}
                  onChange={(e) =>
                    setOffers((current) =>
                      current.map((item) =>
                        item.key === offer.key ? { ...item, minStay: e.target.value } : item,
                      ),
                    )
                  }
                  className={field}
                />
              </label>
              <label className="block text-sm font-medium text-sand">
                {d.capacity}
                <input
                  inputMode="numeric"
                  min={1}
                  max={500}
                  value={offer.capacity}
                  onChange={(e) =>
                    setOffers((current) =>
                      current.map((item) =>
                        item.key === offer.key ? { ...item, capacity: e.target.value } : item,
                      ),
                    )
                  }
                  className={field}
                />
              </label>
            </div>
            {index > 0 ? (
              <button
                type="button"
                className="btn-ghost text-xs"
                onClick={() =>
                  setOffers((current) => current.filter((item) => item.key !== offer.key))
                }
              >
                {d.removeOffer}
              </button>
            ) : null}
          </div>
        ))}
        {offers.length < 6 ? (
          <button
            type="button"
            className="btn-ghost text-sm"
            onClick={() => setOffers((current) => [...current, blankOffer(unitForRole(role))])}
          >
            {d.addOffer}
          </button>
        ) : null}
      </fieldset>

      <fieldset className="space-y-3 border-t border-gold/15 pt-4">
        <legend className="text-xs tracking-[0.16em] text-gold uppercase">
          {d.photosKicker}
        </legend>
        <div className="block text-sm font-medium text-sand">
          {d.photosLabel}
          <label className="mt-2 flex w-fit cursor-pointer">
            <span className="btn-ghost px-4 py-2 text-sm">{d.photosChoose}</span>
            <input
              name="photos"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              required={photos.length < PARTNER_PHOTO_MIN}
              onChange={(e) => {
                void onPhotos(e.target.files);
              }}
              className="sr-only"
            />
          </label>
          <span className="mt-1 block text-xs font-normal text-sand/50">{d.photosHint}</span>
        </div>
        {photoNote ? <p className="text-sm text-clay">{photoNote}</p> : null}
        {previews.length > 0 ? (
          <ul className="grid grid-cols-3 gap-2">
            {previews.map((item) => (
              <li key={item.url}>
                <img
                  src={item.url}
                  alt={d.adminPhotoAlt}
                  className="h-24 w-full rounded-xl object-cover"
                />
              </li>
            ))}
          </ul>
        ) : null}
      </fieldset>

      <fieldset className="space-y-3 border-t border-gold/15 pt-4">
        <legend className="text-xs tracking-[0.16em] text-gold uppercase">
          {d.permitKicker}
        </legend>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-sand">{d.sernaturQuestion}</legend>
          <label className="flex items-center gap-2 text-sm text-sand/90">
            <input
              type="radio"
              name="sernatur_registered"
              value="si"
              checked={sernatur === "si"}
              onChange={() => setSernatur("si")}
              required
            />
            {d.sernaturYes}
          </label>
          <label className="flex items-center gap-2 text-sm text-sand/90">
            <input
              type="radio"
              name="sernatur_registered"
              value="no"
              checked={sernatur === "no"}
              onChange={() => {
                setSernatur("no");
                setSernaturNumber("");
              }}
            />
            {d.sernaturNo}
          </label>
        </fieldset>
        {sernatur === "si" ? (
          <label className="block text-sm font-medium text-sand">
            {d.sernaturNumber}
            <input
              name="sernatur_number"
              required
              maxLength={40}
              value={sernaturNumber}
              onChange={(e) => setSernaturNumber(e.target.value)}
              className={field}
            />
          </label>
        ) : null}
        <label className="flex items-start gap-2 text-sm text-sand">
          <input
            type="checkbox"
            name="terms_accepted"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            required
            className="mt-1"
          />
          <span>
            {d.termsPrefix}{" "}
            <a href="/terminos" className="underline" target="_blank" rel="noreferrer">
              {d.termsLink}
            </a>{" "}
            {d.termsAnd}{" "}
            <a href="/privacidad" className="underline" target="_blank" rel="noreferrer">
              {d.privacyLink}
            </a>
            .
          </span>
        </label>
      </fieldset>

      <label className="block text-sm font-medium text-sand">
        {c.partners.email}
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          readOnly={Boolean(identity?.email)}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${field}${identity?.email ? " opacity-70" : ""}`}
        />
        <span className="mt-1 block text-xs font-normal text-sand/50">{d.emailLocked}</span>
      </label>

      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          {c.partners.website}
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <p className="text-xs text-sand/50">{c.partners.privacy}</p>
      <button
        disabled={status === "loading"}
        className="btn-gold w-full py-3.5 disabled:opacity-60"
      >
        {status === "loading" ? c.partners.sending : c.partners.submit}
      </button>
      {status === "err" && (
        <p className="text-clay" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}
