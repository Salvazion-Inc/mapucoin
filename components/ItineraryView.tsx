"use client";

import { formatCLP } from "@/lib/catalog";
import Link from "next/link";

export type PlanItem = {
  type: "stay" | "food" | "activity" | "place";
  name: string;
  slug?: string;
  costCLP: number;
  note: string;
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
    total: number;
    remaining: number;
  };
};

const typeHref = (item: PlanItem) => {
  if (!item.slug) return null;
  if (item.type === "stay") return `/capsulas/${item.slug}`;
  if (item.type === "food") return `/gastronomia#${item.slug}`;
  if (item.type === "activity") return `/actividades#${item.slug}`;
  return `/destinos/${item.slug}`;
};

export default function ItineraryView({ plan }: { plan: TravelPlan }) {
  const stay = plan.days
    .flatMap((d) => d.items)
    .find((i) => i.type === "stay");

  return (
    <div className="space-y-8">
      <header className="rounded-3xl bg-earth px-6 py-8 text-sand md:px-10">
        <p className="text-xs uppercase tracking-[0.25em] text-gold">
          Itinerario Grok
        </p>
        <h2 className="font-display mt-2 text-3xl md:text-4xl">{plan.title}</h2>
        <p className="mt-3 max-w-2xl text-sand/80">{plan.summary}</p>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <dt className="text-sand/50">Presupuesto</dt>
            <dd>{formatCLP(plan.budgetCLP)}</dd>
          </div>
          <div>
            <dt className="text-sand/50">Total estimado</dt>
            <dd>{formatCLP(plan.totals.total)}</dd>
          </div>
          <div>
            <dt className="text-sand/50">Queda</dt>
            <dd>{formatCLP(plan.totals.remaining)}</dd>
          </div>
          <div>
            <dt className="text-sand/50">Noches · viajeros</dt>
            <dd>
              {plan.nights} · {plan.guests}
            </dd>
          </div>
        </dl>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          ["Cápsula", plan.totals.stay],
          ["Mesa", plan.totals.food],
          ["Actividades", plan.totals.activities],
        ].map(([label, n]) => (
          <div
            key={String(label)}
            className="rounded-2xl border border-earth/10 bg-white p-4"
          >
            <p className="text-xs uppercase tracking-widest text-clay">
              {label}
            </p>
            <p className="font-display mt-1 text-2xl text-earth">
              {formatCLP(Number(n))}
            </p>
          </div>
        ))}
      </div>

      <ol className="space-y-6">
        {plan.days.map((day) => (
          <li
            key={day.day}
            className="rounded-3xl border border-earth/10 bg-white p-6"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-gold">
              Día {day.day}
            </p>
            <h3 className="font-display text-2xl text-earth">{day.title}</h3>
            <ul className="mt-4 space-y-3">
              {day.items.map((item, i) => {
                const href = typeHref(item);
                return (
                  <li
                    key={`${item.name}-${i}`}
                    className="flex flex-col gap-1 border-t border-sand pt-3 md:flex-row md:items-baseline md:justify-between"
                  >
                    <div>
                      <p className="font-medium text-earth">
                        {href ? (
                          <Link href={href} className="hover:text-clay">
                            {item.name}
                          </Link>
                        ) : (
                          item.name
                        )}
                      </p>
                      <p className="text-sm text-bark/70">{item.note}</p>
                    </div>
                    <p className="text-sm text-clay">
                      {item.costCLP ? formatCLP(item.costCLP) : "incluido"}
                    </p>
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
            className="rounded-full bg-clay px-6 py-3 text-cream hover:bg-ember"
          >
            Reservar cápsula con Stripe
          </Link>
        )}
        <Link
          href="/mapa"
          className="rounded-full border border-earth/20 px-6 py-3 text-earth"
        >
          Ver en el mapa
        </Link>
      </div>
    </div>
  );
}
