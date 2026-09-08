"use client";

import { t } from "@/lib/copy";
import { useLocale } from "@/lib/locale-context";
import Link from "next/link";

const X_URL = "https://x.com/MAPUCOIN";

function XLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      role="img"
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

export default function Footer() {
  const { locale } = useLocale();
  const c = t(locale);

  return (
    <footer className="border-t border-gold/20 bg-night">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-[11px] text-sand/50 sm:flex-row">
        <p>
          <a href="https://salvazion.org" className="hover:text-gold">
            All Rights Reserved for Salvazion Inc. {new Date().getFullYear()}.
          </a>
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/terminos" className="hover:text-gold">
            {c.footer.terms}
          </Link>
          <a
            href={X_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-sand transition hover:border-gold hover:text-gold"
            aria-label="@MAPUCOIN on X"
            title="@MAPUCOIN"
          >
            <XLogo className="h-4 w-4" />
          </a>
          <Link href="/privacidad" className="hover:text-gold">
            {c.footer.privacy}
          </Link>
        </div>
      </div>
    </footer>
  );
}
