export const SEO = {
  siteName: "Mapucoin",
  legalName: "Salvazion SpA",
  title: "Mapucoin | Chile, cápsulas y territorio",
  titleTemplate: "%s | Mapucoin",
  description:
    "Chile por paisaje: Desiertos, playas, viñedos, volcanes, ríos, lagos, bosques y nieve. Cápsulas de cobre y vidrio, gastronomía local y mapa.",
  ogDescription:
    "Viaja Chile en casas cápsula de cobre y vidrio. Mapa vivo, gastronomía local y presupuesto. Operado por Salvazion SpA.",
  url: "https://mapucoin.com",
  supportEmail: "info@salvazion.org",
  xUrl: "https://x.com/MAPUCOIN",
  twitterHandle: "@MAPUCOIN",
  locale: "es_CL",
  locales: ["es_CL", "en_US", "pt_BR", "fr_FR", "it_IT", "de_DE"],
  ogImage: "/og.jpg",
  ogImageWidth: 1200,
  ogImageHeight: 630,
  logo: "/logo-mark.png",
  address: {
    addressLocality: "Algarrobo",
    addressRegion: "Valparaíso",
    addressCountry: "CL",
  },
} as const;

const BRAND_SUFFIX = SEO.titleTemplate.replace("%s", "").trim();

/**
 * Segment passed to the root title template (`%s | Mapucoin`).
 * A page that already ends with the brand ("Entrar | Mapucoin") is reduced
 * to "Entrar" so the template does not render "Entrar | Mapucoin | Mapucoin".
 */
export function pageTitle(title: string): string {
  let value = title.trim();
  const tail = ` ${BRAND_SUFFIX}`;
  while (value.endsWith(tail)) value = value.slice(0, -tail.length).trim();
  return value;
}

/** Title after the root template is applied. */
export function composeDocumentTitle(title: string): string {
  const segment = pageTitle(title);
  if (!segment) return "Mapucoin";
  return SEO.titleTemplate.replace("%s", segment);
}
