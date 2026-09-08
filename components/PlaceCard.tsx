"use client";

import { localizeItem } from "@/lib/catalog-i18n";
import { CatalogItem, formatCLP } from "@/lib/catalog";
import { t } from "@/lib/copy";
import { useLocale } from "@/lib/locale-context";
import Image from "next/image";
import Link from "next/link";

const hrefFor = (item: CatalogItem) => {
  if (item.kind === "place") return `/destinos/${item.slug}`;
  if (item.kind === "capsule") return `/capsulas/${item.slug}`;
  if (item.kind === "food") return `/#${item.slug}`;
  if (item.placeSlug) return `/destinos/${item.placeSlug}`;
  return `/#actividades`;
};

export default function PlaceCard({ item }: { item: CatalogItem }) {
  const { locale } = useLocale();
  const c = t(locale);
  const shown = localizeItem(item, locale);
  const land = shown.landscapes?.[0];

  return (
    <Link
      href={hrefFor(shown)}
      className="mapu-card mapu-card-hover group relative block overflow-hidden"
    >
      <div className="relative h-72">
        <Image
          src={shown.image}
          alt={shown.name}
          fill
          className="object-cover transition duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/25 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-black/55 px-3 py-1 text-[11px] tracking-wide text-sand backdrop-blur-sm">
            {c.kinds[shown.kind]}
          </span>
          {land && (
            <span className="rounded-full bg-gold/90 px-3 py-1 text-[11px] tracking-wide text-night">
              {c.landscapes[land]}
            </span>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5 text-sand">
          <p className="kicker text-gold/90">
            {shown.city} · {shown.region}
          </p>
          <h3 className="font-display mt-1.5 text-2xl leading-tight">
            {shown.name}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-sand/75">{shown.tagline}</p>
          <p className="mt-3 text-sm font-medium text-gold">
            {c.from} {formatCLP(shown.priceFromCLP)}
            {shown.kind === "capsule" ? ` / ${c.capsules.perNight.toLowerCase()}` : ""}
          </p>
        </div>
      </div>
    </Link>
  );
}
