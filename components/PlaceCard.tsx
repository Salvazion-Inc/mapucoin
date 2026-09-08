import { CatalogItem, formatCLP, landscapeLabel } from "@/lib/catalog";
import Image from "next/image";
import Link from "next/link";

const hrefFor = (item: CatalogItem) => {
  if (item.kind === "place") return `/destinos/${item.slug}`;
  if (item.kind === "capsule") return `/capsulas/${item.slug}`;
  if (item.kind === "food") return `/#${item.slug}`;
  if (item.placeSlug) return `/destinos/${item.placeSlug}`;
  return `/#actividades`;
};

const kindLabel: Record<CatalogItem["kind"], string> = {
  place: "Destino",
  capsule: "Cápsula",
  food: "Mesa",
  activity: "Actividad",
};

export default function PlaceCard({ item }: { item: CatalogItem }) {
  return (
    <Link
      href={hrefFor(item)}
      className="mapu-card mapu-card-hover group relative block overflow-hidden"
    >
      <div className="relative h-72">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover transition duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/25 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-black/55 px-3 py-1 text-[11px] tracking-wide text-sand backdrop-blur-sm">
            {kindLabel[item.kind]}
          </span>
          {item.landscapes?.[0] && (
            <span className="rounded-full bg-gold/90 px-3 py-1 text-[11px] tracking-wide text-night">
              {landscapeLabel(item.landscapes[0])}
            </span>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5 text-sand">
          <p className="kicker text-gold/90">
            {item.city} · {item.region}
          </p>
          <h3 className="font-display mt-1.5 text-2xl leading-tight">
            {item.name}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-sand/75">{item.tagline}</p>
          <p className="mt-3 text-sm font-medium text-gold">
            desde {formatCLP(item.priceFromCLP)}
            {item.kind === "capsule" ? " / noche" : ""}
          </p>
        </div>
      </div>
    </Link>
  );
}
