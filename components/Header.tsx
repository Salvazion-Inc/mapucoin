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
    <header className="sticky top-0 z-40 border-b border-gold/30 bg-black">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <BrandMark size={46} priority />
          <span className="font-display text-xl tracking-[0.18em] text-gold">
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
                  active ? "text-gold" : "text-sand/70 hover:text-gold"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <Link
            href="/planificar"
            className="rounded-full bg-gold px-4 py-2 text-[13px] font-medium text-black transition hover:bg-[#e3c25a]"
          >
            Planificar
          </Link>
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 lg:hidden"
          aria-label="Menú"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="flex flex-col gap-1.5">
            <span className="block h-px w-4 bg-gold" />
            <span className="block h-px w-4 bg-gold" />
          </span>
        </button>
      </div>

      {open && (
        <div className="border-t border-gold/20 bg-black px-4 py-4 lg:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block py-2.5 text-gold"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/planificar"
            className="mt-2 block rounded-full bg-gold py-2.5 text-center text-sm font-medium text-black"
            onClick={() => setOpen(false)}
          >
            Planificar
          </Link>
        </div>
      )}
    </header>
  );
}
