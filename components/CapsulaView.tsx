"use client";

import MapLoader from "@/components/MapLoader";
import type { CatalogItem } from "@/lib/catalog";
import { formatCLP } from "@/lib/catalog";
import { localizeItem } from "@/lib/catalog-i18n";
import { t, tr } from "@/lib/copy";
import { useLocale } from "@/lib/locale-context";
import Image from "next/image";
import Link from "next/link";

export default function CapsulaView({
  capsule,
  place,
}: {
  capsule: CatalogItem;
  place: CatalogItem | null;
}) {
  const { locale } = useLocale();
  const copy = t(locale);
  const cap = localizeItem(capsule, locale);

  return (
    <article>
      <div className="relative h-[50vh] min-h-96">
        <Image src={cap.image} alt={cap.name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/35 to-transparent" />
        <div className="absolute bottom-8 left-0 right-0 mx-auto max-w-7xl px-4 text-sand">
          <p className="kicker text-gold">
            {cap.city}
            {cap.landscapes?.length
              ? ` · ${cap.landscapes.map((id) => copy.landscapes[id]).join(" · ")}`
              : ""}
          </p>
          <h1 className="font-display mt-2 text-4xl md:text-6xl">{cap.name}</h1>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="text-lg text-sand/80">{cap.description}</p>
          <ul className="mt-6 space-y-2 text-sand">
            {cap.highlights.map((h) => (
              <li key={h}>· {h}</li>
            ))}
          </ul>
          <div className="relative mt-8 h-64 overflow-hidden rounded-3xl">
            <Image
              src="/images/capsulas/08.jpg"
              alt={copy.capsules.interiorAlt}
              fill
              className="object-cover"
            />
          </div>
          <div className="mt-8">
            <h2 className="font-display text-2xl text-sand">
              {copy.capsules.location}
            </h2>
            <div className="mt-4">
              <MapLoader focusSlug={cap.slug} height="380px" />
            </div>
          </div>
        </div>
        <aside className="h-fit rounded-[1.75rem] border border-gold/20 bg-black p-7">
          <p className="text-sm text-sand/70">{copy.capsules.perNight}</p>
          <p className="font-display text-4xl text-sand">
            {formatCLP(cap.priceFromCLP)}
          </p>
          <p className="mt-1 text-sm text-sand/50">
            {tr(copy.capsules.upTo, {
              n: cap.capacity || 2,
              region: cap.region,
            })}
          </p>
          <Link
            href={`/reserva?capsula=${cap.slug}&noches=2&viajeros=2`}
            className="mt-6 block rounded-full bg-gold py-3.5 text-center text-black hover:bg-[#e3c25a]"
          >
            {copy.capsules.book}
          </Link>
          {place && (
            <Link
              href={`/destinos/${place.slug}`}
              className="mt-3 block text-center text-sm text-gold"
            >
              {tr(copy.capsules.explore, { name: place.name })}
            </Link>
          )}
        </aside>
      </div>
    </article>
  );
}
