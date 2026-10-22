import { allItems } from "@/lib/catalog";
import { languageAlternates } from "@/lib/locale";
import type { MetadataRoute } from "next";

const SITE = "https://mapucoin.com";
const REVIEWED = new Date("2026-10-22");

const staticPaths = [
  "/",
  "/login",
  "/signup",
  "/terminos",
  "/privacidad",
  "/llms.txt",
  "/llms-full.txt",
  "/.well-known/ai.txt",
  "/ai.txt",
];

function entry(path: string, priority: number): MetadataRoute.Sitemap[number] {
  const detail = path.startsWith("/destinos/") || path.startsWith("/capsulas/");
  return {
    url: path === "/" ? SITE : `${SITE}${path}`,
    lastModified: REVIEWED,
    changeFrequency: detail ? "weekly" : "monthly",
    priority,
    alternates: { languages: languageAlternates(path) },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const items = allItems
    .filter((item) => item.kind === "place" || item.kind === "capsule")
    .map((item) =>
      entry(
        `${item.kind === "place" ? "/destinos" : "/capsulas"}/${item.slug}`,
        item.kind === "place" ? 0.8 : 0.7,
      ),
    );
  return [...staticPaths.map((path) => entry(path, path === "/" ? 1 : 0.4)), ...items];
}
