import CatalogBrowser from "@/components/CatalogBrowser";
import { capsules } from "@/lib/catalog";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = { title: "Cápsulas tecnológicas" };

export default function CapsulasPage() {
  return (
    <div>
      <div className="relative h-80 md:h-96">
        <Image
          src="/images/capsula-paine.jpg"
          alt="Cápsula Mapucoin de cobre, vidrio y madera"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-night/10" />
        <div className="absolute inset-0 mx-auto flex max-w-7xl items-end px-4 pb-12">
          <div className="text-sand">
            <p className="kicker text-gold">Dormir</p>
            <h1 className="font-display mt-2 text-4xl md:text-6xl">
              Casas cápsula tecnológicas
            </h1>
            <p className="mt-3 max-w-xl text-sand/75">
              Cobre, vidrio y madera. Una cápsula en cada territorio, del
              Altiplano a Rapa Nui y la Antártica.
            </p>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-14">
        <CatalogBrowser items={capsules} />
      </div>
    </div>
  );
}
