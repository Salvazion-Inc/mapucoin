import MapLoader from "@/components/MapLoader";
import { capsules, formatCLP, getBySlug } from "@/lib/catalog";
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
          <p className="kicker text-gold">{c.city}</p>
          <h1 className="font-display mt-2 text-4xl md:text-6xl">{c.name}</h1>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="text-lg text-bark/80">{c.description}</p>
          <ul className="mt-6 space-y-2 text-earth">
            {c.highlights.map((h) => (
              <li key={h}>· {h}</li>
            ))}
          </ul>
          <div className="relative mt-8 h-64 overflow-hidden rounded-3xl">
            <Image
              src="/images/capsula-interior.jpg"
              alt="Interior de cápsula"
              fill
              className="object-cover"
            />
          </div>
          <div className="mt-8">
            <h2 className="font-display text-2xl text-earth">Ubicación</h2>
            <div className="mt-4">
              <MapLoader focusSlug={c.slug} height="380px" />
            </div>
          </div>
        </div>
        <aside className="h-fit rounded-[1.75rem] border border-earth/8 bg-white p-7 shadow-[0_18px_50px_rgba(12,9,7,0.06)]">
          <p className="text-sm text-bark/70">Por noche</p>
          <p className="font-display text-4xl text-earth">
            {formatCLP(c.priceFromCLP)}
          </p>
          <p className="mt-1 text-sm text-bark/60">
            Hasta {c.capacity} viajeros · {c.region}
          </p>
          <Link
            href={`/reserva?capsula=${c.slug}&noches=2&viajeros=2`}
            className="mt-6 block rounded-full bg-earth py-3.5 text-center text-sand hover:bg-bark"
          >
            Reservar con Stripe
          </Link>
          {place && (
            <Link
              href={`/destinos/${place.slug}`}
              className="mt-3 block text-center text-sm text-clay"
            >
              Explorar {place.name} →
            </Link>
          )}
        </aside>
      </div>
    </article>
  );
}
