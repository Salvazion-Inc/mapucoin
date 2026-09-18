"use client";

import { destinations } from "@/lib/catalog";
import { t } from "@/lib/copy";
import { useLocale } from "@/lib/locale-context";
import { FormEvent, useState } from "react";

const roleIds = [
  "capsula",
  "gastronomia",
  "actividad",
  "guia",
  "transporte",
  "vina",
] as const;

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export default function PartnersForm() {
  const { locale } = useLocale();
  const c = t(locale);
  const [status, setStatus] = useState<"idle" | "ok" | "err" | "loading">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const fullName = String(data.get("full_name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const business = String(data.get("business") || "").trim();
    if (fullName.length < 2 || !business) {
      setStatus("err");
      setMessage(c.partners.incomplete);
      return;
    }
    if (!validEmail(email)) {
      setStatus("err");
      setMessage(c.partners.invalidEmail);
      return;
    }
    setStatus("loading");
    const payload = Object.fromEntries(data.entries());
    const res = await fetch("/api/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);
    const body = res ? await res.json().catch(() => ({})) : {};
    if (!res || res.status === 429) {
      setStatus("err");
      setMessage(res?.status === 429 ? c.reserva.rateLimited : c.partners.error);
      return;
    }
    if (!res.ok) {
      setStatus("err");
      setMessage(
        body.error === "email"
          ? c.partners.invalidEmail
          : body.error === "incomplete"
            ? c.partners.incomplete
            : c.partners.error,
      );
      return;
    }
    setStatus("ok");
    setMessage(body.stored ? c.partners.ok : c.partners.okNoDb);
    form.reset();
  }

  if (status === "ok") {
    return (
      <div className="reserva-glass space-y-4 rounded-[1.75rem] p-6 md:p-8">
        <p className="kicker">{c.partners.kicker}</p>
        <h3 className="font-display text-3xl text-sand">{c.partners.ok}</h3>
        <p className="text-sand/80">{c.partners.okLead}</p>
        <p className="text-sm text-sand/55">{c.partners.privacy}</p>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => {
            setStatus("idle");
            setMessage("");
          }}
        >
          {c.partners.another}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="reserva-glass relative space-y-4 rounded-[1.75rem] p-6 md:p-8"
    >
      <label className="block text-sm font-medium text-sand">
        {c.partners.name}
        <input
          name="full_name"
          autoComplete="name"
          required
          minLength={2}
          maxLength={120}
          className="mt-1 w-full rounded-xl border border-earth/15 bg-black/50 px-3 py-2.5"
        />
      </label>
      <label className="block text-sm font-medium text-sand">
        {c.partners.email}
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1 w-full rounded-xl border border-earth/15 bg-black/50 px-3 py-2.5"
        />
      </label>
      <label className="block text-sm font-medium text-sand">
        {c.partners.phone}
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          className="mt-1 w-full rounded-xl border border-earth/15 bg-black/50 px-3 py-2.5"
        />
      </label>
      <label className="block text-sm font-medium text-sand">
        {c.partners.role}
        <select
          name="role"
          required
          className="mt-1 w-full rounded-xl border border-earth/15 bg-black/50 px-3 py-2.5"
        >
          {roleIds.map((id) => (
            <option key={id} value={id}>
              {c.partnerRoles[id]}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-sand">
        {c.partners.business}
        <input
          name="business"
          required
          maxLength={160}
          className="mt-1 w-full rounded-xl border border-earth/15 bg-black/50 px-3 py-2.5"
        />
      </label>
      <label className="block text-sm font-medium text-sand">
        {c.partners.city}
        <select
          name="city"
          className="mt-1 w-full rounded-xl border border-earth/15 bg-black/50 px-3 py-2.5"
        >
          {destinations.map((d) => (
            <option key={d.slug} value={d.city}>
              {d.city}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-sand">
        {c.partners.notes}
        <textarea
          name="notes"
          rows={4}
          maxLength={2000}
          className="mt-1 w-full rounded-xl border border-earth/15 bg-black/50 px-3 py-2.5"
        />
      </label>
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <p className="text-xs text-sand/50">{c.partners.privacy}</p>
      <button
        disabled={status === "loading"}
        className="btn-gold w-full py-3.5 disabled:opacity-60"
      >
        {status === "loading" ? c.partners.sending : c.partners.submit}
      </button>
      {status === "err" && <p className="text-clay">{message}</p>}
    </form>
  );
}
