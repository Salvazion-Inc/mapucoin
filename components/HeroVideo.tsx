"use client";

import { t } from "@/lib/copy";
import { useLocale } from "@/lib/locale-context";
import { useEffect, useRef, useState } from "react";

export default function HeroVideo({
  poster = "/images/hero-chile.webp",
}: {
  poster?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  // Attach the heavy hero video only after the page has loaded, so it does not
  // compete with fonts and LCP. The poster shows until then (same look).
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (document.readyState === "complete") {
      setReady(true);
      return;
    }
    const on = () => setReady(true);
    window.addEventListener("load", on, { once: true });
    return () => window.removeEventListener("load", on);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const v = ref.current;
    if (!v) return;
    v.load();
    void v.play().catch(() => {});
  }, [ready]);
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
        preload="none"
        aria-hidden
        poster={poster}
      >
        {ready && <source src="/videos/mapucoin-chile.mp4" type="video/mp4" />}
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
