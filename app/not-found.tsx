import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-pad mx-auto max-w-xl px-4 pb-24 text-center">
      <h1 className="font-display text-4xl text-sand">Territorio no encontrado</h1>
      <p className="mt-3 text-sand/70">Esa ruta no está en el mapa Mapucoin.</p>
      <Link href="/" className="btn-gold mt-8">
        Volver al inicio
      </Link>
    </div>
  );
}
