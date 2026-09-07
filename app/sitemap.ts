import { allItems } from "@/lib/catalog";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://mapucoin.com";
  const staticPages = [
    "",
    "/planificar",
    "/mapa",
    "/destinos",
    "/capsulas",
    "/gastronomia",
    "/actividades",
    "/partners",
    "/reserva",
    "/terminos",
    "/privacidad",
  ];
  const items = allItems
    .filter((i) => i.kind === "place" || i.kind === "capsule")
    .map((i) => ({
      url: `${base}${i.kind === "place" ? "/destinos" : "/capsulas"}/${i.slug}`,
    }));
  return [
    ...staticPages.map((p) => ({ url: `${base}${p}` })),
    ...items,
  ];
}
