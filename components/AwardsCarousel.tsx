"use client";

import { awards, type AwardOrg } from "@/lib/awards";
import { useCallback, useEffect, useState } from "react";

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

function WheatEar() {
  return (
    <g>
      <path
        d="M0 11 C0 4 0 -10 0 -18"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.55"
      />
      {Array.from({ length: 8 }, (_, i) => {
        const y = 7 - i * 3.05;
        const s = 1 - i * 0.07;
        return (
          <g key={i}>
            <ellipse
              cx={-2.15}
              cy={y}
              rx={1.45 * s}
              ry={2.35 * s}
              transform={`rotate(-32 ${-2.15} ${y})`}
              fill="currentColor"
            />
            <ellipse
              cx={2.15}
              cy={y}
              rx={1.45 * s}
              ry={2.35 * s}
              transform={`rotate(32 ${2.15} ${y})`}
              fill="currentColor"
            />
          </g>
        );
      })}
      <ellipse cx="0" cy="-18.6" rx="1.05" ry="1.7" fill="currentColor" />
    </g>
  );
}

function wheatArc(startDeg: number, stepDeg: number, count: number) {
  const cx = 60;
  const cy = 60;
  const r = 49;
  return Array.from({ length: count }, (_, i) => {
    const deg = startDeg + i * stepDeg;
    const rad = (deg * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
      rot: deg + 90,
    };
  });
}

function Seal({ org }: { org: AwardOrg }) {
  const left = wheatArc(112, 14.2, 11);
  const right = wheatArc(68, -14.2, 11);
  return (
    <div className="award-seal" aria-hidden>
      <svg viewBox="0 0 120 120" className="h-28 w-28 md:h-32 md:w-32">
        {left.map((e, i) => (
          <g key={`l${i}`} transform={`translate(${e.x} ${e.y}) rotate(${e.rot})`}>
            <WheatEar />
          </g>
        ))}
        {right.map((e, i) => (
          <g key={`r${i}`} transform={`translate(${e.x} ${e.y}) rotate(${e.rot})`}>
            <WheatEar />
          </g>
        ))}
        <circle
          cx="60"
          cy="60"
          r="27"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.15"
        />
        <circle
          cx="60"
          cy="60"
          r="22.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="1.6 2.4"
        />
        <text
          x="60"
          y="64"
          textAnchor="middle"
          fontSize={ORG_MARK[org].length > 3 ? 9 : 12}
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
    const t = window.setInterval(() => go(1), 6500);
    return () => window.clearInterval(t);
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

  return (
    <div
      className="award-stage"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hidden lg:block">
        <SideCard award={prev} side="left" onClick={() => go(-1)} />
      </div>

      <article
        className="award-card"
        aria-live="polite"
        aria-label={`${index + 1} de ${total}: ${award.title}`}
      >
        <p className="kicker">{award.org}</p>
        <Seal org={award.org} />
        <h3 className="font-display mt-5 text-2xl leading-tight text-sand md:text-4xl">
          {award.title}
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
        {award.note && (
          <p className={`text-sm text-sand/65 ${award.years ? "mt-2" : "mt-5"}`}>
            {award.note}
          </p>
        )}
        <p className="mt-8 text-[11px] tracking-[0.22em] uppercase text-sand/40">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
      </article>

      <div className="hidden lg:block">
        <SideCard award={next} side="right" onClick={() => go(1)} />
      </div>

      <button
        type="button"
        className="award-nav award-nav-prev"
        aria-label="Premio anterior"
        onClick={() => go(-1)}
      >
        ‹
      </button>
      <button
        type="button"
        className="award-nav award-nav-next"
        aria-label="Premio siguiente"
        onClick={() => go(1)}
      >
        ›
      </button>

      <div className="award-dots">
        {awards.map((a, i) => (
          <button
            key={`${a.title}-${a.years}-${a.place || ""}`}
            type="button"
            aria-label={`Ir al premio ${i + 1}`}
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
  side,
  onClick,
}: {
  award: (typeof awards)[number];
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
        {award.title}
      </p>
      {award.years && (
        <p className="mt-2 text-sm text-gold/80">{award.years}</p>
      )}
    </button>
  );
}
