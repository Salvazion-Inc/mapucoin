import Link from "next/link";

export default function ExitoPage() {
  return (
    <div className="page-pad mx-auto max-w-xl px-4 pb-24 text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-gold">Listo</p>
      <h1 className="font-display mt-2 text-4xl text-sand">
        Reserva confirmada
      </h1>
      <p className="mt-4 text-sand/75">
        Stripe registró el pago. Te escribimos con el check-in de la cápsula y
        el resto del itinerario.
      </p>
      <Link
        href="/#mapa"
        className="btn-gold mt-8"
      >
        Volver al mapa
      </Link>
    </div>
  );
}
