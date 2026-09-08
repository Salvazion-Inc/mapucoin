"use client";

import { t } from "@/lib/copy";
import { useLocale } from "@/lib/locale-context";
import { useRef, useState } from "react";

export default function HeroVideo({
  poster = "/images/hero-chile.jpg",
}: {
  poster?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const { locale } = useLocale();
  const c = t(locale);

  function toggleSound() {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.paused) return;
    void v.play().catch(() => {});
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-night">
      <video
        ref={ref}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
        poster={poster}
      >
        <source src="/videos/mapucoin-chile.mp4" type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={toggleSound}
        className="absolute bottom-6 right-6 z-20 rounded-full border border-gold/40 bg-black/55 px-4 py-2 text-[11px] tracking-[0.18em] uppercase text-sand backdrop-blur-sm transition hover:border-gold hover:text-gold"
      >
        {muted ? c.sound : c.mute}
      </button>
    </div>
  );
}
