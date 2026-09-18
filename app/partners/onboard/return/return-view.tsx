"use client";

import { t } from "@/lib/copy";
import { useLocale } from "@/lib/locale-context";
import Link from "next/link";

export default function ReturnView() {
  const { locale } = useLocale();
  const c = t(locale);
  return (
    <div className="page-pad mx-auto max-w-lg px-4 pb-16">
      <p className="kicker text-gold">{c.partners.kicker}</p>
      <h1 className="font-display mt-3 text-4xl text-sand">
        {c.partners.returnTitle}
      </h1>
      <p className="mt-3 text-sand/75">{c.partners.returnLead}</p>
      <Link
        href="/#mapa"
        className="mt-8 inline-block rounded-full bg-gold px-6 py-3 text-black hover:bg-[#e3c25a]"
      >
        {c.map.kicker}
      </Link>
    </div>
  );
}
