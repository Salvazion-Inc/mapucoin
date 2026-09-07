import { formatCLP, gastronomy } from "@/lib/catalog";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = { title: "Gastronomía local" };

export default function GastronomiaPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <p className="text-xs uppercase tracking-[0.25em] text-clay">Mesa</p>
      <h1 className="font-display mt-2 text-4xl text-earth">
        Gastronomía local
      </h1>
      <p className="mt-3 max-w-2xl text-bark/75">
        Curanto, fogón mapuche, mariscal porteño, pisco del Elqui y cordero al
        palo. Experiencias con partners, no restaurantes genéricos.
      </p>
      <div className="mt-10 space-y-10">
        {gastronomy.map((g) => (
          <article
            key={g.slug}
            id={g.slug}
            className="grid overflow-hidden rounded-3xl border border-earth/10 bg-white md:grid-cols-2"
          >
            <div className="relative min-h-64">
              <Image src={g.image} alt={g.name} fill className="object-cover" />
            </div>
            <div className="p-8">
              <p className="text-xs uppercase tracking-widest text-clay">
                {g.city}
              </p>
              <h2 className="font-display mt-1 text-3xl text-earth">{g.name}</h2>
              <p className="mt-3 text-bark/75">{g.description}</p>
              <p className="mt-4 font-medium text-clay">
                {formatCLP(g.priceFromCLP)} · {g.durationHours} h
              </p>
              {g.placeSlug && (
                <Link
                  href={`/destinos/${g.placeSlug}`}
                  className="mt-6 inline-block text-sm text-earth underline"
                >
                  Ver destino
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
