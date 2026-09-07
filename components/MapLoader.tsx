"use client";

import dynamic from "next/dynamic";

const ChileMap = dynamic(() => import("./ChileMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[70vh] items-center justify-center rounded-3xl bg-sand text-bark/70">
      Cargando mapa de Chile…
    </div>
  ),
});

export default function MapLoader({
  focusSlug,
  height,
}: {
  focusSlug?: string;
  height?: string;
}) {
  return <ChileMap focusSlug={focusSlug} height={height} />;
}
