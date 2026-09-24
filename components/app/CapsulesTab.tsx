"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { at } from "@/lib/app-copy";
import {
  capsules,
  formatCLP,
  landscapes,
  type Landscape,
} from "@/lib/catalog";
import { localizeItem } from "@/lib/catalog-i18n";
import { t } from "@/lib/copy";
import { useLocale } from "@/lib/locale-context";
import { useProfile } from "@/lib/profile-store";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export function CapsulesTab() {
  return (
    <Suspense>
      <CapsulesInner />
    </Suspense>
  );
}

function CapsulesInner() {
  const { locale } = useLocale();
  const a = at(locale);
  const c = t(locale);
  const params = useSearchParams();
  const place = params.get("lugar") || "";
  const [land, setLand] = useState<Landscape | "all">("all");
  const [open, setOpen] = useState<string | null>(null);

  const list = useMemo(() => {
    return capsules
      .filter((cap) => {
        if (place && cap.placeSlug !== place) return false;
        if (land !== "all" && !cap.landscapes?.includes(land)) return false;
        return true;
      })
      .map((cap) => localizeItem(cap, locale));
  }, [land, place, locale]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">{a.tabs.capsulas}</h1>
      <p className="mt-1 text-sm text-sand/70">{a.capsulasLead}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setLand("all")}
          className={`rounded-full px-3 py-1 text-xs ${
            land === "all" ? "bg-gold-deep text-white" : "border border-gold/30 text-sand"
          }`}
        >
          {a.all}
        </button>
        {landscapes.map((ls) => (
          <button
            key={ls.id}
            type="button"
            onClick={() => setLand(ls.id)}
            className={`rounded-full px-3 py-1 text-xs ${
              land === ls.id ? "bg-gold-deep text-white" : "border border-gold/30 text-sand"
            }`}
          >
            {c.landscapes[ls.id]}
          </button>
        ))}
      </div>

      <ul className="mt-5 grid gap-4 sm:grid-cols-2">
        {list.map((item) => (
          <li key={item.slug} className="mapu-card overflow-hidden">
            <div className="relative h-44">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </div>
            <div className="p-4">
              <p className="kicker text-[10px]">
                {item.city} · {item.region}
              </p>
              <h3 className="font-display mt-1 text-lg">{item.name}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-sand/70">{item.tagline}</p>
              <p className="mt-2 text-sm font-medium text-gold">
                {formatCLP(item.priceFromCLP)} {a.perNight}
              </p>
              {open === item.slug ? (
                <BookForm slug={item.slug} onClose={() => setOpen(null)} />
              ) : (
                <button
                  type="button"
                  onClick={() => setOpen(item.slug)}
                  className="mt-3 w-full rounded-lg bg-gold-deep py-2.5 text-sm font-bold text-white"
                >
                  {a.bookThis}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BookForm({ slug, onClose }: { slug: string; onClose: () => void }) {
  const { locale } = useLocale();
  const a = at(locale);
  const c = t(locale);
  const { profile } = useProfile();
  const [nights, setNights] = useState(2);
  const [guests, setGuests] = useState(2);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function book() {
    if (!profile?.fullName || !profile.email) {
      setStatus(a.bookNeedProfile);
      return;
    }
    setBusy(true);
    setStatus("");
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        capsula: slug,
        nights,
        guests,
        full_name: profile.fullName,
        email: profile.email,
        phone: profile.phone || "",
        source: "app",
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.status === 503) {
      setStatus(a.noStripe);
      return;
    }
    if (res.status === 429) {
      setStatus(c.reserva.rateLimited);
      return;
    }
    if (!res.ok || !data.url) {
      setStatus(a.bookFail);
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div className="mt-3 space-y-2 rounded-xl border border-gold/20 bg-black/40 p-3">
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-sand/70">
          {a.nights}
          <input
            type="number"
            min={1}
            max={21}
            value={nights}
            onChange={(e) => setNights(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-gold/25 bg-black px-2 py-1.5 text-sm"
          />
        </label>
        <label className="text-xs text-sand/70">
          {a.guests}
          <input
            type="number"
            min={1}
            max={8}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-gold/25 bg-black px-2 py-1.5 text-sm"
          />
        </label>
      </div>
      {status ? <p className="text-xs text-clay">{status}</p> : null}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={book}
          className="flex-1 rounded-lg bg-gold-deep py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          {busy ? a.booking : a.payStripe}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-gold/30 px-3 text-xs text-sand"
        >
          ×
        </button>
      </div>
    </div>
  );
}
