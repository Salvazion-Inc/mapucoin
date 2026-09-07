import type { Metadata } from "next";

export const metadata: Metadata = { title: "Términos" };

export default function TerminosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 leading-relaxed text-sand/80">
      <h1 className="font-display text-4xl text-sand">Términos</h1>
      <p className="mt-6">
        Mapucoin es una plataforma tecnológica. Las cápsulas, mesas y
        actividades las operan partners independientes. El pago se procesa con
        Stripe. Los itinerarios son sugerencias, no contratos de viaje.
      </p>
      <p className="mt-4">
        Al reservar aceptas las políticas de cancelación del partner y las
        condiciones de Stripe. Dominio: mapucoin.com.
      </p>
    </div>
  );
}
