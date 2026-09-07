import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacidad" };

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 leading-relaxed text-bark/80">
      <h1 className="font-display text-4xl text-earth">Privacidad</h1>
      <p className="mt-6">
        Guardamos nombre, correo y datos de reserva en Supabase para operar el
        viaje. Stripe procesa el pago; Mapucoin no almacena números de tarjeta.
        Grok recibe presupuesto, destino e intereses para armar el itinerario.
      </p>
    </div>
  );
}
