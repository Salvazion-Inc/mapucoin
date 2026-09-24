"use client";

import { t } from "@/lib/copy";
import { useLocale } from "@/lib/locale-context";
import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function OnboardInner() {
  const { locale } = useLocale();
  const c = t(locale);
  const params = useSearchParams();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const presetId = params.get("id") || "";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    if (!email) {
      setStatus(c.partners.onboardNeedEmail);
      return;
    }
    setLoading(true);
    setStatus("");
    const res = await fetch("/api/partners/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        id: String(form.get("id") || presetId || "").trim(),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (data.url) {
      window.location.href = data.url;
      return;
    }
    if (data.blocked) {
      setStatus(c.partners.onboardBlocked);
      return;
    }
    setStatus(c.partners.error);
  }

  return (
    <div className="page-pad mx-auto max-w-lg px-4 pb-16">
      <p className="kicker text-gold">{c.partners.kicker}</p>
      <h1 className="font-display mt-3 text-4xl text-sand">
        {c.partners.onboardTitle}
      </h1>
      <p className="mt-3 text-sand/75">{c.partners.onboardLead}</p>
      {params.get("error") ? (
        <p className="mt-3 text-sm text-clay">{c.partners.error}</p>
      ) : null}
      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-4 rounded-[1.75rem] border border-gold/20 bg-black p-7"
      >
        {presetId ? <input type="hidden" name="id" value={presetId} /> : null}
        <label className="block text-sm font-medium text-sand">
          {c.partners.email}
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-xl border border-earth/15 px-3 py-2.5"
          />
        </label>
        <button
          disabled={loading}
          className="w-full rounded-full bg-gold-deep py-3.5 text-white disabled:opacity-60 hover:bg-gold-hot"
        >
          {loading ? c.partners.sending : c.partners.onboardSubmit}
        </button>
        {status ? <p className="text-sm text-clay">{status}</p> : null}
      </form>
    </div>
  );
}

export default function PartnerOnboardPage() {
  return (
    <Suspense>
      <OnboardInner />
    </Suspense>
  );
}
