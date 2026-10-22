import path from "path";
import type { NextConfig } from "next";
import { DISCOVERY_HEADERS } from "./lib/discoverability";
import {
  SECURITY_HEADERS,
  STATIC_ASSET_CACHE,
} from "./lib/security-headers";

const assetCache = [{ key: "Cache-Control", value: STATIC_ASSET_CACHE }];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // A lockfile above this repo was being chosen as the tracing root.
  outputFileTracingRoot: path.join(__dirname),
  transpilePackages: ["leaflet"],
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 3600,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "media.canva.com" },
      { protocol: "https", hostname: "mapucoin.com" },
      { protocol: "https", hostname: "www.mapucoin.com" },
      { protocol: "https", hostname: "server.arcgisonline.com" },
      { protocol: "https", hostname: "services.arcgisonline.com" },
    ],
  },
  async headers() {
    return [
      { source: "/(.*)", headers: [...SECURITY_HEADERS, ...DISCOVERY_HEADERS] },
      { source: "/images/:path*", headers: assetCache },
      { source: "/videos/:path*", headers: assetCache },
      { source: "/flags/:path*", headers: assetCache },
      { source: "/icon.png", headers: assetCache },
      { source: "/icon-512.png", headers: assetCache },
      { source: "/favicon.png", headers: assetCache },
      { source: "/apple-touch-icon.png", headers: assetCache },
      { source: "/logo.png", headers: assetCache },
      { source: "/logo-mark.png", headers: assetCache },
      { source: "/og.jpg", headers: assetCache },
    ];
  },
  async redirects() {
    return [
      { source: "/terms", destination: "/terminos", permanent: true },
      { source: "/privacy", destination: "/privacidad", permanent: true },
      {
        source: "/terms-and-conditions",
        destination: "/terminos",
        permanent: true,
      },
      {
        source: "/terminos-y-condiciones",
        destination: "/terminos",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/.well-known/llms.txt", destination: "/llms.txt" },
      { source: "/.well-known/llms-full.txt", destination: "/llms-full.txt" },
    ];
  },
};

export default nextConfig;
