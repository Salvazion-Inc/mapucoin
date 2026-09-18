"use client";

import PlannerSection from "@/components/PlannerSection";
import { at } from "@/lib/app-copy";
import { useLocale } from "@/lib/locale-context";
import { useTrip } from "@/lib/trip-store";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

export function TripTab() {
  return (
    <Suspense>
      <TripInner />
    </Suspense>
  );
}

function TripInner() {
  const { locale } = useLocale();
  const a = at(locale);
  const params = useSearchParams();
  const { setTrip } = useTrip();
  const sessionId = params.get("session_id") || "";
  const paid = params.get("paid") === "1" || sessionId;

  useEffect(() => {
    if (paid) setTrip({ paymentStatus: "paid" });
    if (!sessionId) return;
    fetch("/api/checkout/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    }).catch(() => {});
  }, [paid, sessionId, setTrip]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">{a.tabs.viaje}</h1>
      <p className="mt-1 text-sm text-sand/70">{a.viajeLead}</p>
      {paid ? (
        <p className="mt-4 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-gold">
          {a.paidBanner}
        </p>
      ) : null}
      <PlannerSection />
    </div>
  );
}
