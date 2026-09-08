import AwardsCarousel from "@/components/AwardsCarousel";
import HeroVideo from "@/components/HeroVideo";
import MapLoader from "@/components/MapLoader";
import PartnersForm from "@/components/PartnersForm";
import PlaceCard from "@/components/PlaceCard";
import PlannerSection from "@/components/PlannerSection";
import {
  activities,
  featuredCapsules,
  formatCLP,
  gastronomy,
  landscapeLabel,
} from "@/lib/catalog";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const capsules = featuredCapsules();

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-full focus:bg-gold focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-night"
      >
        Saltar al contenido
      </a>

      <main id="main">
      <section
        id="home"
        className="relative flex min-h-screen items-center justify-center overflow-hidden"
        aria-labelledby="hero-heading"
      >
        <HeroVideo />
        <div className="hero-veil absolute inset-0" />
        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-5 pb-16 pt-28 text-center">
          <h1
            id="hero-heading"
            className="hero-title font-display max-w-4xl text-4xl font-bold leading-[1.05] text-sand md:text-6xl lg:text-7xl"
          >
            Chile, de norte a sur.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-sand/80 md:text-lg">
            Cápsulas de cobre y vidrio en desiertos, playas, viñedos, volcanes,
            ríos, lagos, bosques y nieve. Mesa local y presupuesto en CLP.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="#mapa" className="btn-gold text-base">
              Mapa interactivo
            </Link>
            <Link href="#planificar" className="btn-ghost text-base">
              Planificar
            </Link>
          </div>
        </div>
      </section>

        <section id="mapa" className="scroll-mt-24 py-24">
          <div className="mx-auto max-w-6xl px-5">
            <p className="kicker">Mapa</p>
            <h2 className="font-display mt-3 max-w-3xl text-3xl font-bold tracking-tight text-sand md:text-5xl">
              Chile clasificado por paisaje
            </h2>
            <p className="mt-4 max-w-2xl text-sand/70">
              Filtra desiertos, playas, viñedos, volcanes, ríos, lagos, bosques
              y nieve. Cada pin es un territorio con su cápsula.
            </p>
            <div className="mapu-card mt-10 overflow-hidden p-2">
              <MapLoader height="72vh" />
            </div>
          </div>
        </section>

        <section id="capsulas" className="scroll-mt-24 border-t border-gold/15 py-24">
          <div className="mx-auto max-w-6xl px-5">
            <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <p className="kicker">Cápsulas</p>
                <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-sand md:text-5xl">
                  Ocho paisajes, una casa cápsula
                </h2>
                <p className="mt-5 max-w-xl text-sand/75">
                  Cobre, vidrio y madera. Off-grid opcional, aislación de −40 °C
                  a 40 °C. Una cápsula por paisaje, operada por partners
                  locales.
                </p>
              </div>
              <div className="relative h-64 overflow-hidden rounded-[1.35rem] lg:h-80">
                <Image
                  src="/images/capsulas/intro.jpg"
                  alt="Casa cápsula Mapucoin"
                  fill
                  className="object-cover object-left"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {capsules.map((c) => {
                const land = c.landscapes?.[0];
                return (
                  <Link
                    key={c.slug}
                    href={`/capsulas/${c.slug}`}
                    className="mapu-card mapu-card-hover group overflow-hidden"
                  >
                    <div className="relative h-56">
                      <Image
                        src={c.image}
                        alt={c.name}
                        fill
                        className="object-cover transition duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/20 to-transparent" />
                      {land && (
                        <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-[11px] font-semibold tracking-wide text-night">
                          {landscapeLabel(land)}
                        </span>
                      )}
                      <div className="absolute inset-x-0 bottom-0 p-5 text-sand">
                        <p className="kicker text-gold/90">{c.city}</p>
                        <h3 className="font-display mt-1 text-xl leading-tight">
                          {c.name}
                        </h3>
                        <p className="mt-2 text-sm font-semibold text-gold">
                          desde {formatCLP(c.priceFromCLP)} / noche
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="gastronomia"
          className="scroll-mt-24 border-t border-gold/15 bg-black/40 py-24"
        >
          <div className="mx-auto max-w-6xl px-5">
            <p className="kicker">Gastronomía</p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-sand md:text-5xl">
              La mesa del territorio
            </h2>
            <p className="mt-4 max-w-2xl text-sand/70">
              Curanto, empanadas de pino, pastel de choclo, caldillo de congrio,
              mote con huesillos y la mesa de cada territorio. Con partners
              locales.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {gastronomy.map((g) => (
                <article
                  key={g.slug}
                  id={g.slug}
                  className="mapu-card scroll-mt-28 overflow-hidden"
                >
                  <div className="relative h-56">
                    <Image
                      src={g.image}
                      alt={g.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="p-6">
                    <p className="kicker">{g.city}</p>
                    <h3 className="font-display mt-2 text-2xl text-sand">
                      {g.name}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-sand/75">
                      {g.description}
                    </p>
                    <p className="mt-4 text-sm font-semibold text-gold">
                      {formatCLP(g.priceFromCLP)} · {g.durationHours} h
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="actividades" className="scroll-mt-24 py-24">
          <div className="mx-auto max-w-6xl px-5">
            <p className="kicker">Actividades</p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-sand md:text-5xl">
              Lo que se hace en el territorio
            </h2>
            <p className="mt-4 max-w-2xl text-sand/70">
              Trekking, termas, astronomía, kayak, volcanes y amaneceres. Cada
              una entra al itinerario según tu presupuesto.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activities.map((a) => (
                <div key={a.slug} id={a.slug} className="scroll-mt-28">
                  <PlaceCard item={a} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="planificar"
          className="scroll-mt-24 border-t border-gold/15 bg-black/40 py-24"
        >
          <div className="mx-auto max-w-6xl px-5">
            <p className="kicker">Planificar</p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-sand md:text-5xl">
              Tu viaje, a tu presupuesto
            </h2>
            <p className="mt-4 max-w-2xl text-sand/70">
              Indica cuánto quieres gastar y el lugar. Mapucoin arma noches en
              cápsula, mesa y actividades.
            </p>
            <PlannerSection />
          </div>
        </section>

        <section id="partners" className="scroll-mt-24 py-24">
          <div className="mx-auto grid max-w-6xl items-start gap-12 px-5 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <p className="kicker">Partners</p>
              <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-sand md:text-5xl">
                Ingresa como partner
              </h2>
              <p className="mt-4 text-sand/75">
                Operas una cápsula, una ruka, una caleta, un tour o una viña.
                Mapucoin te muestra en el mapa, entra al itinerario y cobra con
                Stripe.
              </p>
            </div>
            <PartnersForm />
          </div>
        </section>

        <section
          id="premios"
          className="scroll-mt-24 border-t border-gold/15 bg-black/40 py-24"
        >
          <div className="mx-auto max-w-6xl px-5">
            <p className="kicker">Premios</p>
            <h2 className="font-display mt-3 max-w-3xl text-3xl font-bold tracking-tight text-sand md:text-5xl">
              Premios y reconocimientos internacionales
            </h2>
            <p className="mt-4 max-w-2xl text-sand/70">
              Chile, Atacama, Santiago, Rapa Nui y Torres del Paine,
              distinguidos por World Travel Awards, TIME, Forbes, Tripadvisor y
              UNESCO.
            </p>
            <div className="mt-12 pb-10">
              <AwardsCarousel />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
