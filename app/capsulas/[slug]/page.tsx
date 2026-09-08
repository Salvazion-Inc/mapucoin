import CapsulaView from "@/components/CapsulaView";
import { capsules, getBySlug } from "@/lib/catalog";
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
  const place = c.placeSlug ? getBySlug(c.placeSlug) || null : null;

  return <CapsulaView capsule={c} place={place} />;
}
