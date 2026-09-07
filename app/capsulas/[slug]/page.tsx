import MapLoader from "@/components/MapLoader";
import { capsules, formatCLP, getBySlug, landscapeLabel } from "@/lib/catalog";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return capsules.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const c = capsules.find((x) => x.slug === slug);
  return { title: c?.name || "Cápsula" };
}

export default async function CapsulaPage({ params }: Props) {
  const { slug } = await params;
  const c = capsules.find((x) => x.slug === slug);
  if (!c) notFound();
  const place = c.placeSlug ? getBySlug(c.placeSlug) : null;

  return (
    <article>
      <div className="relative h-[50vh] min-h-96">
        <Image src={c.image} alt={c.name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/35 to-transparent" />
        <div className="absolute bottom-8 left-0 right-0 mx-auto max-w-7xl px-4 text-sand">
          <p className="kicker text-gold">
            {c.city}
            {c.landscapes?.length
              ? ` · ${c.landscapes.map(landscapeLabel).join(" · ")}`
              : ""}
          </p>
          <h1 className="font-display mt-2 text-4xl md:text-6xl">{c.name}</h1>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="text-lg text-sand/80">{c.description}</p>
          <ul className="mt-6 space-y-2 text-sand">
            {c.highlights.map((h) => (
              <li key={h}>· {h}</li>
            ))}
          </ul>
          <div className="relative mt-8 h-64 overflow-hidden rounded-3xl">
            <Image
              src="/images/capsula-interior.jpg"
              alt="Interior de cobre, madera y vidrio"
              fill
              className="object-cover"
            />
          </div>
          <div className="mt-8">
            <h2 className="font-display text-2xl text-sand">Ubicación</h2>
            <div className="mt-4">
              <MapLoader focusSlug={c.slug} height="380px" />
            </div>
          </div>
        </div>
        <aside className="h-fit rounded-[1.75rem] border border-gold/20 bg-black p-7">
          <p className="text-sm text-sand/70">Por noche</p>
          <p className="font-display text-4xl text-sand">
            {formatCLP(c.priceFromCLP)}
          </p>
          <p className="mt-1 text-sm text-sand/50">
            Hasta {c.capacity} viajeros · {c.region}
          </p>
          <Link
            href={`/reserva?capsula=${c.slug}&noches=2&viajeros=2`}
            className="mt-6 block rounded-full bg-gold py-3.5 text-center text-black hover:bg-[#e3c25a]"
          >
            Reservar
          </Link>
          {place && (
            <Link
              href={`/destinos/${place.slug}`}
              className="mt-3 block text-center text-sm text-gold"
            >
              Explorar {place.name} →
            </Link>
          )}
        </aside>
      </div>
    </article>
  );
}
