"use client";

import { t } from "@/lib/copy";
import { useLocale } from "@/lib/locale-context";
import Link from "next/link";

export default function NotFound() {
  const { locale } = useLocale();
  const c = t(locale);
  return (
    <div className="page-pad mx-auto max-w-xl px-4 pb-24 text-center">
      <h1 className="font-display text-4xl text-sand">{c.notFound.title}</h1>
      <p className="mt-3 text-sand/70">{c.notFound.lead}</p>
      <Link href="/" className="btn-gold mt-8">
        {c.notFound.back}
      </Link>
    </div>
  );
}
