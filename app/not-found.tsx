import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-4xl text-sand">Territorio no encontrado</h1>
      <p className="mt-3 text-sand/70">Esa ruta no está en el mapa Mapucoin.</p>
      <Link href="/" className="mt-8 inline-block rounded-full bg-gold px-6 py-3 text-black">
        Volver al inicio
      </Link>
    </div>
  );
}
