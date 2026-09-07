"use client";

import Image from "next/image";

/** Chile cinematic 4K — footage of Patagonia, Atacama and the Andes. */
export const HERO_YOUTUBE = "pQMIfx7hcTA";

export default function HeroVideo({
  poster = "/images/hero-paine.jpg",
  youtubeId = HERO_YOUTUBE,
}: {
  poster?: string;
  youtubeId?: string;
}) {
  const src = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3`;

  return (
    <div className="absolute inset-0 overflow-hidden bg-night">
      <Image
        src={poster}
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <iframe
        src={src}
        title="Chile en movimiento"
        allow="autoplay; encrypted-media; picture-in-picture"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 scale-110 border-0"
      />
    </div>
  );
}
