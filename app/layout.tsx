import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { cookies } from "next/headers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HashScroll from "@/components/HashScroll";
import HtmlLang from "@/components/HtmlLang";
import { LocaleProvider } from "@/lib/locale-context";
import { LOCALE_COOKIE, languageAlternates, localeMeta, parseLocale } from "@/lib/locale";
import { SEO } from "@/lib/seo";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#d4af37",
  colorScheme: "dark",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(SEO.url),
  title: {
    default: SEO.title,
    template: SEO.titleTemplate,
  },
  description: SEO.description,
  applicationName: SEO.siteName,
  authors: [{ name: SEO.legalName, url: "https://salvazion.org" }],
  creator: SEO.legalName,
  publisher: SEO.legalName,
  alternates: {
    canonical: "/",
    languages: languageAlternates("/"),
    types: {
      "text/plain": [{ url: "/llms.txt", title: "LLM brief" }],
    },
  },
  openGraph: {
    title: SEO.title,
    description: SEO.ogDescription,
    url: SEO.url,
    siteName: SEO.siteName,
    locale: SEO.locale,
    type: "website",
    images: [
      {
        url: SEO.ogImage,
        width: SEO.ogImageWidth,
        height: SEO.ogImageHeight,
        alt: "Mapucoin",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO.title,
    description: SEO.ogDescription,
    images: [SEO.ogImage],
    creator: SEO.twitterHandle,
    site: SEO.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  appleWebApp: {
    capable: true,
    title: SEO.siteName,
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  other: {
    "mobile-web-app-capable": "yes",
    "tdm-reservation": "0",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jar = await cookies();
  const locale = parseLocale(jar.get(LOCALE_COOKIE)?.value);
  return (
    <html
      lang={localeMeta[locale].htmlLang}
      className={`${fraunces.variable} ${outfit.variable}`}
    >
      <body className={`${outfit.className} min-h-screen antialiased`}>
        <LocaleProvider initialLocale={locale}>
          <HtmlLang />
          <Header />
          <HashScroll />
          {children}
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}
