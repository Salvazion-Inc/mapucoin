import MapLoader from "@/components/MapLoader";
import PlaceCard from "@/components/PlaceCard";
import {
  capsulesForPlace,
  destinations,
  formatCLP,
  itemsForPlace,
} from "@/lib/catalog";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const d = destinations.find((x) => x.slug === slug);
  return { title: d?.name || "Destino" };
}

export default async function DestinoPage({ params }: Props) {
  const { slug } = await params;
  const d = destinations.find((x) => x.slug === slug);
  if (!d) notFound();
  const related = itemsForPlace(d.slug).filter((i) => i.slug !== d.slug);
  const stay = capsulesForPlace(d.slug)[0];

  return (
    <article>
      <div className="relative h-[46vh] min-h-80">
        <Image src={d.image} alt={d.name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-earth/80 to-earth/10" />
        <div className="absolute bottom-8 left-0 right-0 mx-auto max-w-7xl px-4 text-sand">
          <p className="text-xs uppercase tracking-[0.25em] text-gold">
            {d.region}
          </p>
          <h1 className="font-display text-4xl md:text-6xl">{d.name}</h1>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-lg text-bark/80">{d.description}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {d.highlights.map((h) => (
              <li
                key={h}
                className="rounded-full bg-sand px-3 py-1 text-sm text-earth"
              >
                {h}
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <h2 className="font-display text-2xl text-earth">En el mapa</h2>
            <div className="mt-4">
              <MapLoader focusSlug={d.slug} height="420px" />
            </div>
          </div>
        </div>
        <aside className="h-fit rounded-3xl border border-earth/10 bg-white p-6">
          <p className="text-sm text-bark/70">Experiencias desde</p>
          <p className="font-display text-3xl text-earth">
            {formatCLP(d.priceFromCLP)}
          </p>
          <Link
            href={`/planificar?lugar=${d.slug}&presupuesto=800000&noches=4&viajeros=2&intereses=naturaleza,gastronomia`}
            className="mt-6 block rounded-full bg-clay py-3 text-center text-cream"
          >
            Planificar este destino
          </Link>
          {stay && (
            <Link
              href={`/capsulas/${stay.slug}`}
              className="mt-3 block rounded-full border border-earth/15 py-3 text-center text-earth"
            >
              Ver cápsula {stay.name}
            </Link>
          )}
        </aside>
      </div>
      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16">
          <h2 className="font-display text-2xl text-earth">
            Dormir, comer y hacer
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {related.map((i) => (
              <PlaceCard key={i.slug} item={i} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
