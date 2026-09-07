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
        <p className="kicker text-gold">Reserva</p>
        <h1 className="font-display mt-3 text-4xl text-sand">
          Confirmar reserva
        </h1>
        {params.get("cancel") && (
          <p className="mt-3 text-sm text-clay">Pago cancelado. Puedes reintentar.</p>
        )}
        {item && (
          <div className="relative mt-6 h-56 overflow-hidden rounded-3xl">
            <Image src={item.image} alt={item.name} fill className="object-cover" />
          </div>
        )}
        <p className="mt-4 text-sand/75">
          {item?.name} · {item?.city}. {nights} noche{nights > 1 ? "s" : ""} ·{" "}
          {guests} viajero{guests > 1 ? "s" : ""}. Total {formatCLP(total)}.
        </p>
      </div>
      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-[1.75rem] border border-gold/20 bg-black p-7"
      >
        <label className="block text-sm font-medium text-sand">
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
          <label className="text-sm font-medium text-sand">
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
          <label className="text-sm font-medium text-sand">
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
        <label className="block text-sm font-medium text-sand">
          Nombre
          <input
            name="full_name"
            required
            className="mt-1 w-full rounded-xl border border-earth/15 px-3 py-2.5"
          />
        </label>
        <label className="block text-sm font-medium text-sand">
          Correo
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-xl border border-earth/15 px-3 py-2.5"
          />
        </label>
        <label className="block text-sm font-medium text-sand">
          Teléfono
          <input
            name="phone"
            className="mt-1 w-full rounded-xl border border-earth/15 px-3 py-2.5"
          />
        </label>
        <button className="w-full rounded-full bg-gold py-3.5 text-black hover:bg-[#e3c25a]">
          Pagar · {formatCLP(total)}
        </button>
        {status && <p className="text-sm text-sand/70">{status}</p>}
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
