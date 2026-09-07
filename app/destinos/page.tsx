import PlaceCard from "@/components/PlaceCard";
import { destinations } from "@/lib/catalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Destinos de Chile",
};

export default function DestinosPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <p className="text-xs uppercase tracking-[0.25em] text-clay">Chile</p>
      <h1 className="font-display mt-2 text-4xl text-earth">Destinos</h1>
      <p className="mt-3 max-w-2xl text-bark/75">
        Diez territorios para indicar en el planificador: desierto, valle,
        puerto, volcán, archipiélago, patagonia e isla.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {destinations.map((d) => (
          <PlaceCard key={d.slug} item={d} />
        ))}
      </div>
    </div>
  );
}
