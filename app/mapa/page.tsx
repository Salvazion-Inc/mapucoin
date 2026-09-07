import MapLoader from "@/components/MapLoader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mapa de Chile",
  description:
    "Mapa interactivo de destinos y cápsulas tecnológicas Mapucoin en Chile.",
};

export default function MapaPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <p className="text-xs uppercase tracking-[0.25em] text-clay">Mapa vivo</p>
      <h1 className="font-display mt-2 text-4xl text-earth">
        Principales lugares turísticos de Chile
      </h1>
      <p className="mt-3 max-w-2xl text-bark/75">
        Desde el salar hasta el granito de Paine — y Rapa Nui en el Pacífico.
        Puntos terracota son destinos; puntos oro son cápsulas.
      </p>
      <div className="mt-8">
        <MapLoader height="72vh" />
      </div>
    </div>
  );
}
