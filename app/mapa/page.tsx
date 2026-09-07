import MapLoader from "@/components/MapLoader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mapa de Chile",
  description:
    "Mapa interactivo de destinos y cápsulas tecnológicas Mapucoin en Chile.",
};

export default function MapaPage() {
  return (
    <div>
      <div className="bg-night px-4 py-16 text-sand md:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="kicker text-gold">Mapa vivo</p>
          <h1 className="font-display mt-3 text-4xl md:text-6xl">
            Principales lugares turísticos de Chile
          </h1>
          <p className="mt-4 max-w-2xl text-sand/70">
            Desde el salar hasta el granito de Paine — y Rapa Nui en el Pacífico.
            Puntos terracota son destinos; puntos oro son cápsulas.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="overflow-hidden rounded-[1.75rem] shadow-[0_24px_70px_rgba(12,9,7,0.12)]">
          <MapLoader height="72vh" />
        </div>
      </div>
    </div>
  );
}
