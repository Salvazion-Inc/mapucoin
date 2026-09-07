"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/planificar", label: "Planificar" },
  { href: "/mapa", label: "Mapa" },
  { href: "/destinos", label: "Destinos" },
  { href: "/capsulas", label: "Cápsulas" },
  { href: "/gastronomia", label: "Gastronomía" },
  { href: "/actividades", label: "Actividades" },
  { href: "/partners", label: "Partners" },
];

export default function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-earth/10 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Mapucoin"
            width={44}
            height={44}
            className="h-11 w-11 rounded-full"
            priority
          />
          <span className="font-display text-xl tracking-wide text-earth">
            MAPUCOIN
          </span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm ${
                path === l.href || path.startsWith(l.href + "/")
                  ? "text-clay"
                  : "text-bark/80 hover:text-clay"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/planificar"
            className="rounded-full bg-clay px-4 py-2 text-sm font-medium text-cream hover:bg-ember"
          >
            Viajar con IA
          </Link>
        </nav>

        <button
          type="button"
          className="lg:hidden"
          aria-label="Menú"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="block h-0.5 w-6 bg-earth" />
          <span className="mt-1.5 block h-0.5 w-6 bg-earth" />
        </button>
      </div>

      {open && (
        <div className="border-t border-earth/10 bg-cream px-4 py-3 lg:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block py-2 text-bark"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
