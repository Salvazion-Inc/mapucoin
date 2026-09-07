import PlaceCard from "@/components/PlaceCard";
import { activities } from "@/lib/catalog";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Actividades" };

export default function ActividadesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <p className="text-xs uppercase tracking-[0.25em] text-clay">Hacer</p>
      <h1 className="font-display mt-2 text-4xl text-earth">Actividades</h1>
      <p className="mt-3 max-w-2xl text-bark/75">
        Trekking, termas, astronomía, kayak, volcanes y amaneceres en Tongariki.
        Cada una entra al itinerario según tu presupuesto.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {activities.map((a) => (
          <div key={a.slug} id={a.slug}>
            <PlaceCard item={a} />
          </div>
        ))}
      </div>
    </div>
  );
}
