"use client";

import { destinations, formatCLP, interests } from "@/lib/catalog";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

export default function PlannerForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [place, setPlace] = useState(destinations[0].slug);
  const [budget, setBudget] = useState(800000);
  const [nights, setNights] = useState(4);
  const [guests, setGuests] = useState(2);
  const [picked, setPicked] = useState<string[]>(["naturaleza", "gastronomia"]);

  const dest = useMemo(
    () => destinations.find((d) => d.slug === place),
    [place],
  );

  function toggle(id: string) {
    setPicked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams({
      lugar: place,
      presupuesto: String(budget),
      noches: String(nights),
      viajeros: String(guests),
      intereses: picked.join(","),
    });
    router.push(`/planificar?${q.toString()}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`rounded-3xl border border-earth/10 bg-cream/95 shadow-xl shadow-earth/10 ${
        compact ? "p-5" : "p-6 md:p-8"
      }`}
    >
      <p className="text-xs uppercase tracking-[0.25em] text-clay">
        Planificador Grok
      </p>
      <h2 className="font-display mt-2 text-2xl text-earth md:text-3xl">
        ¿Cuánto y a dónde?
      </h2>
      <p className="mt-1 text-sm text-bark/70">
        Indica presupuesto en pesos chilenos y el territorio. Grok arma cápsula,
        mesa y actividades.
      </p>

      <label className="mt-6 block text-sm font-medium text-earth">
        Lugar a conocer
        <select
          className="mt-1 w-full rounded-xl border border-earth/15 bg-white px-3 py-2.5"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
        >
          {destinations.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.name} · {d.region}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-4 block text-sm font-medium text-earth">
        Presupuesto total · {formatCLP(budget)}
        <input
          type="range"
          min={250000}
          max={3500000}
          step={50000}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="mt-2 w-full accent-clay"
        />
        <span className="flex justify-between text-xs text-bark/60">
          <span>250 mil</span>
          <span>3,5 millones</span>
        </span>
      </label>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="text-sm font-medium text-earth">
          Noches
          <input
            type="number"
            min={1}
            max={21}
            value={nights}
            onChange={(e) => setNights(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-earth/15 bg-white px-3 py-2.5"
          />
        </label>
        <label className="text-sm font-medium text-earth">
          Viajeros
          <input
            type="number"
            min={1}
            max={8}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-earth/15 bg-white px-3 py-2.5"
          />
        </label>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-earth">Intereses</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {interests.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => toggle(i.id)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                picked.includes(i.id)
                  ? "bg-earth text-sand"
                  : "bg-sand text-bark"
              }`}
            >
              {i.label}
            </button>
          ))}
        </div>
      </div>

      {dest && (
        <p className="mt-4 text-xs text-bark/60">
          Desde {formatCLP(dest.priceFromCLP)} por día de experiencia en{" "}
          {dest.city}.
        </p>
      )}

      <button
        type="submit"
        className="mt-6 w-full rounded-full bg-clay py-3 font-medium text-cream hover:bg-ember"
      >
        Armar viaje con Grok
      </button>
    </form>
  );
}
