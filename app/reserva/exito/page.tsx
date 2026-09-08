"use client";

import { t } from "@/lib/copy";
import { useLocale } from "@/lib/locale-context";
import Link from "next/link";

export default function ExitoPage() {
  const { locale } = useLocale();
  const c = t(locale);
  return (
    <div className="page-pad mx-auto max-w-xl px-4 pb-24 text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-gold">
        {c.reserva.okKicker}
      </p>
      <h1 className="font-display mt-2 text-4xl text-sand">{c.reserva.okTitle}</h1>
      <p className="mt-4 text-sand/75">{c.reserva.okLead}</p>
      <Link href="/#mapa" className="btn-gold mt-8">
        {c.reserva.okCta}
      </Link>
    </div>
  );
}
