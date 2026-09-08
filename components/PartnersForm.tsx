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

export default function PartnersForm() {
  const { locale } = useLocale();
  const c = t(locale);
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
        data.error === "incomplete" ? c.partners.incomplete : c.partners.error,
      );
      return;
    }
    setStatus("ok");
    setMessage(data.stored ? c.partners.ok : c.partners.okNoDb);
    e.currentTarget.reset();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-[1.75rem] border border-gold/20 bg-black p-6 md:p-8"
    >
      <label className="block text-sm font-medium text-sand">
        {c.partners.name}
        <input
          name="full_name"
          required
          className="mt-1 w-full rounded-xl border border-earth/15 px-3 py-2.5"
        />
      </label>
      <label className="block text-sm font-medium text-sand">
        {c.partners.email}
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-xl border border-earth/15 px-3 py-2.5"
        />
      </label>
      <label className="block text-sm font-medium text-sand">
        {c.partners.phone}
        <input
          name="phone"
          className="mt-1 w-full rounded-xl border border-earth/15 px-3 py-2.5"
        />
      </label>
      <label className="block text-sm font-medium text-sand">
        {c.partners.role}
        <select
          name="role"
          required
          className="mt-1 w-full rounded-xl border border-earth/15 px-3 py-2.5"
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
          className="mt-1 w-full rounded-xl border border-earth/15 px-3 py-2.5"
        />
      </label>
      <label className="block text-sm font-medium text-sand">
        {c.partners.city}
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
        {c.partners.notes}
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
        {status === "loading" ? c.partners.sending : c.partners.submit}
      </button>
      {status !== "idle" && status !== "loading" && (
        <p className={status === "ok" ? "text-moss" : "text-clay"}>{message}</p>
      )}
    </form>
  );
}
