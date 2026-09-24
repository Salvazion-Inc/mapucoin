"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import MapLoader from "@/components/MapLoader";
import { at } from "@/lib/app-copy";
import {
  destinations,
  formatCLP,
  type Landscape,
} from "@/lib/catalog";
import { localizeItem } from "@/lib/catalog-i18n";
import { t } from "@/lib/copy";
import { formatKm, haversineKm } from "@/lib/geo";
import type { Locale } from "@/lib/locale";
import { useLocale } from "@/lib/locale-context";
import { useLocation } from "@/lib/location";

const EXPLORE_VIDEO: Record<Locale, string> = {
  es: "/videos/explore-chile-es.mp4",
  en: "/videos/why-chile-en.mp4",
  pt: "/videos/explore-chile-pt.mp4",
  fr: "/videos/explore-chile-fr.mp4",
  it: "/videos/why-chile-en.mp4",
  de: "/videos/explore-chile-de.mp4",
};

const EXPLORE_POSTER: Record<Locale, string> = {
  es: "/images/why-chile-es.jpg",
  en: "/images/why-chile-en.jpg",
  pt: "/images/why-chile-pt.jpg",
  fr: "/images/why-chile-fr.jpg",
  it: "/images/why-chile-en.jpg",
  de: "/images/why-chile-de.jpg",
};

export function ExploreTab() {
  const { locale } = useLocale();
  const a = at(locale);
  const c = t(locale);
  const film = EXPLORE_VIDEO[locale];
  const { here, located, locating, denied, locate } = useLocation();
  const [land, setLand] = useState<Landscape | "all">("all");
  const [query, setQuery] = useState("");

  const ranked = useMemo(() => {
    const q = query.trim().toLowerCase();
    return destinations
      .filter((d) => land === "all" || d.landscapes?.includes(land))
      .map((d) => ({
        item: localizeItem(d, locale),
        km: haversineKm(here, d),
      }))
      .filter(({ item }) => {
        if (!q) return true;
        return (
          item.name.toLowerCase().includes(q) ||
          item.city.toLowerCase().includes(q) ||
          item.region.toLowerCase().includes(q)
        );
      })
      .sort((x, y) => x.km - y.km);
  }, [land, query, here, locale]);

  return (
    <div>
      <h2 className="font-display mb-3 text-2xl font-bold tracking-tight">
        {c.whyChile.title}
      </h2>
      <div className="relative mb-5 aspect-video overflow-hidden rounded-3xl bg-black">
        <video
          key={film}
          className="absolute inset-0 h-full w-full bg-black object-cover"
          controls
          playsInline
          preload="metadata"
          poster={EXPLORE_POSTER[locale]}
          aria-label={c.whyChile.video}
        >
          <source src={film} type="video/mp4" />
        </video>
      </div>
      <h1 className="font-display text-2xl font-bold">{a.tabs.explorar}</h1>
      <p className="mt-1 text-sm text-sand/70">{a.explorarLead}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={a.searchPlaces}
          className="min-w-[12rem] flex-1 rounded-xl border border-gold/25 bg-black px-3 py-2.5 text-sm"
        />
        <button
          type="button"
          onClick={locate}
          className="rounded-full border border-gold/35 px-3 py-2 text-xs font-semibold text-gold"
        >
          {locating ? a.locating : a.useLocation}
        </button>
      </div>
      {denied ? (
        <p className="mt-2 text-xs text-sand/50">{a.locationDenied}</p>
      ) : null}

      <div className="mapu-card mt-5 overflow-hidden p-1.5">
        <MapLoader
          height="46vh"
          land={land}
          onLandChange={setLand}
          showListed={false}
        />
      </div>

      <p className="mt-6 text-xs font-bold uppercase tracking-widest text-gold">
        {located ? a.nearby : c.map.places}
      </p>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {ranked.map(({ item, km }) => (
          <li key={item.slug}>
            <article className="mapu-card overflow-hidden">
              <div className="relative h-36">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
                {located ? (
                  <span className="absolute right-2 top-2 rounded-full bg-night/80 px-2 py-0.5 text-[10px] font-bold">
                    {formatKm(km, locale)} {a.away}
                  </span>
                ) : null}
              </div>
              <div className="p-4">
                <p className="kicker text-[10px]">
                  {item.city} · {item.region}
                </p>
                <h3 className="font-display mt-1 text-lg leading-tight">{item.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-sand/70">{item.tagline}</p>
                <p className="mt-2 text-sm text-gold">
                  {a.from} {formatCLP(item.priceFromCLP)}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link
                    href={`/app/viaje?lugar=${item.slug}&presupuesto=800000&noches=4&viajeros=2&intereses=naturaleza,gastronomia`}
                    className="rounded-lg bg-gold-deep py-2 text-center text-[11px] font-bold text-white"
                  >
                    {a.planThis}
                  </Link>
                  <Link
                    href={`/app/capsulas?lugar=${item.slug}`}
                    className="rounded-lg border border-gold/35 py-2 text-center text-[11px] font-bold text-gold"
                  >
                    {a.seeCapsule}
                  </Link>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
