"use client";

import { capsules, formatCLP, getBySlug } from "@/lib/catalog";
import { t, tr } from "@/lib/copy";
import { useLocale } from "@/lib/locale-context";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";

function ReservaInner() {
  const { locale } = useLocale();
  const c = t(locale);
  const params = useSearchParams();
  const initial = params.get("capsula") || capsules[0].slug;
  const [slug, setSlug] = useState(initial);
  const [nights, setNights] = useState(Number(params.get("noches") || 2));
  const [guests, setGuests] = useState(Number(params.get("viajeros") || 2));
  const [status, setStatus] = useState("");
  const item = useMemo(() => getBySlug(slug), [slug]);
  const total = (item?.priceFromCLP || 0) * nights;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus(c.reserva.creating);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        capsula: slug,
        nights,
        guests,
        full_name: form.get("full_name"),
        email: form.get("email"),
        phone: form.get("phone"),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 503) {
      setStatus(c.reserva.noStripe);
      return;
    }
    if (!res.ok || !data.url) {
      setStatus(c.reserva.fail);
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div className="page-pad mx-auto grid max-w-5xl gap-10 px-4 pb-16 lg:grid-cols-2">
      <div>
        <p className="kicker text-gold">{c.reserva.kicker}</p>
        <h1 className="font-display mt-3 text-4xl text-sand">
          {c.reserva.title}
        </h1>
        {params.get("cancel") && (
          <p className="mt-3 text-sm text-clay">{c.reserva.canceled}</p>
        )}
        {item && (
          <div className="relative mt-6 h-56 overflow-hidden rounded-3xl">
            <Image src={item.image} alt={item.name} fill className="object-cover" />
          </div>
        )}
        <p className="mt-4 text-sand/75">
          {tr(c.reserva.summary, {
            name: item?.name || "",
            city: item?.city || "",
            nights: `${nights} ${nights > 1 ? c.reserva.nights : c.reserva.night}`,
            guests: `${guests} ${guests > 1 ? c.reserva.guests : c.reserva.guest}`,
            total: formatCLP(total),
          })}
        </p>
      </div>
      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-[1.75rem] border border-gold/20 bg-black p-7"
      >
        <label className="block text-sm font-medium text-sand">
          {c.reserva.capsule}
          <select
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-1 w-full rounded-xl border border-earth/15 px-3 py-2.5"
          >
            {capsules.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name} · {formatCLP(c.priceFromCLP)}/noche
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
              onChange={(e) => setNights(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-earth/15 px-3 py-2.5"
            />
          </label>
          <label className="text-sm font-medium text-sand">
            {c.plan.guests}
            <input
              type="number"
              min={1}
              max={8}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-earth/15 px-3 py-2.5"
            />
          </label>
        </div>
        <label className="block text-sm font-medium text-sand">
          {c.reserva.name}
          <input
            name="full_name"
            required
            className="mt-1 w-full rounded-xl border border-earth/15 px-3 py-2.5"
          />
        </label>
        <label className="block text-sm font-medium text-sand">
          {c.reserva.email}
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-xl border border-earth/15 px-3 py-2.5"
          />
        </label>
        <label className="block text-sm font-medium text-sand">
          {c.reserva.phone}
          <input
            name="phone"
            className="mt-1 w-full rounded-xl border border-earth/15 px-3 py-2.5"
          />
        </label>
        <button className="w-full rounded-full bg-gold py-3.5 text-black hover:bg-[#e3c25a]">
          {c.reserva.pay} · {formatCLP(total)}
        </button>
        {status && <p className="text-sm text-sand/70">{status}</p>}
      </form>
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
