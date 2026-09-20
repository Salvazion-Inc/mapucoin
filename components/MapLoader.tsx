"use client";

import type { Landscape } from "@/lib/catalog";
import { t } from "@/lib/copy";
import { useLocale } from "@/lib/locale-context";
import dynamic from "next/dynamic";

const ChileMap = dynamic(() => import("./ChileMap"), {
  ssr: false,
  loading: () => <MapLoading />,
});

function MapLoading() {
  const { locale } = useLocale();
  return (
    <div className="flex h-[70vh] items-center justify-center rounded-3xl border border-gold/20 bg-black text-sand/70">
      {t(locale).map.loading}
    </div>
  );
}

export default function MapLoader({
  focusSlug,
  height,
  land,
  onLandChange,
  showListed,
}: {
  focusSlug?: string;
  height?: string;
  land?: Landscape | "all";
  onLandChange?: (land: Landscape | "all") => void;
  showListed?: boolean;
}) {
  return (
    <ChileMap
      focusSlug={focusSlug}
      height={height}
      land={land}
      onLandChange={onLandChange}
      showListed={showListed}
    />
  );
}
