import Link from "next/link";

export default function ExitoPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-gold">Listo</p>
      <h1 className="font-display mt-2 text-4xl text-sand">
        Reserva confirmada
      </h1>
      <p className="mt-4 text-sand/75">
        Stripe registró el pago. Te escribimos con el check-in de la cápsula y
        el resto del itinerario.
      </p>
      <Link
        href="/mapa"
        className="mt-8 inline-block rounded-full bg-gold px-6 py-3 text-black"
      >
        Volver al mapa
      </Link>
    </div>
  );
}
