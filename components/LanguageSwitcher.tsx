"use client";

import { t } from "@/lib/copy";
import { LOCALES, localeMeta } from "@/lib/locale";
import { useLocale } from "@/lib/locale-context";

export default function LanguageSwitcher({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { locale, setLocale } = useLocale();
  const groupLabel = t(locale).language;
  const size = compact
    ? "h-[15px] w-[22px]"
    : "h-[15px] w-[22px] md:h-[19px] md:w-[28px]";

  return (
    <nav
      aria-label={groupLabel}
      className={`flex items-center ${compact ? "gap-1" : "gap-1.5"}`}
    >
      {LOCALES.map((code) => {
        const meta = localeMeta[code];
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            title={meta.name}
            aria-label={meta.name}
            aria-current={active ? "true" : undefined}
            onClick={() => setLocale(code)}
            className="inline-flex shrink-0 flex-col items-center gap-0.5 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <span className={`lang-flag ${active ? "lang-flag-active" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/flags/${meta.flag}.svg`}
                alt=""
                width={compact ? 22 : 28}
                height={compact ? 15 : 19}
                className={`block ${size}`}
              />
            </span>
            <span className="sr-only">{meta.name}</span>
          </button>
        );
      })}
      <span className="ml-0.5 whitespace-nowrap text-[11px] font-semibold leading-none text-sand/85">
        {localeMeta[locale].name}
      </span>
    </nav>
  );
}
