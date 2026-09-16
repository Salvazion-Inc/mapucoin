"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { at } from "@/lib/app-copy";
import {
  activities,
  formatCLP,
  gastronomy,
  landscapes,
  type Landscape,
} from "@/lib/catalog";
import { localizeItem } from "@/lib/catalog-i18n";
import { t } from "@/lib/copy";
import { useLocale } from "@/lib/locale-context";

export function MesaTab() {
  const { locale } = useLocale();
  const a = at(locale);
  const c = t(locale);
  const [land, setLand] = useState<Landscape | "all">("all");
  const [kind, setKind] = useState<"food" | "activity">("food");

  const items = useMemo(() => {
    const source = kind === "food" ? gastronomy : activities;
    return source
      .filter((i) => land === "all" || i.landscapes?.includes(land) || i.cluster === land)
      .map((i) => localizeItem(i, locale));
  }, [kind, land, locale]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">{a.tabs.mesa}</h1>
      <p className="mt-1 text-sm text-sand/70">{a.mesaLead}</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setKind("food")}
          className={`rounded-xl py-2 text-sm font-bold ${
            kind === "food" ? "bg-gold text-night" : "border border-gold/30 text-sand"
          }`}
        >
          {a.food}
        </button>
        <button
          type="button"
          onClick={() => setKind("activity")}
          className={`rounded-xl py-2 text-sm font-bold ${
            kind === "activity" ? "bg-gold text-night" : "border border-gold/30 text-sand"
          }`}
        >
          {a.activities}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setLand("all")}
          className={`rounded-full px-3 py-1 text-xs ${
            land === "all" ? "bg-gold text-night" : "border border-gold/30 text-sand"
          }`}
        >
          {a.all}
        </button>
        {landscapes.map((ls) => (
          <button
            key={ls.id}
            type="button"
            onClick={() => setLand(ls.id)}
            className={`rounded-full px-3 py-1 text-xs ${
              land === ls.id ? "bg-gold text-night" : "border border-gold/30 text-sand"
            }`}
          >
            {c.landscapes[ls.id]}
          </button>
        ))}
      </div>

      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item.slug} className="mapu-card flex overflow-hidden">
            <div className="relative h-28 w-28 shrink-0">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                sizes="112px"
              />
            </div>
            <div className="min-w-0 flex-1 p-3">
              <p className="kicker text-[10px]">{item.city}</p>
              <h3 className="font-display truncate text-base">{item.name}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-sand/70">{item.tagline}</p>
              <p className="mt-1 text-sm text-gold">{formatCLP(item.priceFromCLP)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
