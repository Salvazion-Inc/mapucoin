"use client";

import {
  destinations,
  formatCLP,
  interests,
  landscapePlaceSlug,
  landscapes,
  planCatalog,
  type Landscape,
} from "@/lib/catalog";
import { t, tr } from "@/lib/copy";
import { useLocale } from "@/lib/locale-context";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

export default function PlannerForm({
  compact = false,
  initialPlace = "san-pedro-de-atacama",
  onPlaceChange,
}: {
  compact?: boolean;
  initialPlace?: string;
  onPlaceChange?: (slug: string) => void;
}) {
  const { locale } = useLocale();
  const c = t(locale);
  const router = useRouter();
  const pathname = usePathname();
  const inApp = pathname.startsWith("/app");
  const seed = destinations.find((d) => d.slug === initialPlace) || destinations[0];
  const [land, setLand] = useState<Landscape>(seed.landscapes?.[0] || "desierto");
  const [place, setPlace] = useState(seed.slug);
  const [budget, setBudget] = useState(800000);
  const [nights, setNights] = useState(4);
  const [guests, setGuests] = useState(2);
  const [picked, setPicked] = useState<string[]>(["naturaleza", "gastronomia"]);

  const dests = useMemo(
    () => destinations.filter((d) => d.landscapes?.includes(land)),
    [land],
  );
  const dest = useMemo(
    () => destinations.find((d) => d.slug === place) || dests[0],
    [place, dests],
  );
  const preview = planCatalog(place);

  useEffect(() => {
    onPlaceChange?.(place);
  }, [place, onPlaceChange]);

  function pickLandscape(id: Landscape) {
    setLand(id);
    const featured = landscapePlaceSlug[id];
    const next =
      destinations.find((d) => d.slug === featured) ||
      destinations.find((d) => d.landscapes?.[0] === id) ||
      destinations[0];
    setPlace(next.slug);
  }

  function toggle(id: string) {
    setPicked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams({
      lugar: place,
      presupuesto: String(budget),
      noches: String(nights),
      viajeros: String(guests),
      intereses: picked.join(","),
    });
    if (inApp) {
      router.push(`/app/viaje?${q.toString()}`);
      return;
    }
    router.push(`/?${q.toString()}#planificar`);
    requestAnimationFrame(() => {
      document.getElementById("planificar")?.scrollIntoView({
        behavior: "smooth",
      });
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`rounded-[1.75rem] border border-gold/30 bg-black/80 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-md ${
        compact ? "p-5" : "p-6 md:p-8"
      }`}
    >
      <p className="kicker text-gold">{c.plan.formKicker}</p>
      <h2 className="font-display mt-2 text-2xl text-sand md:text-3xl">
        {c.plan.formTitle}
      </h2>
      <p className="mt-1 text-sm text-sand/70">{c.plan.formLead}</p>

      <p className="mt-6 text-sm font-medium text-sand">{c.plan.landscape}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {landscapes.map((ls) => (
          <button
            key={ls.id}
            type="button"
            onClick={() => pickLandscape(ls.id)}
            className={`rounded-full px-3 py-1 text-xs ${
              land === ls.id
                ? "bg-gold-deep text-white"
                : "border border-gold/30 text-sand hover:border-gold"
            }`}
          >
            {c.landscapes[ls.id]}
          </button>
        ))}
      </div>

      <label className="mt-4 block text-sm font-medium text-sand">
        {c.plan.place}
        <select
          className="mt-1 w-full rounded-xl border border-gold/25 bg-black px-3 py-2.5"
          value={place}
          onChange={(e) => {
            const slug = e.target.value;
            setPlace(slug);
            const d = destinations.find((x) => x.slug === slug);
            if (d?.landscapes?.[0]) setLand(d.landscapes[0]);
          }}
        >
          {dests.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.name}
            </option>
          ))}
        </select>
      </label>

      {preview.stay && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-gold/20">
          <div className="relative h-28">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview.stay.image}
              alt={preview.stay.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-night/90 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3 text-sand">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gold">
                {c.capsules.kicker}
              </p>
              <p className="font-display text-sm leading-tight">
                {preview.stay.name}
              </p>
            </div>
          </div>
        </div>
      )}

      <label className="mt-4 block text-sm font-medium text-sand">
        {tr(c.plan.budget, { price: formatCLP(budget) })}
        <input
          type="range"
          min={250000}
          max={3500000}
          step={50000}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="mt-2 w-full accent-gold"
        />
        <span className="flex justify-between text-xs text-sand/50">
          <span>{c.plan.budgetMin}</span>
          <span>{c.plan.budgetMax}</span>
        </span>
      </label>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="text-sm font-medium text-sand">
          {c.plan.nights}
          <input
            type="number"
            min={1}
            max={21}
            value={nights}
            onChange={(e) => setNights(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-gold/25 bg-black px-3 py-2.5"
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
            className="mt-1 w-full rounded-xl border border-gold/25 bg-black px-3 py-2.5"
          />
        </label>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-sand">{c.plan.interests}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {interests.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => toggle(i.id)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                picked.includes(i.id)
                  ? "bg-gold-deep text-white"
                  : "border border-gold/30 text-sand"
              }`}
            >
              {c.interests[i.id as keyof typeof c.interests]}
            </button>
          ))}
        </div>
      </div>

      {dest && (
        <p className="mt-4 text-xs text-sand/50">
          {tr(c.plan.fromDay, {
            price: formatCLP(dest.priceFromCLP),
            city: dest.city,
          })}
        </p>
      )}

      <button
        type="submit"
        className="mt-6 w-full rounded-full bg-gold-deep py-3.5 font-medium text-white transition hover:bg-gold-hot"
      >
        {c.plan.submit}
      </button>
    </form>
  );
}
