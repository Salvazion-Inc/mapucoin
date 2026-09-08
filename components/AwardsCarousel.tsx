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

function LaurelLeaf({ flip, scale = 1 }: { flip: 1 | -1; scale?: number }) {
  return (
    <g transform={`scale(${flip * scale} ${scale})`}>
      <path
        d="M0 0 C 4.1 -1.6, 6.2 -6.4, 1.6 -13.2 C 0.5 -8.4, 0.15 -4.2, 0 0 Z"
        fill="currentColor"
      />
      <path
        d="M0.15 -1.2 C 1.1 -5.2, 1.35 -8.6, 1.15 -12.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.28"
        opacity="0.4"
      />
    </g>
  );
}

function laurelArm(startDeg: number, endDeg: number, count: number) {
  const cx = 60;
  const cy = 62;
  const r = 46;
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    const deg = startDeg + (endDeg - startDeg) * t;
    const rad = (deg * Math.PI) / 180;
    const s = 1.02 - t * 0.28;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
      rot: deg + 90,
      s,
    };
  });
}

function Seal({ org }: { org: AwardOrg }) {
  const left = laurelArm(102, 208, 9);
  const right = laurelArm(78, -28, 9);
  return (
    <div className="award-seal" aria-hidden>
      <svg viewBox="0 0 120 124" className="h-28 w-28 md:h-32 md:w-32">
        <path
          d="M60 106 C 38 102, 22 86, 18 68"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.7"
          opacity="0.55"
        />
        <path
          d="M60 106 C 82 102, 98 86, 102 68"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.7"
          opacity="0.55"
        />
        {left.map((e, i) => (
          <g
            key={`l${i}`}
            transform={`translate(${e.x} ${e.y}) rotate(${e.rot})`}
          >
            <LaurelLeaf flip={-1} scale={e.s} />
          </g>
        ))}
        {right.map((e, i) => (
          <g
            key={`r${i}`}
            transform={`translate(${e.x} ${e.y}) rotate(${e.rot})`}
          >
            <LaurelLeaf flip={1} scale={e.s} />
          </g>
        ))}
        <path
          d="M54 104 C 57 101, 63 101, 66 104 C 63 108, 57 108, 54 104 Z"
          fill="currentColor"
          opacity="0.9"
        />
        <circle
          cx="60"
          cy="58"
          r="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.1"
        />
        <circle
          cx="60"
          cy="58"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.45"
          strokeDasharray="1.5 2.2"
        />
        <text
          x="60"
          y="62"
          textAnchor="middle"
          fontSize={ORG_MARK[org].length > 3 ? 8.5 : 11.5}
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
