"use client";

import MapLoader from "@/components/MapLoader";
import PhotoStrip from "@/components/PhotoStrip";
import PlaceCard from "@/components/PlaceCard";
import PlaceVideo from "@/components/PlaceVideo";
import type { CatalogItem } from "@/lib/catalog";
import { formatCLP } from "@/lib/catalog";
import { getParkPass, passesForPlace, type ParkPass } from "@/lib/park-passes";
import { localizeItem } from "@/lib/catalog-i18n";
import { t, tr } from "@/lib/copy";
import { useLocale } from "@/lib/locale-context";
import Image from "next/image";
import Link from "next/link";

export default function DestinoView({
  destination,
  related,
  stay,
  extras,
}: {
  destination: CatalogItem;
  related: CatalogItem[];
  stay?: CatalogItem;
  extras: string[];
}) {
  const { locale } = useLocale();
  const c = t(locale);
  const d = localizeItem(destination, locale);
  const ownPass = getParkPass(d.slug);
  const showPassPrice = Boolean(ownPass && /^(pn|rn|mn)-/.test(d.slug));
  const linkedPasses = passesForPlace(d.slug).filter(
    (pass) => !showPassPrice || pass.slug !== d.slug,
  );

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
              ? ` · ${d.landscapes.map((id) => c.landscapes[id]).join(" · ")}`
              : ""}
          </p>
          <h1 className="font-display mt-2 text-4xl md:text-7xl">{d.name}</h1>
          <p className="mt-3 max-w-2xl text-lg text-sand/80">{d.tagline}</p>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-lg leading-relaxed text-sand/80">{d.description}</p>
          <ul className="mt-7 flex flex-wrap gap-2">
            {d.highlights.map((h) => (
              <li
                key={h}
                className="rounded-full border border-gold/30 px-3.5 py-1.5 text-sm text-gold"
              >
                {h}
              </li>
            ))}
          </ul>

          {d.youtube && (
            <div className="mt-12">
              <p className="kicker text-gold">{c.destino.videoKicker}</p>
              <h2 className="font-display mt-2 text-2xl text-sand">
                {tr(c.destino.videoTitle, { name: d.name })}
              </h2>
              <div className="mt-5">
                <PlaceVideo
                  id={d.youtube}
                  start={d.youtubeStart}
                  title={tr(c.destino.videoAlt, { name: d.name })}
                />
              </div>
            </div>
          )}

          {extras.length > 0 && (
            <div className="mt-10">
              <p className="kicker text-gold">{c.destino.gallery}</p>
              <div className="mt-4">
                <PhotoStrip images={extras} alt={d.name} />
              </div>
            </div>
          )}

          <div className="mt-12">
            <h2 className="font-display text-2xl text-sand">{c.destino.onMap}</h2>
            <div className="mt-4 overflow-hidden rounded-[1.75rem]">
              <MapLoader focusSlug={d.slug} height="420px" />
            </div>
          </div>
        </div>
        <aside className="h-fit rounded-[1.75rem] border border-gold/20 bg-black p-7">
          <p className="kicker text-gold">
            {showPassPrice ? c.destino.passFrom : c.destino.from}
          </p>
          <p className="font-display mt-2 text-4xl text-sand">
            {formatCLP(
              showPassPrice && ownPass
                ? ownPass.day.national.adult
                : d.priceFromCLP,
            )}
          </p>
          {showPassPrice && ownPass && (
            <PassTariff pass={ownPass} c={c} compact />
          )}
          {linkedPasses.map((pass) => (
            <PassTariff key={pass.slug} pass={pass} c={c} />
          ))}
          <Link
            href={`/?lugar=${d.slug}&presupuesto=800000&noches=4&viajeros=2&intereses=naturaleza,gastronomia#planificar`}
            className="mt-7 block rounded-full bg-gold-deep py-3.5 text-center text-white transition hover:bg-gold-hot"
          >
            {c.destino.planThis}
          </Link>
          {stay && (
            <Link
              href={`/capsulas/${stay.slug}`}
              className="mt-3 block rounded-full border border-gold/35 py-3.5 text-center text-gold hover:border-gold"
            >
              {tr(c.destino.seeCapsule, { name: stay.name })}
            </Link>
          )}
        </aside>
      </div>
      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-20">
          <h2 className="font-display text-2xl text-sand">{c.destino.related}</h2>
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

function PassTariff({
  pass,
  c,
  compact = false,
}: {
  pass: ParkPass;
  c: ReturnType<typeof t>;
  compact?: boolean;
}) {
  const day = pass.day;
  return (
    <div className={compact ? "mt-4" : "mt-6 rounded-2xl border border-gold/25 p-4"}>
      {!compact && (
        <>
          <p className="text-[10px] uppercase tracking-[0.16em] text-gold">
            {c.destino.passKicker}
          </p>
          <p className="mt-1 font-medium text-sand">{pass.name}</p>
        </>
      )}
      <p className="mt-2 text-sm text-sand/80">
        {tr(c.destino.passAdult, {
          national: formatCLP(day.national.adult),
          foreign: formatCLP(day.foreign.adult),
        })}
      </p>
      <p className="text-sm text-sand/70">
        {tr(c.destino.passYouth, {
          youth: formatCLP(day.national.youth),
          foreignYouth: formatCLP(day.foreign.youth),
        })}
      </p>
      <p className="mt-1 text-sm text-sand/60">{c.destino.passFree}</p>
      {pass.stay && (
        <p className="mt-1 text-sm text-sand/70">
          {tr(c.destino.passMulti, {
            national: formatCLP(pass.stay.national.adult),
            foreign: formatCLP(pass.stay.foreign.adult),
            day: formatCLP(pass.day.national.adult),
          })}
        </p>
      )}
      <a
        href={pass.buyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 block rounded-full border border-gold/40 py-3 text-center text-gold hover:border-gold"
      >
        {c.destino.buyPass}
      </a>
      <p className="mt-2 text-xs text-sand/45">{c.destino.passSource}</p>
    </div>
  );
}
