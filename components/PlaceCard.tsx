import { CatalogItem, formatCLP } from "@/lib/catalog";
import Image from "next/image";
import Link from "next/link";

const hrefFor = (item: CatalogItem) => {
  if (item.kind === "place") return `/destinos/${item.slug}`;
  if (item.kind === "capsule") return `/capsulas/${item.slug}`;
  if (item.kind === "food") return `/gastronomia#${item.slug}`;
  return `/actividades#${item.slug}`;
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
      className="group overflow-hidden rounded-3xl border border-earth/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative h-52">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <span className="absolute left-3 top-3 rounded-full bg-earth/80 px-3 py-1 text-xs text-sand">
          {kindLabel[item.kind]}
        </span>
      </div>
      <div className="p-5">
        <p className="text-xs uppercase tracking-widest text-clay">
          {item.city} · {item.region}
        </p>
        <h3 className="font-display mt-1 text-xl text-earth">{item.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-bark/75">{item.tagline}</p>
        <p className="mt-3 text-sm font-medium text-clay">
          desde {formatCLP(item.priceFromCLP)}
          {item.kind === "capsule" ? " / noche" : ""}
        </p>
      </div>
    </Link>
  );
}
