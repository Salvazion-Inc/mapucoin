import DestinoView from "@/components/DestinoView";
import {
  capsulesForPlace,
  destinationAliases,
  destinations,
  itemsForPlace,
} from "@/lib/catalog";
import { notFound, permanentRedirect } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const d = destinations.find((x) => x.slug === slug);
  return { title: d?.name || "Destino" };
}

export default async function DestinoPage({ params }: Props) {
  const { slug } = await params;
  if (destinationAliases[slug]) {
    permanentRedirect(`/destinos/${destinationAliases[slug]}`);
  }
  const d = destinations.find((x) => x.slug === slug);
  if (!d) notFound();
  const related = itemsForPlace(d.slug).filter((i) => i.slug !== d.slug);
  const stay = capsulesForPlace(d.slug)[0];
  const extras = (d.gallery || []).filter((src) => src !== d.image).slice(0, 3);

  return (
    <DestinoView
      destination={d}
      related={related}
      stay={stay}
      extras={extras}
    />
  );
}
