import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["leaflet"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "media.canva.com" },
      { protocol: "https", hostname: "mapucoin.com" },
      { protocol: "https", hostname: "www.mapucoin.com" },
    ],
  },
};

export default nextConfig;
