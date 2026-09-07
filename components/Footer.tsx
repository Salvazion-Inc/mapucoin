import BrandMark from "@/components/BrandMark";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-gold/20 bg-black text-sand">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <BrandMark size={52} />
            <p className="font-display text-2xl tracking-[0.2em] text-gold">
              MAPUCOIN
            </p>
          </div>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-sand/70">
            Mapu es tierra. Coin es encuentro. Plataforma turística de Chile:
            presupuesto, destino, cápsulas tecnológicas, gastronomía local y un
            mapa vivo del territorio.
          </p>
        </div>
        <div>
          <p className="kicker text-gold">Viajar</p>
          <ul className="mt-4 space-y-2.5 text-sm text-sand/80">
            <li>
              <Link href="/planificar" className="hover:text-gold">
                Planificar
              </Link>
            </li>
            <li>
              <Link href="/mapa" className="hover:text-gold">
                Mapa de Chile
              </Link>
            </li>
            <li>
              <Link href="/capsulas" className="hover:text-gold">
                Cápsulas
              </Link>
            </li>
            <li>
              <Link href="/partners" className="hover:text-gold">
                Ser partner
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="kicker text-gold">Casa</p>
          <ul className="mt-4 space-y-2.5 text-sm text-sand/80">
            <li>
              <a href="mailto:hola@mapucoin.com" className="hover:text-gold">
                hola@mapucoin.com
              </a>
            </li>
            <li>
              <Link href="/terminos" className="hover:text-gold">
                Términos
              </Link>
            </li>
            <li>
              <Link href="/privacidad" className="hover:text-gold">
                Privacidad
              </Link>
            </li>
            <li>Santiago, Chile</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-sand/10 py-5 text-center text-[11px] tracking-wide text-sand/45">
        © {new Date().getFullYear()} Mapucoin · mapucoin.com · Salvazion Inc. ·
        fotos Wikimedia Commons
      </div>
    </footer>
  );
}
