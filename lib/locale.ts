export const LOCALES = ["es", "en", "pt", "fr", "it"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "es";
export const SITE = "https://mapucoin.com";
export const LOCALE_COOKIE = "mapucoin_locale";

export const localeMeta: Record<
  Locale,
  {
    flag: string;
    name: string;
    htmlLang: string;
    ogLocale: string;
    replyLanguage: string;
  }
> = {
  es: {
    flag: "chile",
    name: "Español",
    htmlLang: "es",
    ogLocale: "es_CL",
    replyLanguage: "Spanish (Chile)",
  },
  en: {
    flag: "usa",
    name: "English",
    htmlLang: "en",
    ogLocale: "en_US",
    replyLanguage: "English",
  },
  pt: {
    flag: "brazil",
    name: "Português",
    htmlLang: "pt",
    ogLocale: "pt_BR",
    replyLanguage: "Brazilian Portuguese",
  },
  fr: {
    flag: "france",
    name: "Français",
    htmlLang: "fr",
    ogLocale: "fr_FR",
    replyLanguage: "French",
  },
  it: {
    flag: "italy",
    name: "Italiano",
    htmlLang: "it",
    ogLocale: "it_IT",
    replyLanguage: "Italian",
  },
};

export function isLocale(value: string | null | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function parseLocale(value: unknown): Locale {
  return isLocale(String(value)) ? (value as Locale) : DEFAULT_LOCALE;
}

export function localeFromPath(pathname: string): Locale | null {
  const match = pathname.match(/^\/(es|en|pt|fr|it)(?=\/|$)/);
  return match ? (match[1] as Locale) : null;
}

export function stripLocalePrefix(pathname: string): string {
  const match = pathname.match(/^\/(es|en|pt|fr|it)(?=\/|$)/);
  if (!match) return pathname || "/";
  return pathname.slice(match[0].length) || "/";
}

export function languageAlternates(path = "/") {
  const url = `${SITE}${path === "/" ? "" : path}`;
  return {
    es: url,
    en: url,
    pt: url,
    fr: url,
    it: url,
    "x-default": url,
  };
}

export function localeCookieHeader(locale: Locale) {
  return `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
