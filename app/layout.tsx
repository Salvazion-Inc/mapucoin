import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mapucoin.com"),
  title: {
    default: "Mapucoin — Chile, cápsulas y territorio",
    template: "%s · Mapucoin",
  },
  description:
    "Plataforma turística de Chile: indica presupuesto y destino. Mapucoin arma tu viaje con cápsulas tecnológicas, gastronomía local, actividades y mapa interactivo.",
  openGraph: {
    title: "Mapucoin — Viaja Chile",
    description:
      "Cápsulas tecnológicas, gastronomía, actividades y un mapa vivo de Chile. Planifica con presupuesto.",
    url: "https://mapucoin.com",
    siteName: "Mapucoin",
    locale: "es_CL",
    type: "website",
  },
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${fraunces.variable} ${outfit.variable}`}>
      <body className="min-h-screen antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
