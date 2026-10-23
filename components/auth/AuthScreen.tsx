"use client";

import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export function AuthScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-night px-5 pb-16 pt-10 text-sand">
      <div className="mx-auto flex max-w-md items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <BrandMark size={56} priority />
          <span className="font-display tracking-[0.16em] text-gold">MAPUCOIN</span>
        </Link>
        <LanguageSwitcher compact />
      </div>
      <section className="mx-auto mt-12 max-w-md">{children}</section>
    </div>
  );
}
