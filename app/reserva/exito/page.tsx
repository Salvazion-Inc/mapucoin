import Link from "next/link";

export default function ExitoPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-gold">Listo</p>
      <h1 className="font-display mt-2 text-4xl text-earth">
        Reserva confirmada
      </h1>
      <p className="mt-4 text-bark/75">
        Stripe registró el pago. Te escribimos con el check-in de la cápsula y
        el resto del itinerario.
      </p>
      <Link
        href="/mapa"
        className="mt-8 inline-block rounded-full bg-clay px-6 py-3 text-cream"
      >
        Volver al mapa
      </Link>
    </div>
  );
}
