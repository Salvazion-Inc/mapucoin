"use client";

import BrandMark from "@/components/BrandMark";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/#mapa", hash: "mapa", label: "Mapa" },
  { href: "/#capsulas", hash: "capsulas", label: "Cápsulas" },
  { href: "/#gastronomia", hash: "gastronomia", label: "Gastronomía" },
  { href: "/#actividades", hash: "actividades", label: "Actividades" },
  { href: "/#partners", hash: "partners", label: "Partners" },
];

export default function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hash, setHash] = useState("home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const read = () =>
      setHash((window.location.hash.replace("#", "") || "home").toLowerCase());
    read();
    window.addEventListener("hashchange", read);

    const ids = ["home", ...links.map((l) => l.hash), "planificar"];
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) {
      return () => window.removeEventListener("hashchange", read);
    }

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setHash(visible.target.id);
      },
      { rootMargin: "-35% 0px -50% 0px", threshold: [0.1, 0.25, 0.5] },
    );
    els.forEach((el) => io.observe(el));
    return () => {
      window.removeEventListener("hashchange", read);
      io.disconnect();
    };
  }, [path]);

  function isActive(link: (typeof links)[number]) {
    if (path === "/") return hash === link.hash;
    if (link.hash === "capsulas" && path.startsWith("/capsulas")) return true;
    if (link.hash === "mapa" && path.startsWith("/destinos")) return true;
    if (link.hash === "partners" && path.startsWith("/partners")) return true;
    return false;
  }

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 md:h-16 md:px-5">
        <Link href="/#home" className="flex items-center gap-2.5">
          <BrandMark size={40} priority />
          <span className="hidden font-display text-lg tracking-[0.16em] text-gold sm:inline">
            MAPUCOIN
          </span>
        </Link>

        <div className="hidden items-center gap-5 text-[13px] font-semibold text-sand/80 lg:flex">
          {links.map((l) => (
            <Link
              key={l.hash}
              href={l.href}
              className={`transition ${
                isActive(l) ? "text-gold" : "hover:text-gold"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/#planificar" className="btn-gold !px-4 !py-2 text-xs">
            Planificar
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Link href="/#planificar" className="btn-gold !px-3.5 !py-1.5 text-xs">
            Planificar
          </Link>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40"
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
      </nav>

      {open && (
        <div className="border-t border-gold/20 bg-night px-4 py-4 lg:hidden">
          {links.map((l) => (
            <Link
              key={l.hash}
              href={l.href}
              className="block py-2.5 text-gold"
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
