"use client";

import AwardsCarousel from "@/components/AwardsCarousel";
import HeroVideo from "@/components/HeroVideo";
import HScroll from "@/components/HScroll";
import MapLoader from "@/components/MapLoader";
import PartnersForm from "@/components/PartnersForm";
import PlaceCard from "@/components/PlaceCard";
import PlannerSection from "@/components/PlannerSection";
import { localizeItem } from "@/lib/catalog-i18n";
import {
  featuredCapsules,
  formatCLP,
  gastronomy,
  groupedActivities,
} from "@/lib/catalog";
import { t, tr } from "@/lib/copy";
import { useLocale } from "@/lib/locale-context";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const { locale } = useLocale();
  const c = t(locale);
  const featured = featuredCapsules();
  const activityGroups = groupedActivities();

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-full focus:bg-gold focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-night"
      >
        {c.skip}
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
            {c.hero.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-sand/80 md:text-lg">
            {c.hero.lead}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/app" className="btn-gold text-base">
              {c.hero.appCta}
            </Link>
            <Link href="#mapa" className="btn-ghost text-base">
              {c.hero.mapCta}
            </Link>
            <Link href="#planificar" className="btn-ghost text-base">
              {c.hero.planCta}
            </Link>
          </div>
        </div>
      </section>

        <section id="mapa" className="scroll-mt-24 py-24">
          <div className="mx-auto max-w-6xl px-5">
            <p className="kicker">{c.map.kicker}</p>
            <h2 className="font-display mt-3 max-w-3xl text-3xl font-bold tracking-tight text-sand md:text-5xl">
              {c.map.title}
            </h2>
            <p className="mt-4 max-w-2xl text-sand/70">
              {c.map.lead}
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
                <p className="kicker">{c.capsules.kicker}</p>
                <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-sand md:text-5xl">
                  {c.capsules.title}
                </h2>
                <p className="mt-5 max-w-xl text-sand/75">
                  {c.capsules.lead}
                </p>
              </div>
              <div className="relative h-64 overflow-hidden rounded-[1.35rem] lg:h-80">
                <Image
                  src="/images/capsulas/intro.jpg"
                  alt={c.capsules.alt}
                  fill
                  className="object-cover object-left"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
            </div>
            <div className="mt-12">
              <HScroll labelPrev={c.nav.prev} labelNext={c.nav.next}>
                {featured.map(({ item: cap, land }) => {
                  return (
                    <Link
                      key={`${land}-${cap.slug}`}
                      href={`/capsulas/${cap.slug}`}
                      className="mapu-card mapu-card-hover group overflow-hidden"
                    >
                      <div className="relative h-56 md:h-64">
                        <Image
                          src={cap.image}
                          alt={cap.name}
                          fill
                          className="object-cover transition duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 80vw, 21rem"
                          draggable={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/20 to-transparent" />
                        <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-[11px] font-semibold tracking-wide text-night">
                          {c.landscapes[land]}
                        </span>
                        <div className="absolute inset-x-0 bottom-0 p-5 text-sand">
                          <p className="kicker text-gold/90">{cap.city}</p>
                          <h3 className="font-display mt-1 text-xl leading-tight">
                            {cap.name}
                          </h3>
                          <p className="mt-2 text-sm font-semibold text-gold">
                            {tr(c.capsules.fromNight, {
                              price: formatCLP(cap.priceFromCLP),
                            })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </HScroll>
            </div>
          </div>
        </section>

        <section
          id="gastronomia"
          className="scroll-mt-24 border-t border-gold/15 bg-black/40 py-24"
        >
          <div className="mx-auto max-w-6xl px-5">
            <p className="kicker">{c.food.kicker}</p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-sand md:text-5xl">
              {c.food.title}
            </h2>
            <p className="mt-4 max-w-2xl text-sand/70">{c.food.lead}</p>
            <div className="mt-10">
              <HScroll
                labelPrev={c.nav.prev}
                labelNext={c.nav.next}
                className="rail-gastro"
              >
                {gastronomy.map((g) => {
                  const dish = localizeItem(g, locale);
                  return (
                    <article
                      key={dish.slug}
                      id={dish.slug}
                      className="mapu-card scroll-mt-28 flex h-full flex-col overflow-hidden"
                    >
                      <div className="relative h-52">
                        <Image
                          src={dish.image}
                          alt={dish.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 84vw, 24rem"
                          draggable={false}
                        />
                      </div>
                      <div className="p-6">
                        <p className="kicker">{dish.city}</p>
                        <h3 className="font-display mt-2 text-2xl text-sand">
                          {dish.name}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-sand/75">
                          {dish.description}
                        </p>
                        <p className="mt-4 text-sm font-semibold text-gold">
                          {tr(c.food.hours, {
                            price: formatCLP(dish.priceFromCLP),
                            hours: dish.durationHours || 1,
                          })}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </HScroll>
            </div>
          </div>
        </section>

        <section id="actividades" className="scroll-mt-24 py-24">
          <div className="mx-auto max-w-6xl px-5">
            <p className="kicker">{c.activities.kicker}</p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-sand md:text-5xl">
              {c.activities.title}
            </h2>
            <p className="mt-4 max-w-2xl text-sand/70">{c.activities.lead}</p>
            {activityGroups.map((group) => (
              <div key={group.id} className="mt-14">
                <p className="kicker">
                  {group.id === "otros"
                    ? c.activities.otherSports
                    : c.activitySports[group.id]}
                </p>
                <h3 className="font-display mt-2 text-2xl tracking-tight text-sand md:text-3xl">
                  {group.id === "otros"
                    ? c.activities.other
                    : c.landscapes[group.id]}
                </h3>
                <div className="mt-6">
                  <HScroll
                    labelPrev={c.nav.prev}
                    labelNext={c.nav.next}
                    className="rail-acts"
                  >
                    {group.items.map((a) => (
                      <div key={a.slug} id={a.slug} className="scroll-mt-28">
                        <PlaceCard item={a} />
                      </div>
                    ))}
                  </HScroll>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          id="planificar"
          className="scroll-mt-24 border-t border-gold/15 bg-black/40 py-24"
        >
          <div className="mx-auto max-w-6xl px-5">
            <p className="kicker">{c.plan.kicker}</p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-sand md:text-5xl">
              {c.plan.title}
            </h2>
            <p className="mt-4 max-w-2xl text-sand/70">{c.plan.lead}</p>
            <PlannerSection />
          </div>
        </section>

        <section id="partners" className="scroll-mt-24 py-24">
          <div className="mx-auto grid max-w-6xl items-start gap-12 px-5 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <p className="kicker">{c.partners.kicker}</p>
              <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-sand md:text-5xl">
                {c.partners.title}
              </h2>
              <p className="mt-4 text-sand/75">{c.partners.lead}</p>
              <p className="mt-4 text-sm text-sand/50">{c.partners.privacy}</p>
            </div>
            <PartnersForm />
          </div>
        </section>

        <section
          id="premios"
          className="scroll-mt-24 border-t border-gold/15 bg-black/40 py-24"
        >
          <div className="mx-auto max-w-6xl px-5">
            <p className="kicker">{c.awards.kicker}</p>
            <h2 className="font-display mt-3 max-w-3xl text-3xl font-bold tracking-tight text-sand md:text-5xl">
              {c.awards.title}
            </h2>
            <p className="mt-4 max-w-2xl text-sand/70">{c.awards.lead}</p>
            <div className="mt-12 pb-10">
              <AwardsCarousel />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
