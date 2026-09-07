import HeroVideo from "@/components/HeroVideo";
import PlaceCard from "@/components/PlaceCard";
import PlaceVideo from "@/components/PlaceVideo";
import PlannerForm from "@/components/PlannerForm";
import { CHILE_FILM, capsules, destinations, gastronomy } from "@/lib/catalog";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="relative min-h-[92vh] overflow-hidden">
        <HeroVideo />
        <div className="absolute inset-0 bg-gradient-to-r from-night/85 via-night/45 to-night/20" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div className="text-sand">
            <p className="kicker text-gold">Chile · territorio · IA</p>
            <h1 className="font-display mt-4 text-4xl leading-[1.08] md:text-6xl lg:text-[4.4rem]">
              Viaja Chile con presupuesto, cápsulas y Grok.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-sand/80">
              Indica cuánto quieres gastar y el lugar a conocer. Mapucoin arma
              noches en casas cápsula tecnológicas, mesa local y actividades
              sobre un mapa vivo del país.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/mapa" className="btn-ghost px-6 py-2.5">
                Mapa interactivo
              </Link>
              <Link href="/partners" className="btn-gold px-6 py-2.5">
                Ser partner
              </Link>
            </div>
          </div>
          <PlannerForm />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24">
        <p className="kicker text-clay">Cómo funciona</p>
        <h2 className="font-display mt-3 max-w-xl text-3xl text-earth md:text-5xl">
          Presupuesto in, itinerario out.
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            [
              "01",
              "Dices el lugar y el monto",
              "Pucón, Atacama, Paine o Rapa Nui. Grok respeta tu techo en pesos chilenos.",
            ],
            [
              "02",
              "Duermes en cápsulas tech",
              "Módulos con techo estelar, tinaja, Starlink y aislamiento para viento patagónico.",
            ],
            [
              "03",
              "Comes y recorres el territorio",
              "Curanto, cocina mapuche, trekking y termas. Partners locales cobrados con Stripe.",
            ],
          ].map(([n, t, d]) => (
            <article
              key={n}
              className="rounded-[1.75rem] border border-earth/8 bg-white/70 p-7 shadow-[0_10px_40px_rgba(26,16,12,0.04)]"
            >
              <p className="font-display text-gold">{n}</p>
              <h3 className="font-display mt-3 text-2xl text-earth">{t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-bark/70">{d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-night py-20 text-sand">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="kicker text-gold">En movimiento</p>
              <h2 className="font-display mt-3 text-3xl md:text-4xl">
                Chile real: desierto, volcán, granito y Pacífico.
              </h2>
            </div>
            <p className="max-w-sm text-sm text-sand/60">
              Filmación 4K de Torres del Paine, Atacama, Chiloé, Valparaíso,
              Rapa Nui y más.
            </p>
          </div>
          <div className="mt-10">
            <PlaceVideo
              id={CHILE_FILM}
              title="Maravillas de Chile en 4K"
            />
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="kicker text-clay">Destinos</p>
              <h2 className="font-display mt-3 text-3xl text-earth md:text-4xl">
                31 territorios, del Altiplano a la Antártica
              </h2>
            </div>
            <Link
              href="/destinos"
              className="text-sm tracking-wide text-clay hover:text-earth"
            >
              Ver todos →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {["san-pedro-de-atacama", "pucon", "torres-del-paine", "rapa-nui", "valparaiso", "chiloe"]
              .map((slug) => destinations.find((d) => d.slug === slug))
              .filter(Boolean)
              .map((d) => (
                <PlaceCard key={d!.slug} item={d!} />
              ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative h-80 overflow-hidden rounded-[1.75rem] lg:h-[32rem]">
            <Image
              src="/images/capsula-interior.jpg"
              alt="Interior de cápsula Mapucoin"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="kicker text-clay">Cápsulas</p>
            <h2 className="font-display mt-3 text-3xl text-earth md:text-5xl">
              Dormir en tecnología, despertar en el paisaje.
            </h2>
            <p className="mt-5 text-bark/75">
              Casas cápsula de cobre, madera y vidrio. Una en cada paisaje:
              volcán, lago, desierto, bosque nativo, viñedos, ríos, nieve y
              playa. Operadas por partners locales.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {capsules.slice(0, 4).map((c) => (
                <Link
                  key={c.slug}
                  href={`/capsulas/${c.slug}`}
                  className="rounded-2xl border border-earth/8 bg-white p-4 transition hover:border-gold/50"
                >
                  <p className="kicker text-clay">{c.city}</p>
                  <p className="mt-1 font-medium text-earth">{c.name}</p>
                </Link>
              ))}
            </div>
            <Link
              href="/capsulas"
              className="mt-8 inline-block rounded-full bg-earth px-6 py-2.5 text-sand"
            >
              Ver cápsulas
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-earth py-24 text-sand">
        <div className="mx-auto max-w-7xl px-4">
          <p className="kicker text-gold">Gastronomía</p>
          <h2 className="font-display mt-3 text-3xl md:text-4xl">
            La mesa del territorio
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {gastronomy.slice(0, 3).map((g) => (
              <Link
                key={g.slug}
                href={`/gastronomia#${g.slug}`}
                className="group overflow-hidden rounded-[1.75rem] bg-night/40"
              >
                <div className="relative h-52">
                  <Image
                    src={g.image}
                    alt={g.name}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-2xl">{g.name}</h3>
                  <p className="mt-2 text-sm text-sand/70">{g.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
