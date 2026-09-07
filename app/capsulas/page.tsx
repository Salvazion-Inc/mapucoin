import PlaceCard from "@/components/PlaceCard";
import { capsules } from "@/lib/catalog";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = { title: "Cápsulas tecnológicas" };

export default function CapsulasPage() {
  return (
    <div>
      <div className="relative h-72">
        <Image
          src="/images/capsula-atacama.jpg"
          alt="Cápsula Atacama Star"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-earth/50" />
        <div className="absolute inset-0 mx-auto flex max-w-7xl items-end px-4 pb-10">
          <div className="text-sand">
            <p className="text-xs uppercase tracking-[0.25em] text-gold">
              Dormir
            </p>
            <h1 className="font-display text-4xl md:text-5xl">
              Casas cápsula tecnológicas
            </h1>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-12">
        <p className="max-w-2xl text-bark/75">
          Módulos de cobre, madera y vidrio: techo estelar en el desierto,
          tinaja frente al volcán, palafito sobre el canal chilote. Reserva con
          Stripe.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {capsules.map((c) => (
            <PlaceCard key={c.slug} item={c} />
          ))}
        </div>
      </div>
    </div>
  );
}
