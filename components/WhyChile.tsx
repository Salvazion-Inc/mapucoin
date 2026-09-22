"use client";

import { t } from "@/lib/copy";
import { useLocale } from "@/lib/locale-context";
import type { Locale } from "@/lib/locale";

const SRC: Record<Locale, string> = {
  es: "/videos/why-chile-es.mp4",
  en: "/videos/why-chile-en.mp4",
  pt: "/videos/why-chile-pt.mp4",
  fr: "/videos/why-chile-fr.mp4",
  it: "/videos/why-chile-en.mp4",
  de: "/videos/why-chile-de.mp4",
};

const POSTER: Record<Locale, string> = {
  es: "/images/why-chile-es.jpg",
  en: "/images/why-chile-en.jpg",
  pt: "/images/why-chile-pt.jpg",
  fr: "/images/why-chile-fr.jpg",
  it: "/images/why-chile-en.jpg",
  de: "/images/why-chile-de.jpg",
};

export default function WhyChile() {
  const { locale } = useLocale();
  const c = t(locale);
  const src = SRC[locale];

  return (
    <section
      id="por-que-chile"
      className="scroll-mt-24 border-t border-gold/15 py-24"
    >
      <div className="mx-auto max-w-6xl px-5">
        <p className="kicker">{c.whyChile.kicker}</p>
        <h2 className="font-display mt-3 max-w-3xl text-3xl font-bold tracking-tight text-sand md:text-5xl">
          {c.whyChile.title}
        </h2>
        <p className="mt-4 max-w-2xl text-sand/70">{c.whyChile.lead}</p>
        <div className="relative mt-10 aspect-video overflow-hidden rounded-[1.75rem] bg-night shadow-[0_24px_80px_rgba(7,5,4,0.28)]">
          <video
            key={src}
            className="absolute inset-0 h-full w-full bg-night object-cover"
            controls
            playsInline
            preload="metadata"
            poster={POSTER[locale]}
            aria-label={c.whyChile.video}
          >
            <source src={src} type="video/mp4" />
            {c.whyChile.lead}
          </video>
        </div>
      </div>
    </section>
  );
}
