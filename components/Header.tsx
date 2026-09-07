"use client";

import BrandMark from "@/components/BrandMark";
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
    <header className="sticky top-0 z-40 border-b border-earth/8 bg-cream/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <BrandMark size={46} priority />
          <span className="font-display text-xl tracking-[0.18em] text-earth">
            MAPUCOIN
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((l) => {
            const active = path === l.href || path.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`text-[13px] tracking-wide transition ${
                  active
                    ? "text-clay"
                    : "text-bark/70 hover:text-earth"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <Link
            href="/planificar"
            className="rounded-full bg-earth px-4 py-2 text-[13px] font-medium text-sand transition hover:bg-bark"
          >
            Viajar con IA
          </Link>
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-earth/10 lg:hidden"
          aria-label="Menú"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="flex flex-col gap-1.5">
            <span className="block h-px w-4 bg-earth" />
            <span className="block h-px w-4 bg-earth" />
          </span>
        </button>
      </div>

      {open && (
        <div className="border-t border-earth/10 bg-cream px-4 py-4 lg:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block py-2.5 text-bark"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/planificar"
            className="mt-2 block rounded-full bg-earth py-2.5 text-center text-sm text-sand"
            onClick={() => setOpen(false)}
          >
            Viajar con IA
          </Link>
        </div>
      )}
    </header>
  );
}
