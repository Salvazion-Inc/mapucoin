"use client";

import { useEffect, useRef, useState } from "react";
import { useTrip } from "@/lib/trip-store";
import { SplashLogo } from "./SplashLogo";

const MIN_MS = 1800;
const FADE_MS = 420;

export function AppSplash({ children }: { children: React.ReactNode }) {
  const { ready } = useTrip();
  const mountedAt = useRef(0);
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    mountedAt.current = performance.now();
  }, []);

  useEffect(() => {
    if (!ready || !visible) return;
    const wait = Math.max(0, MIN_MS - (performance.now() - mountedAt.current));
    const show = window.setTimeout(() => setFading(true), wait);
    return () => window.clearTimeout(show);
  }, [ready, visible]);

  useEffect(() => {
    if (!fading) return;
    const fade = window.setTimeout(() => setVisible(false), FADE_MS);
    return () => window.clearTimeout(fade);
  }, [fading]);

  return (
    <>
      {children}
      {visible ? (
        <div
          className={`fixed inset-0 z-[100] isolate flex items-center justify-center bg-night transition-opacity duration-500 ${
            fading ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
          role="status"
          aria-live="polite"
          aria-label="Mapucoin"
        >
          <SplashLogo />
        </div>
      ) : null}
    </>
  );
}
