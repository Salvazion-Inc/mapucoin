import PlaceCard from "@/components/PlaceCard";
import { activities } from "@/lib/catalog";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Actividades" };

export default function ActividadesPage() {
  return (
    <div>
      <div className="bg-black px-4 py-16 text-sand md:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="kicker text-gold">Hacer</p>
          <h1 className="font-display mt-3 text-4xl md:text-6xl">Actividades</h1>
          <p className="mt-4 max-w-2xl text-sand/70">
            Trekking, termas, astronomía, kayak, volcanes y amaneceres en
            Tongariki. Cada una entra al itinerario según tu presupuesto.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((a) => (
            <div key={a.slug} id={a.slug}>
              <PlaceCard item={a} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
