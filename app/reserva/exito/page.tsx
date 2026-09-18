"use client";

import { formatCLP, getBySlug } from "@/lib/catalog";
import { t } from "@/lib/copy";
import { useLocale } from "@/lib/locale-context";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type Receipt = {
  ok: boolean;
  amount?: number | null;
  currency?: string;
  email?: string;
  capsule?: string;
  nights?: string;
  guests?: string;
  error?: string;
};

function ExitoInner() {
  const { locale } = useLocale();
  const c = t(locale);
  const params = useSearchParams();
  const sessionId = params.get("session_id") || "";
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setReceipt({ ok: false, error: "session" });
      return;
    }
    fetch("/api/checkout/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    })
      .then((res) => res.json())
      .then((data) => setReceipt(data))
      .catch(() => setReceipt({ ok: false, error: "net" }));
  }, [sessionId]);

  const capsule = receipt?.capsule ? getBySlug(receipt.capsule) : null;
  const loading = Boolean(sessionId) && !receipt;

  return (
    <div className="page-pad mx-auto max-w-xl px-4 pb-24">
      <div className="reserva-glass rounded-[1.75rem] px-6 py-10 text-center sm:px-10">
        <p className="text-xs uppercase tracking-[0.25em] text-gold">
          {c.reserva.okKicker}
        </p>
        <h1 className="font-display mt-2 text-4xl text-sand">{c.reserva.okTitle}</h1>
        <p className="mt-4 text-sand/75">{c.reserva.okLead}</p>
        {loading && (
          <p className="mt-6 text-sm text-sand/60" role="status">
            {c.reserva.okPending}
          </p>
        )}
        {receipt?.ok && (
          <dl className="mt-8 space-y-3 text-left text-sm">
            {capsule && (
              <div className="flex justify-between gap-4 border-b border-gold/15 pb-3">
                <dt className="text-sand/55">{c.reserva.okCapsule}</dt>
                <dd className="text-sand">{capsule.name}</dd>
              </div>
            )}
            {receipt.amount != null && (
              <div className="flex justify-between gap-4 border-b border-gold/15 pb-3">
                <dt className="text-sand/55">{c.reserva.okAmount}</dt>
                <dd className="font-medium text-gold">
                  {formatCLP(receipt.amount)}
                  <span className="ml-1 text-xs text-sand/50">
                    {receipt.currency || "CLP"}
                  </span>
                </dd>
              </div>
            )}
            {receipt.nights && (
              <div className="flex justify-between gap-4 border-b border-gold/15 pb-3">
                <dt className="text-sand/55">{c.reserva.okNights}</dt>
                <dd className="text-sand">{receipt.nights}</dd>
              </div>
            )}
            {receipt.guests && (
              <div className="flex justify-between gap-4 border-b border-gold/15 pb-3">
                <dt className="text-sand/55">{c.reserva.okGuests}</dt>
                <dd className="text-sand">{receipt.guests}</dd>
              </div>
            )}
            {receipt.email && (
              <div className="flex justify-between gap-4">
                <dt className="text-sand/55">{c.reserva.okEmail}</dt>
                <dd className="text-sand">{receipt.email}</dd>
              </div>
            )}
            <p className="pt-2 text-xs tracking-[0.16em] text-moss uppercase">
              {c.reserva.okPaid} · {c.reserva.secure}
            </p>
          </dl>
        )}
        {receipt && !receipt.ok && (
          <p className="mt-6 text-sm text-clay">{c.reserva.okMissing}</p>
        )}
        <Link href="/#mapa" className="btn-gold mt-8">
          {c.reserva.okCta}
        </Link>
      </div>
    </div>
  );
}

export default function ExitoPage() {
  return (
    <Suspense>
      <ExitoInner />
    </Suspense>
  );
}
