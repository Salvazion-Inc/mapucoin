import CatalogBrowser from "@/components/CatalogBrowser";
import PlaceVideo from "@/components/PlaceVideo";
import { CHILE_FILM, destinations } from "@/lib/catalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Destinos de Chile",
};

export default function DestinosPage() {
  return (
    <div>
      <div className="bg-black px-4 py-16 text-sand md:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="kicker text-gold">Chile</p>
          <h1 className="font-display mt-3 text-4xl md:text-6xl">Destinos</h1>
          <p className="mt-4 max-w-2xl text-sand/70">
            Treinta y un territorios, del Altiplano a la Antártica. Filtra por
            volcán, lago, desierto, bosque nativo, viñedos, ríos, nieve o playa.
          </p>
          <div className="mt-10 max-w-4xl">
            <PlaceVideo id={CHILE_FILM} title="Chile en 4K" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-14">
        <CatalogBrowser items={destinations} />
      </div>
    </div>
  );
}
