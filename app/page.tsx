import PlaceCard from "@/components/PlaceCard";
import PlannerForm from "@/components/PlannerForm";
import { capsules, destinations, gastronomy } from "@/lib/catalog";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="relative min-h-[88vh] overflow-hidden">
        <Image
          src="/images/hero-paine.jpg"
          alt="Cápsula Mapucoin en Torres del Paine"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-earth/80 via-earth/45 to-transparent" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div className="text-sand">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">
              Chile · territorio · IA
            </p>
            <h1 className="font-display mt-3 text-4xl leading-tight md:text-6xl">
              Viaja Chile con presupuesto, cápsulas y Grok.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-sand/85">
              Indica cuánto quieres gastar y el lugar a conocer. Mapucoin arma
              noches en casas cápsula tecnológicas, mesa local y actividades
              sobre un mapa vivo del país.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/mapa"
                className="rounded-full border border-sand/40 px-5 py-2.5 text-sand"
              >
                Mapa interactivo
              </Link>
              <Link
                href="/partners"
                className="rounded-full bg-gold px-5 py-2.5 text-earth"
              >
                Ser partner
              </Link>
            </div>
          </div>
          <PlannerForm />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <p className="text-xs uppercase tracking-[0.25em] text-clay">
          Cómo funciona
        </p>
        <h2 className="font-display mt-2 text-3xl text-earth md:text-4xl">
          Presupuesto in, itinerario out.
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
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
              className="rounded-3xl border border-earth/10 bg-white p-6"
            >
              <p className="font-display text-gold">{n}</p>
              <h3 className="font-display mt-2 text-2xl text-earth">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-bark/75">{d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-sand/60 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-clay">
                Destinos
              </p>
              <h2 className="font-display mt-2 text-3xl text-earth">
                Principales lugares de Chile
              </h2>
            </div>
            <Link href="/destinos" className="text-sm text-clay">
              Ver todos →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {destinations.slice(0, 6).map((d) => (
              <PlaceCard key={d.slug} item={d} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative h-80 overflow-hidden rounded-3xl lg:h-[28rem]">
            <Image
              src="/images/capsula-interior.jpg"
              alt="Interior de cápsula Mapucoin"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-clay">
              Cápsulas
            </p>
            <h2 className="font-display mt-2 text-3xl text-earth md:text-4xl">
              Dormir en tecnología, despertar en el paisaje.
            </h2>
            <p className="mt-4 text-bark/80">
              Casas cápsula de cobre, madera y vidrio. Climatización,
              aislamiento acústico y vistas al volcán, al salar o a las Torres.
              Operadas por partners locales.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {capsules.slice(0, 4).map((c) => (
                <Link
                  key={c.slug}
                  href={`/capsulas/${c.slug}`}
                  className="rounded-2xl border border-earth/10 bg-white p-4 hover:border-clay"
                >
                  <p className="text-xs text-clay">{c.city}</p>
                  <p className="font-medium text-earth">{c.name}</p>
                </Link>
              ))}
            </div>
            <Link
              href="/capsulas"
              className="mt-6 inline-block rounded-full bg-earth px-5 py-2.5 text-sand"
            >
              Ver cápsulas
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-earth py-20 text-sand">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-xs uppercase tracking-[0.25em] text-gold">
            Gastronomía
          </p>
          <h2 className="font-display mt-2 text-3xl md:text-4xl">
            La mesa del territorio
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {gastronomy.slice(0, 3).map((g) => (
              <Link
                key={g.slug}
                href={`/gastronomia#${g.slug}`}
                className="overflow-hidden rounded-3xl bg-bark/40"
              >
                <div className="relative h-44">
                  <Image
                    src={g.image}
                    alt={g.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl">{g.name}</h3>
                  <p className="mt-1 text-sm text-sand/75">{g.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
