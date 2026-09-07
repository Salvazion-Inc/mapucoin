import { formatCLP, gastronomy } from "@/lib/catalog";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = { title: "Gastronomía local" };

export default function GastronomiaPage() {
  return (
    <div>
      <div className="bg-black px-4 py-16 text-sand md:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="kicker text-gold">Mesa</p>
          <h1 className="font-display mt-3 text-4xl md:text-6xl">
            Gastronomía local
          </h1>
          <p className="mt-4 max-w-2xl text-sand/70">
            Curanto, fogón mapuche, mariscal porteño, pisco del Elqui y cordero
            al palo. Experiencias con partners, no restaurantes genéricos.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="space-y-8">
          {gastronomy.map((g) => (
            <article
              key={g.slug}
              id={g.slug}
              className="grid overflow-hidden rounded-[1.75rem] border border-gold/20 bg-black md:grid-cols-2"
            >
              <div className="relative min-h-72">
                <Image src={g.image} alt={g.name} fill className="object-cover" />
              </div>
              <div className="flex flex-col justify-center p-8 md:p-10">
                <p className="kicker text-gold">{g.city}</p>
                <h2 className="font-display mt-2 text-3xl text-sand">{g.name}</h2>
                <p className="mt-4 text-sand/75">{g.description}</p>
                <p className="mt-5 font-medium text-gold">
                  {formatCLP(g.priceFromCLP)} · {g.durationHours} h
                </p>
                {g.placeSlug && (
                  <Link
                    href={`/destinos/${g.placeSlug}`}
                    className="mt-6 inline-block text-sm text-gold underline decoration-gold/60 underline-offset-4"
                  >
                    Ver destino
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
