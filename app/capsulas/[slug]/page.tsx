import CapsulaView from "@/components/CapsulaView";
import { catalogJsonLd } from "@/components/JsonLd";
import { capsules, getBySlug } from "@/lib/catalog";
import { pageTitle } from "@/lib/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return capsules.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = capsules.find((x) => x.slug === slug);
  if (!c) return { title: pageTitle("Cápsula") };
  const title = pageTitle(c.name);
  const description = `${c.tagline} ${c.city}, ${c.region}, Chile.`;
  return {
    title,
    description,
    alternates: { canonical: `/capsulas/${c.slug}` },
    openGraph: {
      title,
      description,
      url: `/capsulas/${c.slug}`,
      images: [c.image],
    },
  };
}

export default async function CapsulaPage({ params }: Props) {
  const { slug } = await params;
  const c = capsules.find((x) => x.slug === slug);
  if (!c) notFound();
  const place = c.placeSlug ? getBySlug(c.placeSlug) || null : null;

  return (
    <>
      {catalogJsonLd(c)}
      <CapsulaView capsule={c} place={place} />
    </>
  );
}
