"use client";

import { capsules, formatCLP, getBySlug } from "@/lib/catalog";
import { localizeItem } from "@/lib/catalog-i18n";
import { t, tr } from "@/lib/copy";
import { useLocale } from "@/lib/locale-context";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

function ReservaInner() {
  const { locale } = useLocale();
  const c = t(locale);
  const params = useSearchParams();
  const initial = params.get("capsula") || capsules[0].slug;
  const [slug, setSlug] = useState(initial);
  const [nights, setNights] = useState(
    Math.min(21, Math.max(1, Number(params.get("noches") || 2))),
  );
  const [guests, setGuests] = useState(
    Math.min(8, Math.max(1, Number(params.get("viajeros") || 2))),
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const item = useMemo(() => getBySlug(slug), [slug]);
  const shown = item ? localizeItem(item, locale) : null;
  const total = (item?.priceFromCLP || 0) * nights;
  const canceled = params.get("cancel") === "1";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const fullName = name.trim();
    const mail = email.trim();
    if (fullName.length < 2) {
      setStatus(c.reserva.invalidName);
      return;
    }
    if (!validEmail(mail)) {
      setStatus(c.reserva.invalidEmail);
      return;
    }
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setStatus(c.reserva.creating);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        capsula: slug,
        nights,
        guests,
        full_name: fullName,
        email: mail,
        phone: form.get("phone"),
        website: form.get("website"),
      }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (!res) {
      setBusy(false);
      setStatus(c.reserva.fail);
      return;
    }
    if (res.status === 429) {
      setBusy(false);
      setStatus(c.reserva.rateLimited);
      return;
    }
    if (res.status === 503) {
      setBusy(false);
      setStatus(c.reserva.noStripe);
      return;
    }
    if (res.status === 400 && data.error === "profile") {
      setBusy(false);
      setStatus(c.reserva.invalidEmail);
      return;
    }
    if (!res.ok || !data.url) {
      setBusy(false);
      setStatus(c.reserva.fail);
      return;
    }
    setStatus(c.reserva.paying);
    window.location.href = data.url;
  }

  return (
    <div className="page-pad mx-auto max-w-5xl px-4 pb-16">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="kicker text-gold">{c.reserva.kicker}</p>
          <h1 className="font-display mt-3 text-4xl text-sand md:text-5xl">
            {c.reserva.title}
          </h1>
          {canceled && (
            <p className="mt-3 rounded-2xl border border-clay/40 bg-clay/10 px-4 py-3 text-sm text-sand">
              {c.reserva.canceled}
            </p>
          )}
          {shown && item && (
            <div className="reserva-glass relative mt-6 overflow-hidden rounded-[1.75rem]">
              <div className="relative h-56 sm:h-72">
                <Image
                  src={shown.image}
                  alt={shown.name}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-night via-night/25 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-xs tracking-[0.18em] text-gold uppercase">
                    {shown.city}
                    {shown.landscapes?.length
                      ? ` · ${shown.landscapes.map((id) => c.landscapes[id]).join(" · ")}`
                      : ""}
                  </p>
                  <h2 className="font-display mt-1 text-2xl text-sand sm:text-3xl">
                    {shown.name}
                  </h2>
                </div>
              </div>
              <div className="space-y-4 p-5 sm:p-6">
                <p className="text-sand/80">{shown.tagline}</p>
                <div>
                  <p className="text-xs tracking-[0.16em] text-gold uppercase">
                    {c.reserva.included}
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm text-sand/85">
                    {shown.highlights.map((h) => (
                      <li key={h}>· {h}</li>
                    ))}
                  </ul>
                </div>
                <p className="font-display text-3xl text-sand">
                  {formatCLP(item.priceFromCLP)}
                  <span className="ml-2 text-base font-sans text-sand/55">
                    {c.reserva.perNight}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={onSubmit}
          className="reserva-glass relative h-fit space-y-4 rounded-[1.75rem] p-5 sm:p-7"
        >
          <label className="block text-sm font-medium text-sand">
            {c.reserva.capsule}
            <select
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1 w-full rounded-xl border border-earth/15 bg-black/50 px-3 py-2.5"
            >
              {capsules.map((cap) => (
                <option key={cap.slug} value={cap.slug}>
                  {cap.name} · {formatCLP(cap.priceFromCLP)}/{c.reserva.night}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-medium text-sand">
              {c.plan.nights}
              <input
                type="number"
                min={1}
                max={21}
                value={nights}
                onChange={(e) =>
                  setNights(Math.min(21, Math.max(1, Number(e.target.value) || 1)))
                }
                className="mt-1 w-full rounded-xl border border-earth/15 bg-black/50 px-3 py-2.5"
              />
            </label>
            <label className="text-sm font-medium text-sand">
              {c.plan.guests}
              <input
                type="number"
                min={1}
                max={8}
                value={guests}
                onChange={(e) =>
                  setGuests(Math.min(8, Math.max(1, Number(e.target.value) || 1)))
                }
                className="mt-1 w-full rounded-xl border border-earth/15 bg-black/50 px-3 py-2.5"
              />
            </label>
          </div>
          <label className="block text-sm font-medium text-sand">
            {c.reserva.name}
            <input
              name="full_name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={120}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-earth/15 bg-black/50 px-3 py-2.5"
            />
          </label>
          <label className="block text-sm font-medium text-sand">
            {c.reserva.email}
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-earth/15 bg-black/50 px-3 py-2.5"
            />
          </label>
          <label className="block text-sm font-medium text-sand">
            {c.reserva.phone}
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              className="mt-1 w-full rounded-xl border border-earth/15 bg-black/50 px-3 py-2.5"
            />
          </label>
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              website
              <input
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </label>
          </div>
          <div className="rounded-2xl border border-gold/20 bg-black/35 px-4 py-3">
            <p className="text-xs tracking-[0.14em] text-gold uppercase">
              {c.reserva.totalLabel}
            </p>
            <p className="font-display mt-1 text-3xl text-sand">{formatCLP(total)}</p>
            <p className="mt-1 text-xs text-sand/55">
              {tr(c.reserva.summary, {
                name: shown?.name || "",
                city: shown?.city || "",
                nights: `${nights} ${nights > 1 ? c.reserva.nights : c.reserva.night}`,
                guests: `${guests} ${guests > 1 ? c.reserva.guests : c.reserva.guest}`,
                total: formatCLP(total),
              })}
            </p>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="btn-gold w-full py-3.5 disabled:opacity-60"
          >
            {busy ? c.reserva.paying : `${c.reserva.pay} · ${formatCLP(total)}`}
          </button>
          <p className="text-center text-sm text-sand/70">{c.reserva.secure}</p>
          <p className="text-center text-xs text-sand/50">{c.reserva.platformNote}</p>
          {status && (
            <p
              className={`text-sm ${
                status === c.reserva.fail ||
                status === c.reserva.invalidEmail ||
                status === c.reserva.invalidName ||
                status === c.reserva.rateLimited ||
                status === c.reserva.noStripe
                  ? "text-clay"
                  : "text-sand/70"
              }`}
              role="status"
            >
              {status}
            </p>
          )}
          <div className="flex flex-col gap-2 pt-1 sm:flex-row">
            <Link href="/#mapa" className="btn-ghost flex-1 text-center text-sm">
              {c.reserva.backMap}
            </Link>
            {item && (
              <Link
                href={`/capsulas/${item.slug}`}
                className="btn-ghost flex-1 text-center text-sm"
              >
                {c.reserva.backCapsule}
              </Link>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function ReservaFallback() {
  const { locale } = useLocale();
  return <div className="p-12">{t(locale).plan.loadPlanner}</div>;
}

export default function ReservaPage() {
  return (
    <Suspense fallback={<ReservaFallback />}>
      <ReservaInner />
    </Suspense>
  );
}
