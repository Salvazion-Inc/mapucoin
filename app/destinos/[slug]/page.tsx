import MapLoader from "@/components/MapLoader";
import PhotoStrip from "@/components/PhotoStrip";
import PlaceCard from "@/components/PlaceCard";
import PlaceVideo from "@/components/PlaceVideo";
import {
  capsulesForPlace,
  destinationAliases,
  destinations,
  formatCLP,
  itemsForPlace,
  landscapeLabel,
} from "@/lib/catalog";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

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
  if (destinationAliases[slug]) {
    permanentRedirect(`/destinos/${destinationAliases[slug]}`);
  }
  const d = destinations.find((x) => x.slug === slug);
  if (!d) notFound();
  const related = itemsForPlace(d.slug).filter((i) => i.slug !== d.slug);
  const stay = capsulesForPlace(d.slug)[0];
  const extras = (d.gallery || []).filter((src) => src !== d.image).slice(0, 3);

  return (
    <article>
      <div className="relative h-[58vh] min-h-96">
        <Image
          src={d.image}
          alt={d.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent" />
        <div className="absolute bottom-10 left-0 right-0 mx-auto max-w-7xl px-4 text-sand">
          <p className="kicker text-gold">
            {d.region}
            {d.landscapes?.length
              ? ` · ${d.landscapes.map(landscapeLabel).join(" · ")}`
              : ""}
          </p>
          <h1 className="font-display mt-2 text-4xl md:text-7xl">{d.name}</h1>
          <p className="mt-3 max-w-2xl text-lg text-sand/80">{d.tagline}</p>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-lg leading-relaxed text-bark/80">{d.description}</p>
          <ul className="mt-7 flex flex-wrap gap-2">
            {d.highlights.map((h) => (
              <li
                key={h}
                className="rounded-full bg-sand px-3.5 py-1.5 text-sm text-earth"
              >
                {h}
              </li>
            ))}
          </ul>

          {d.youtube && (
            <div className="mt-12">
              <p className="kicker text-clay">Video del territorio</p>
              <h2 className="font-display mt-2 text-2xl text-earth">
                {d.name} en movimiento
              </h2>
              <div className="mt-5">
                <PlaceVideo
                  id={d.youtube}
                  start={d.youtubeStart}
                  title={`Video de ${d.name}`}
                />
              </div>
            </div>
          )}

          {extras.length > 0 && (
            <div className="mt-10">
              <p className="kicker text-clay">Galería</p>
              <div className="mt-4">
                <PhotoStrip images={extras} alt={d.name} />
              </div>
            </div>
          )}

          <div className="mt-12">
            <h2 className="font-display text-2xl text-earth">En el mapa</h2>
            <div className="mt-4 overflow-hidden rounded-[1.75rem]">
              <MapLoader focusSlug={d.slug} height="420px" />
            </div>
          </div>
        </div>
        <aside className="h-fit rounded-[1.75rem] border border-earth/8 bg-white p-7 shadow-[0_18px_50px_rgba(12,9,7,0.06)]">
          <p className="kicker text-clay">Experiencias desde</p>
          <p className="font-display mt-2 text-4xl text-earth">
            {formatCLP(d.priceFromCLP)}
          </p>
          <Link
            href={`/planificar?lugar=${d.slug}&presupuesto=800000&noches=4&viajeros=2&intereses=naturaleza,gastronomia`}
            className="mt-7 block rounded-full bg-earth py-3.5 text-center text-sand transition hover:bg-bark"
          >
            Planificar este destino
          </Link>
          {stay && (
            <Link
              href={`/capsulas/${stay.slug}`}
              className="mt-3 block rounded-full border border-earth/12 py-3.5 text-center text-earth hover:border-gold"
            >
              Ver cápsula {stay.name}
            </Link>
          )}
        </aside>
      </div>
      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-20">
          <h2 className="font-display text-2xl text-earth">
            Dormir, comer y hacer
          </h2>
          <div className="mt-7 grid gap-6 md:grid-cols-3">
            {related.map((i) => (
              <PlaceCard key={i.slug} item={i} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
