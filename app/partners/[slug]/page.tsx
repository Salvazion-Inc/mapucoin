import { formatCLP, getBySlug, landscapeLabel } from "@/lib/catalog";
import { listApprovedPublic } from "@/lib/partner-store";
import type { PublicPartner } from "@/lib/partners";
import { getSupabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

async function loadPartner(slug: string): Promise<PublicPartner | null> {
  const db = getSupabase();
  if (!db) return null;
  const partners = await listApprovedPublic(db);
  return partners.find((p) => p.slug === slug) || null;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const partner = await loadPartner(slug);
  return { title: partner?.business || "Partner" };
}

export default async function PartnerSheetPage({ params }: Props) {
  const { slug } = await params;
  const partner = await loadPartner(slug);
  if (!partner) notFound();

  const catalog = getBySlug(partner.slug);
  const reservaHref =
    catalog?.kind === "capsule" ? `/reserva?capsula=${catalog.slug}` : null;

  return (
    <div className="page-pad mx-auto max-w-2xl px-4 pb-16">
      <p className="kicker text-gold">Partner</p>
      <h1 className="font-display mt-3 text-4xl text-sand">{partner.business}</h1>
      <p className="mt-2 text-sand/70">
        {partner.city}
        {partner.landscape ? ` · ${landscapeLabel(partner.landscape)}` : ""}
      </p>
      {partner.offer_summary ? (
        <p className="mt-6 text-sand/80">{partner.offer_summary}</p>
      ) : null}
      {partner.price_from_clp > 0 ? (
        <p className="mt-4 text-gold">{formatCLP(partner.price_from_clp)}</p>
      ) : null}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={`/#mapa`}
          className="rounded-full border border-gold/40 px-5 py-2.5 text-sand hover:border-gold hover:text-gold"
        >
          Mapa
        </Link>
        {reservaHref ? (
          <Link
            href={reservaHref}
            className="rounded-full bg-gold px-5 py-2.5 text-black hover:bg-[#e3c25a]"
          >
            Reservar
          </Link>
        ) : null}
      </div>
    </div>
  );
}
