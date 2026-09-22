"use client";

import { formatCLP, getBySlug } from "@/lib/catalog";
import { localizeItem } from "@/lib/catalog-i18n";
import { t, tr } from "@/lib/copy";
import { useLocale } from "@/lib/locale-context";
import type { QuotedPass } from "@/lib/park-passes";
import Image from "next/image";
import Link from "next/link";

export type PlanItem = {
  type: "stay" | "food" | "activity" | "place" | "ticket";
  name: string;
  slug?: string;
  costCLP: number;
  note: string;
  pass?: QuotedPass;
};

export type PlanDay = {
  day: number;
  title: string;
  items: PlanItem[];
};

export type TravelPlan = {
  title: string;
  summary: string;
  destination: string;
  nights: number;
  guests: number;
  budgetCLP: number;
  days: PlanDay[];
  totals: {
    stay: number;
    food: number;
    activities: number;
    tickets?: number;
    total: number;
    remaining: number;
  };
};

function passNote(item: PlanItem, c: ReturnType<typeof t>) {
  const pass = item.pass;
  if (!pass) return item.note;
  if (pass.perGuestCLP === 0) return c.itinerary.passZero;
  const parts = [
    tr(c.itinerary.passRates, {
      adult: formatCLP(pass.adultNationalCLP),
      guests: pass.guests,
      youth: formatCLP(pass.youthNationalCLP),
      foreign: formatCLP(pass.adultForeignCLP),
    }),
  ];
  if (pass.multiDay) {
    parts.push(
      tr(c.itinerary.passStay, { day: formatCLP(pass.dayAdultNationalCLP) }),
    );
  }
  if (pass.sector === "campana") parts.push(c.itinerary.passCampana);
  if (pass.sector === "patagonia") parts.push(c.itinerary.passPatagonia);
  return parts.join(" ");
}

const typeHref = (item: PlanItem) => {
  if (!item.slug) return null;
  if (item.type === "ticket") {
    return getBySlug(item.slug) ? `/destinos/${item.slug}` : null;
  }
  if (item.type === "stay") return `/capsulas/${item.slug}`;
  if (item.type === "food") return `/#${item.slug}`;
  if (item.type === "activity") return `/#actividades`;
  return `/destinos/${item.slug}`;
};

export default function ItineraryView({ plan }: { plan: TravelPlan }) {
  const { locale } = useLocale();
  const c = t(locale);
  const stay = plan.days
    .flatMap((d) => d.items)
    .find((i) => i.type === "stay");
  const tickets = plan.days
    .flatMap((d) => d.items)
    .filter((i) => i.type === "ticket");

  return (
    <div className="space-y-8">
      <header className="rounded-[1.75rem] bg-night px-6 py-8 text-sand md:px-10">
        <p className="kicker text-gold">{c.itinerary.kicker}</p>
        <h2 className="font-display mt-2 text-3xl md:text-4xl">{plan.title}</h2>
        <p className="mt-3 max-w-2xl text-sand/80">{plan.summary}</p>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <dt className="text-sand/50">{c.itinerary.budget}</dt>
            <dd>{formatCLP(plan.budgetCLP)}</dd>
          </div>
          <div>
            <dt className="text-sand/50">{c.itinerary.estimated}</dt>
            <dd>{formatCLP(plan.totals.total)}</dd>
          </div>
          <div>
            <dt className="text-sand/50">{c.itinerary.remaining}</dt>
            <dd>{formatCLP(plan.totals.remaining)}</dd>
          </div>
          <div>
            <dt className="text-sand/50">{c.itinerary.nightsGuests}</dt>
            <dd>
              {plan.nights} · {plan.guests}
            </dd>
          </div>
        </dl>
      </header>

      <div
        className={`grid grid-cols-2 gap-3 ${tickets.length ? "md:grid-cols-4" : "md:grid-cols-3"}`}
      >
        {[
          [c.itinerary.stay, plan.totals.stay],
          [c.itinerary.table, plan.totals.food],
          [c.itinerary.acts, plan.totals.activities],
          ...(tickets.length
            ? [[c.itinerary.passes, plan.totals.tickets || 0] as const]
            : []),
        ].map(([label, n]) => (
          <div
            key={String(label)}
            className="rounded-2xl border border-gold/20 bg-black p-4"
          >
            <p className="text-xs uppercase tracking-widest text-gold">
              {label}
            </p>
            <p className="font-display mt-1 text-2xl text-sand">
              {formatCLP(Number(n))}
            </p>
          </div>
        ))}
      </div>

      <ol className="space-y-6">
        {plan.days.map((day) => (
          <li
            key={day.day}
            className="rounded-3xl border border-gold/20 bg-black p-6"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-gold">
              {tr(c.itinerary.day, { n: day.day })}
            </p>
            <h3 className="font-display text-2xl text-sand">{day.title}</h3>
            <ul className="mt-4 space-y-3">
              {day.items.map((item, i) => {
                const href = typeHref(item);
                const raw = item.slug ? getBySlug(item.slug) : undefined;
                const cat = raw ? localizeItem(raw, locale) : undefined;
                const kind =
                  item.type === "stay"
                    ? c.itinerary.stay
                    : item.type === "food"
                      ? c.itinerary.table
                      : item.type === "activity"
                        ? c.itinerary.acts
                        : item.type === "ticket"
                          ? c.itinerary.passes
                          : c.kinds.place;
                const note = item.pass ? passNote(item, c) : cat?.tagline || item.note;
                return (
                  <li
                    key={`${item.name}-${i}`}
                    className="flex gap-3 border-t border-gold/15 pt-3"
                  >
                    {cat?.image && (
                      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl">
                        <Image
                          src={cat.image}
                          alt={cat.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 md:flex md:items-baseline md:justify-between md:gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-gold">
                          {kind}
                        </p>
                        <p className="font-medium text-sand">
                          {href ? (
                            <Link href={href} className="hover:text-gold">
                              {cat?.name || item.name}
                            </Link>
                          ) : (
                            cat?.name || item.name
                          )}
                        </p>
                        <p className="text-sm text-sand/70">{note}</p>
                        {item.pass && (
                          <a
                            href={item.pass.buyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-block rounded-full border border-gold/40 px-3 py-1 text-xs text-gold hover:border-gold"
                          >
                            {c.itinerary.buyPass}
                          </a>
                        )}
                      </div>
                      <p className="mt-1 shrink-0 text-sm text-gold md:mt-0">
                        {item.type === "ticket" || item.costCLP
                          ? formatCLP(item.costCLP)
                          : c.itinerary.included}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap gap-3">
        {stay?.slug && (
          <Link
            href={`/reserva?capsula=${stay.slug}&noches=${plan.nights}&viajeros=${plan.guests}`}
            className="rounded-full bg-gold px-6 py-3 text-black hover:bg-[#e3c25a]"
          >
            {c.itinerary.bookStay}
          </Link>
        )}
        <Link
          href="/#mapa"
          className="rounded-full border border-gold/35 px-6 py-3 text-gold"
        >
          {c.itinerary.seeMap}
        </Link>
      </div>
      {tickets.length > 0 && (
        <p className="text-sm text-sand/55">{c.itinerary.passSource}</p>
      )}
    </div>
  );
}
