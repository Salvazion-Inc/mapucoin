"use client";

import ItineraryView, { type TravelPlan } from "@/components/ItineraryView";
import PlannerForm from "@/components/PlannerForm";
import PlannerPreview from "@/components/PlannerPreview";
import { destinations } from "@/lib/catalog";
import { t } from "@/lib/copy";
import { localeMeta } from "@/lib/locale";
import { useLocale } from "@/lib/locale-context";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

function PlannerInner() {
  const { locale } = useLocale();
  const c = t(locale);
  const params = useSearchParams();
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chat, setChat] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);

  const lugar = params.get("lugar") || "san-pedro-de-atacama";
  const presupuesto = params.get("presupuesto") || "800000";
  const noches = params.get("noches") || "4";
  const viajeros = params.get("viajeros") || "2";
  const intereses = params.get("intereses") || "naturaleza,gastronomia";
  const [previewPlace, setPreviewPlace] = useState(lugar);
  const onPlaceChange = useCallback((slug: string) => {
    setPreviewPlace(slug);
  }, []);

  useEffect(() => {
    if (!params.get("lugar")) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lugar,
        presupuesto,
        noches,
        viajeros,
        intereses,
        locale,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.plan) {
          setPlan(data.plan);
        } else setError(c.plan.errorPlan);
      })
      .catch(() => {
        if (!cancelled) setError(c.plan.errorNet);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    lugar,
    presupuesto,
    noches,
    viajeros,
    intereses,
    params,
    locale,
    c.plan.errorPlan,
    c.plan.errorNet,
  ]);

  async function sendChat(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    const you = c.plan.you;
    const history = [...chat, `${you}: ${text}`];
    setChat(history);
    setStreaming(true);
    const messages = history.map((line) => {
      const user = line.startsWith(`${you}: `);
      return {
        role: user ? "user" : "assistant",
        content: user
          ? line.slice(you.length + 2)
          : line.replace(/^Mapucoin: /, ""),
      };
    });
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages,
        locale,
        language: localeMeta[locale].replyLanguage,
      }),
    });
    if (!res.ok || !res.body) {
      setChat((rows) => [...rows, `Mapucoin: ${c.plan.chatFail}`]);
      setStreaming(false);
      return;
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let acc = "";
    setChat((rows) => [...rows, "Mapucoin: "]);
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      acc += decoder.decode(value, { stream: true });
      const snapshot = acc;
      setChat((rows) => {
        const next = [...rows];
        next[next.length - 1] = `Mapucoin: ${snapshot}`;
        return next;
      });
    }
    setStreaming(false);
  }

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(280px,380px)_1fr]">
      <div className="space-y-6">
        <PlannerForm
          compact
          initialPlace={lugar}
          onPlaceChange={onPlaceChange}
        />
        <div className="rounded-3xl border border-gold/20 bg-black p-5">
          <p className="text-sm font-medium text-sand">{c.plan.ask}</p>
          <div className="mt-3 max-h-56 space-y-2 overflow-y-auto text-sm text-sand/80">
            {chat.length === 0 && (
              <p className="text-sand/45">{c.plan.askHint}</p>
            )}
            {chat.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          <form onSubmit={sendChat} className="mt-3 flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={c.plan.askPlaceholder}
              className="flex-1 rounded-xl border border-gold/25 bg-black px-3 py-2 text-sm"
            />
            <button
              disabled={streaming}
              className="rounded-xl bg-gold px-3 py-2 text-sm text-black"
            >
              {c.plan.send}
            </button>
          </form>
        </div>
      </div>
      <div>
        {loading && (
          <div className="rounded-[1.75rem] border border-gold/20 bg-black p-10">
            <p className="text-sand/80">{c.plan.loadingPlan}</p>
            <p className="mt-2 text-sm text-sand/50">{c.plan.loadingHint}</p>
          </div>
        )}
        {error && <p className="text-gold">{error}</p>}
        {plan && !loading && <ItineraryView plan={plan} onPlan={setPlan} />}
        {!loading && !plan && (
          <PlannerPreview
            placeSlug={
              previewPlace ||
              params.get("lugar") ||
              destinations.find((d) => d.slug === "san-pedro-de-atacama")
                ?.slug ||
              destinations[0].slug
            }
          />
        )}
      </div>
    </div>
  );
}

function PlannerFallback() {
  const { locale } = useLocale();
  return (
    <p className="mt-10 rounded-3xl border border-gold/20 bg-black p-10 text-sand/70">
      {t(locale).plan.loadPlanner}
    </p>
  );
}

export default function PlannerSection() {
  return (
    <Suspense fallback={<PlannerFallback />}>
      <PlannerInner />
    </Suspense>
  );
}
