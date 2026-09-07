"use client";

import { destinations } from "@/lib/catalog";
import { FormEvent, useState } from "react";

const roles = [
  { id: "capsula", label: "Cápsula / alojamiento" },
  { id: "gastronomia", label: "Gastronomía" },
  { id: "actividad", label: "Actividad / tour" },
  { id: "guia", label: "Guía" },
  { id: "transporte", label: "Transporte" },
  { id: "vina", label: "Viña / destilería" },
];

export default function PartnersPage() {
  const [status, setStatus] = useState<"idle" | "ok" | "err" | "loading">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const res = await fetch("/api/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus("err");
      setMessage(
        data.error === "incomplete"
          ? "Completa nombre, correo y negocio."
          : "No se pudo enviar. Inténtalo de nuevo.",
      );
      return;
    }
    setStatus("ok");
    setMessage(
      data.stored
        ? "Solicitud recibida. Te contactamos para activar tu ficha y Stripe."
        : "Solicitud recibida. Conecta Supabase para guardar partners en producción.",
    );
    e.currentTarget.reset();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <p className="kicker text-gold">Red</p>
      <h1 className="font-display mt-3 text-4xl text-sand md:text-5xl">
        Ingresa como partner
      </h1>
      <p className="mt-3 text-sand/75">
        Operas una cápsula, una ruka, una caleta, un tour o una viña. Mapucoin
        te muestra en el mapa, entra al itinerario y cobra con Stripe.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-10 space-y-4 rounded-[1.75rem] border border-gold/20 bg-black p-6 md:p-8"
      >
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
        <label className="block text-sm font-medium text-sand">
          Tipo de partner
          <select
            name="role"
            required
            className="mt-1 w-full rounded-xl border border-earth/15 px-3 py-2.5"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-sand">
          Nombre del negocio
          <input
            name="business"
            required
            className="mt-1 w-full rounded-xl border border-earth/15 px-3 py-2.5"
          />
        </label>
        <label className="block text-sm font-medium text-sand">
          Ciudad / territorio
          <select
            name="city"
            className="mt-1 w-full rounded-xl border border-earth/15 px-3 py-2.5"
          >
            {destinations.map((d) => (
              <option key={d.slug} value={d.city}>
                {d.city}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-sand">
          Cuéntanos tu oferta
          <textarea
            name="notes"
            rows={4}
            className="mt-1 w-full rounded-xl border border-earth/15 px-3 py-2.5"
          />
        </label>
        <button
          disabled={status === "loading"}
          className="w-full rounded-full bg-gold py-3.5 text-black disabled:opacity-60 hover:bg-[#e3c25a]"
        >
          {status === "loading" ? "Enviando…" : "Postular"}
        </button>
        {status !== "idle" && status !== "loading" && (
          <p className={status === "ok" ? "text-moss" : "text-clay"}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
