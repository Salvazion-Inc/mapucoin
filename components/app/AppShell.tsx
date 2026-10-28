"use client";

import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { AccountChip } from "@/components/AccountChip";
import { BiometricEnrollPrompt } from "@/components/auth/BiometricEnrollPrompt";
import HtmlLang from "@/components/HtmlLang";
import { at, type AppTab } from "@/lib/app-copy";
import { useLocale } from "@/lib/locale-context";
import { useLocation } from "@/lib/location";
import {
  IconAccount,
  IconCapsule,
  IconPin,
  IconTable,
  IconTrip,
} from "./icons";

const TABS: {
  id: AppTab;
  href: string;
  Icon: typeof IconPin;
}[] = [
  { id: "explorar", href: "/app", Icon: IconPin },
  { id: "capsulas", href: "/app/capsulas", Icon: IconCapsule },
  { id: "viaje", href: "/app/viaje", Icon: IconTrip },
  { id: "mesa", href: "/app/mesa", Icon: IconTable },
  { id: "cuenta", href: "/app/cuenta", Icon: IconAccount },
];

export function AppShell({
  tab,
  children,
}: {
  tab: AppTab;
  children: React.ReactNode;
}) {
  const { locale } = useLocale();
  const c = at(locale);
  const { here, located } = useLocation();

  return (
    <div className="app-shell min-h-dvh bg-night text-sand">
      <BiometricEnrollPrompt />
      <HtmlLang />
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[4.75rem] flex-col items-center border-r border-gold/15 bg-night/95 py-4 backdrop-blur-xl md:flex">
        <Link href="/app" className="mb-6">
          <BrandMark size={44} />
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {TABS.map(({ id, href, Icon }) => {
            const active = tab === id;
            return (
              <Link
                key={id}
                href={href}
                className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-3 text-[10px] font-semibold transition ${
                  active
                    ? "bg-gold/18 text-gold shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-gold)_35%,transparent)]"
                    : "text-sand/55 hover:bg-sand/5 hover:text-sand"
                }`}
              >
                <Icon className="h-6 w-6" />
                {c.tabs[id]}
              </Link>
            );
          })}
        </nav>
      </aside>

      <header
        data-app-header=""
        className="app-header-glass sticky top-0 z-30 border-b border-gold/15 px-3 py-3 md:ml-[4.75rem] md:px-4"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2 md:gap-3">
            <span className="shrink-0 md:hidden">
              <BrandMark size={40} priority />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-none tracking-[0.12em] text-gold md:tracking-[0.16em]">
                {c.appName.toUpperCase()}
              </p>
              <p className="mt-1 truncate text-xs text-gold/80">
                {located && here.label !== "GPS" ? here.label : located ? c.nearby : c.location}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-xs font-semibold md:gap-3">
            <div className="hidden md:block">
              <LanguageSwitcher compact />
            </div>
            <AccountChip />
            <Link href="/" className="hidden text-sand/60 hover:text-gold sm:inline">
              {c.openMarketing}
            </Link>
          </div>
        </div>
        <div className="mt-2 overflow-x-auto md:hidden">
          <LanguageSwitcher compact />
        </div>
      </header>

      <main className="app-main mx-auto w-full max-w-6xl px-4 pb-28 pt-5 md:ml-[4.75rem] md:pb-10">
        {children}
      </main>

      <nav
        className="app-header-glass fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-gold/15 px-1 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-2 md:hidden"
        aria-label={c.appName}
      >
        {TABS.map(({ id, href, Icon }) => {
          const active = tab === id;
          return (
            <Link
              key={id}
              href={href}
              className={`flex flex-col items-center gap-1 py-1 text-[10px] font-semibold ${
                active ? "text-gold" : "text-sand/50"
              }`}
            >
              <Icon className="h-6 w-6" />
              {c.tabs[id]}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
