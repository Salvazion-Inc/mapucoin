"use client";

import { capsules, formatCLP, getBySlug } from "@/lib/catalog";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";

function ReservaInner() {
  const params = useSearchParams();
  const initial = params.get("capsula") || capsules[0].slug;
  const [slug, setSlug] = useState(initial);
  const [nights, setNights] = useState(Number(params.get("noches") || 2));
  const [guests, setGuests] = useState(Number(params.get("viajeros") || 2));
  const [status, setStatus] = useState("");
  const item = useMemo(() => getBySlug(slug), [slug]);
  const total = (item?.priceFromCLP || 0) * nights;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus("Creando sesión de Stripe…");
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        capsula: slug,
        nights,
        guests,
        full_name: form.get("full_name"),
        email: form.get("email"),
        phone: form.get("phone"),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 503) {
      setStatus(
        "Stripe no está configurado. Añade STRIPE_SECRET_KEY en Vercel.",
      );
      return;
    }
    if (!res.ok || !data.url) {
      setStatus("No se pudo iniciar el pago. Revisa los datos.");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 lg:grid-cols-2">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-clay">Reserva</p>
        <h1 className="font-display mt-2 text-4xl text-earth">
          Pagar con Stripe
        </h1>
        {params.get("cancel") && (
          <p className="mt-3 text-sm text-clay">Pago cancelado. Puedes reintentar.</p>
        )}
        {item && (
          <div className="relative mt-6 h-56 overflow-hidden rounded-3xl">
            <Image src={item.image} alt={item.name} fill className="object-cover" />
          </div>
        )}
        <p className="mt-4 text-bark/75">
          {item?.name} · {item?.city}. {nights} noche{nights > 1 ? "s" : ""} ·{" "}
          {guests} viajero{guests > 1 ? "s" : ""}. Total {formatCLP(total)}.
        </p>
      </div>
      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-3xl border border-earth/10 bg-white p-6"
      >
        <label className="block text-sm font-medium text-earth">
          Cápsula
          <select
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-1 w-full rounded-xl border border-earth/15 px-3 py-2.5"
          >
            {capsules.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name} · {formatCLP(c.priceFromCLP)}/noche
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-medium text-earth">
            Noches
            <input
              type="number"
              min={1}
              max={21}
              value={nights}
              onChange={(e) => setNights(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-earth/15 px-3 py-2.5"
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
              className="mt-1 w-full rounded-xl border border-earth/15 px-3 py-2.5"
            />
          </label>
        </div>
        <label className="block text-sm font-medium text-earth">
          Nombre
          <input
            name="full_name"
            required
            className="mt-1 w-full rounded-xl border border-earth/15 px-3 py-2.5"
          />
        </label>
        <label className="block text-sm font-medium text-earth">
          Correo
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-xl border border-earth/15 px-3 py-2.5"
          />
        </label>
        <label className="block text-sm font-medium text-earth">
          Teléfono
          <input
            name="phone"
            className="mt-1 w-full rounded-xl border border-earth/15 px-3 py-2.5"
          />
        </label>
        <button className="w-full rounded-full bg-clay py-3 text-cream">
          Ir a Stripe · {formatCLP(total)}
        </button>
        {status && <p className="text-sm text-bark/70">{status}</p>}
      </form>
    </div>
  );
}

export default function ReservaPage() {
  return (
    <Suspense fallback={<div className="p-12">Cargando reserva…</div>}>
      <ReservaInner />
    </Suspense>
  );
}
