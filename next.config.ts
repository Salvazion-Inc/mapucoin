import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["leaflet"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "media.canva.com" },
      { protocol: "https", hostname: "mapucoin.com" },
      { protocol: "https", hostname: "www.mapucoin.com" },
      { protocol: "https", hostname: "server.arcgisonline.com" },
      { protocol: "https", hostname: "services.arcgisonline.com" },
    ],
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
};

export default nextConfig;
