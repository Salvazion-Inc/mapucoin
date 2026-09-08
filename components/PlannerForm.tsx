"use client";

import { destinations, formatCLP, interests, landscapes } from "@/lib/catalog";
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
    router.push(`/?${q.toString()}#planificar`);
    requestAnimationFrame(() => {
      document.getElementById("planificar")?.scrollIntoView({
        behavior: "smooth",
      });
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`rounded-[1.75rem] border border-gold/30 bg-black/80 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-md ${
        compact ? "p-5" : "p-6 md:p-8"
      }`}
    >
      <p className="kicker text-gold">Planificador</p>
      <h2 className="font-display mt-2 text-2xl text-sand md:text-3xl">
        ¿Cuánto y a dónde?
      </h2>
      <p className="mt-1 text-sm text-sand/70">
        Indica presupuesto en pesos chilenos y el territorio. Mapucoin arma
        cápsula, mesa y actividades.
      </p>

      <label className="mt-6 block text-sm font-medium text-sand">
        Lugar a conocer
        <select
          className="mt-1 w-full rounded-xl border border-gold/25 bg-black px-3 py-2.5"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
        >
          {landscapes.map((ls) => {
            const group = destinations.filter((d) => d.landscapes?.[0] === ls.id);
            if (!group.length) return null;
            return (
              <optgroup key={ls.id} label={ls.label}>
                {group.map((d) => (
                  <option key={d.slug} value={d.slug}>
                    {d.name}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
      </label>

      <label className="mt-4 block text-sm font-medium text-sand">
        Presupuesto total · {formatCLP(budget)}
        <input
          type="range"
          min={250000}
          max={3500000}
          step={50000}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="mt-2 w-full accent-gold"
        />
        <span className="flex justify-between text-xs text-sand/50">
          <span>250 mil</span>
          <span>3,5 millones</span>
        </span>
      </label>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="text-sm font-medium text-sand">
          Noches
          <input
            type="number"
            min={1}
            max={21}
            value={nights}
            onChange={(e) => setNights(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-gold/25 bg-black px-3 py-2.5"
          />
        </label>
        <label className="text-sm font-medium text-sand">
          Viajeros
          <input
            type="number"
            min={1}
            max={8}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-gold/25 bg-black px-3 py-2.5"
          />
        </label>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-sand">Intereses</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {interests.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => toggle(i.id)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                picked.includes(i.id)
                  ? "bg-gold text-black"
                  : "border border-gold/30 text-sand"
              }`}
            >
              {i.label}
            </button>
          ))}
        </div>
      </div>

      {dest && (
        <p className="mt-4 text-xs text-sand/50">
          Desde {formatCLP(dest.priceFromCLP)} por día de experiencia en{" "}
          {dest.city}.
        </p>
      )}

      <button
        type="submit"
        className="mt-6 w-full rounded-full bg-gold py-3.5 font-medium text-black transition hover:bg-[#e3c25a]"
      >
        Armar viaje
      </button>
    </form>
  );
}
