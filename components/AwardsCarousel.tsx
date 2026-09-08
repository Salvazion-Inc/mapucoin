"use client";

import { awards, type Award, type AwardOrg } from "@/lib/awards";
import { t, tr } from "@/lib/copy";
import type { Locale } from "@/lib/locale";
import { useLocale } from "@/lib/locale-context";
import { useCallback, useEffect, useState } from "react";

function awardTitle(award: Award, locale: Locale) {
  const titles = t(locale).awardTitles as Record<string, string>;
  return titles[award.title] || award.title;
}

function awardNote(award: Award, locale: Locale) {
  if (!award.note) return undefined;
  const notes = t(locale).awardNotes as Record<string, string>;
  return notes[award.note] || award.note;
}

const ORG_MARK: Record<AwardOrg, string> = {
  "World Travel Awards": "WTA",
  "Forbes Travel Awards": "FTA",
  "Tripadvisor Travelers' Choice Awards": "TC",
  "The World's 50 Best Vineyards": "50B",
  TIME: "TIME",
  UNESCO: "UN",
  "DarkSky International": "SKY",
  ALMA: "ALMA",
};

function Seal({ org }: { org: AwardOrg }) {
  return (
    <div className="award-seal" aria-hidden>
      <svg viewBox="0 0 88 88" className="h-20 w-20 md:h-24 md:w-24">
        <circle
          cx="44"
          cy="44"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <circle
          cx="44"
          cy="44"
          r="33"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
          strokeDasharray="2 3"
        />
        <path
          d="M44 16 L47 28 L44 26 L41 28 Z M72 44 L60 47 L62 44 L60 41 Z M44 72 L41 60 L44 62 L47 60 Z M16 44 L28 41 L26 44 L28 47 Z"
          fill="currentColor"
        />
        <text
          x="44"
          y="48"
          textAnchor="middle"
          fontSize={ORG_MARK[org].length > 3 ? 10 : 13}
          fontWeight="700"
          letterSpacing="0.08em"
          fill="currentColor"
        >
          {ORG_MARK[org]}
        </text>
      </svg>
    </div>
  );
}

export default function AwardsCarousel() {
  const { locale } = useLocale();
  const c = t(locale);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = awards.length;

  const go = useCallback(
    (dir: number) => {
      setIndex((i) => (i + dir + total) % total);
    },
    [total],
  );

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => go(1), 6500);
    return () => window.clearInterval(timer);
  }, [go, paused]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const award = awards[index];
  const prev = awards[(index - 1 + total) % total];
  const next = awards[(index + 1) % total];
  const title = awardTitle(award, locale);
  const note = awardNote(award, locale);

  return (
    <div
      className="award-stage"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hidden lg:block">
        <SideCard award={prev} locale={locale} side="left" onClick={() => go(-1)} />
      </div>

      <article
        className="award-card"
        aria-live="polite"
        aria-label={tr(c.awards.of, { n: index + 1, total, title })}
      >
        <p className="kicker">{award.org}</p>
        <Seal org={award.org} />
        <h3 className="font-display mt-5 text-2xl leading-tight text-sand md:text-4xl">
          {title}
        </h3>
        {award.place && (
          <p className="mt-3 text-sm font-semibold tracking-wide text-gold md:text-base">
            {award.place}
          </p>
        )}
        {award.years && (
          <p className="mt-5 font-display text-xl text-gold md:text-2xl">
            {award.years}
          </p>
        )}
        {note && (
          <p className={`text-sm text-sand/65 ${award.years ? "mt-2" : "mt-5"}`}>
            {note}
          </p>
        )}
        <p className="mt-8 text-[11px] tracking-[0.22em] uppercase text-sand/40">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
      </article>

      <div className="hidden lg:block">
        <SideCard award={next} locale={locale} side="right" onClick={() => go(1)} />
      </div>

      <button
        type="button"
        className="award-nav award-nav-prev"
        aria-label={c.awards.prev}
        onClick={() => go(-1)}
      >
        ‹
      </button>
      <button
        type="button"
        className="award-nav award-nav-next"
        aria-label={c.awards.next}
        onClick={() => go(1)}
      >
        ›
      </button>

      <div className="award-dots">
        {awards.map((a, i) => (
          <button
            key={`${a.title}-${a.years}-${a.place || ""}`}
            type="button"
            aria-label={tr(c.awards.goTo, { n: i + 1 })}
            aria-current={i === index}
            className={i === index ? "is-active" : ""}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}

function SideCard({
  award,
  locale,
  side,
  onClick,
}: {
  award: (typeof awards)[number];
  locale: Locale;
  side: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`award-side award-side-${side}`}
    >
      <p className="kicker text-[10px]">{award.org}</p>
      <p className="mt-3 font-display text-lg leading-snug text-sand/80">
        {awardTitle(award, locale)}
      </p>
      {award.years && (
        <p className="mt-2 text-sm text-gold/80">{award.years}</p>
      )}
    </button>
  );
}
