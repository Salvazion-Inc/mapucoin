"use client";

import PlaceCard from "@/components/PlaceCard";
import {
  landscapes,
  type CatalogItem,
  type Landscape,
} from "@/lib/catalog";
import { useMemo, useState } from "react";

export default function CatalogBrowser({
  items,
  empty = "No hay fichas en este paisaje.",
}: {
  items: CatalogItem[];
  empty?: string;
}) {
  const [land, setLand] = useState<Landscape | "all">("all");
  const shown = useMemo(
    () =>
      land === "all"
        ? items
        : items.filter((i) => i.landscapes?.includes(land)),
    [items, land],
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setLand("all")}
          className={`rounded-full px-4 py-1.5 text-sm transition ${
            land === "all" ? "bg-earth text-sand" : "bg-sand text-bark hover:bg-sand/80"
          }`}
        >
          Todos
        </button>
        {landscapes.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setLand(l.id)}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              land === l.id ? "bg-earth text-sand" : "bg-sand text-bark hover:bg-sand/80"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="mt-10 text-bark/60">{empty}</p>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((item) => (
            <PlaceCard key={item.slug} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
