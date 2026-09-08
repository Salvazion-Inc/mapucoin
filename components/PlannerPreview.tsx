"use client";

import { formatCLP, planCatalog } from "@/lib/catalog";
import { localizeItem } from "@/lib/catalog-i18n";
import { t, tr } from "@/lib/copy";
import { useLocale } from "@/lib/locale-context";

export default function PlannerPreview({ placeSlug }: { placeSlug: string }) {
  const { locale } = useLocale();
  const c = t(locale);
  const { place, stay, food, acts, land } = planCatalog(placeSlug);
  const dishes = food.slice(0, 2).map((i) => localizeItem(i, locale));
  const doing = acts.slice(0, 2).map((i) => localizeItem(i, locale));
  const extraFood = Math.max(0, food.length - 2);
  const extraActs = Math.max(0, acts.length - 2);

  return (
    <div className="rounded-[1.75rem] border border-gold/20 bg-black p-6 md:p-8">
      <p className="kicker text-gold">
        {land ? c.landscapes[land] : c.plan.kicker}
      </p>
      <h3 className="font-display mt-2 text-2xl text-sand md:text-3xl">
        {c.plan.previewTitle}
      </h3>
      <p className="mt-2 max-w-xl text-sm text-sand/65">{c.plan.previewLead}</p>
      <p className="mt-1 text-sm text-gold/80">
        {place.name} · {place.city}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stay && (
          <PreviewCard
            kicker={c.plan.previewStay}
            name={stay.name}
            image={stay.image}
            meta={tr(c.capsules.fromNight, { price: formatCLP(stay.priceFromCLP) })}
          />
        )}
        {dishes[0] && (
          <PreviewCard
            kicker={c.plan.previewTable}
            name={dishes[0].name}
            image={dishes[0].image}
            meta={
              extraFood
                ? `${formatCLP(dishes[0].priceFromCLP)} · ${tr(c.plan.more, { n: extraFood })}`
                : formatCLP(dishes[0].priceFromCLP)
            }
          />
        )}
        {doing[0] && (
          <PreviewCard
            kicker={c.plan.previewActs}
            name={doing[0].name}
            image={doing[0].image}
            meta={
              extraActs
                ? `${formatCLP(doing[0].priceFromCLP)} · ${tr(c.plan.more, { n: extraActs })}`
                : formatCLP(doing[0].priceFromCLP)
            }
          />
        )}
      </div>

      {(dishes[1] || doing[1]) && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {dishes.slice(1).map((d) => (
            <li
              key={d.slug}
              className="rounded-full border border-gold/25 px-3 py-1 text-xs text-sand/80"
            >
              {d.name}
            </li>
          ))}
          {doing.slice(1).map((a) => (
            <li
              key={a.slug}
              className="rounded-full border border-gold/25 px-3 py-1 text-xs text-sand/80"
            >
              {a.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PreviewCard({
  kicker,
  name,
  image,
  meta,
}: {
  kicker: string;
  name: string;
  image: string;
  meta: string;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-gold/15">
      <div className="relative h-36">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3 text-sand">
          <p className="text-[10px] uppercase tracking-[0.18em] text-gold">
            {kicker}
          </p>
          <h4 className="font-display mt-0.5 text-base leading-tight">{name}</h4>
          <p className="mt-1 text-xs text-gold/90">{meta}</p>
        </div>
      </div>
    </article>
  );
}
