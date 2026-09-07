import PlaceCard from "@/components/PlaceCard";
import { capsules } from "@/lib/catalog";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = { title: "Cápsulas tecnológicas" };

export default function CapsulasPage() {
  return (
    <div>
      <div className="relative h-80 md:h-96">
        <Image
          src="/images/capsula-atacama.jpg"
          alt="Cápsula Atacama Star"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-night/10" />
        <div className="absolute inset-0 mx-auto flex max-w-7xl items-end px-4 pb-12">
          <div className="text-sand">
            <p className="kicker text-gold">Dormir</p>
            <h1 className="font-display mt-2 text-4xl md:text-6xl">
              Casas cápsula tecnológicas
            </h1>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-14">
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
