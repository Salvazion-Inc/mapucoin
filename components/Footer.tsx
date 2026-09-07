import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-earth/10 bg-earth text-sand">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 rounded-full"
            />
            <p className="font-display text-2xl tracking-wide">MAPUCOIN</p>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-sand/80">
            Mapu es tierra. Coin es encuentro. Plataforma turística de Chile
            impulsada por Grok: presupuesto, destino, cápsulas tecnológicas,
            gastronomía local y un mapa vivo del territorio.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Viajar</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/planificar">Planificar con IA</Link>
            </li>
            <li>
              <Link href="/mapa">Mapa de Chile</Link>
            </li>
            <li>
              <Link href="/capsulas">Cápsulas</Link>
            </li>
            <li>
              <Link href="/partners">Ser partner</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Casa</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href="mailto:hola@mapucoin.com">hola@mapucoin.com</a>
            </li>
            <li>
              <Link href="/terminos">Términos</Link>
            </li>
            <li>
              <Link href="/privacidad">Privacidad</Link>
            </li>
            <li>Santiago, Chile</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-sand/10 py-4 text-center text-xs text-sand/60">
        © {new Date().getFullYear()} Mapucoin · mapucoin.com · Salvazion Inc.
      </div>
    </footer>
  );
}
