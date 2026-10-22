import type { CatalogItem } from "@/lib/catalog";
import { SEO } from "@/lib/seo";

export default function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SEO.url}/#org`,
        name: SEO.siteName,
        url: SEO.url,
        logo: `${SEO.url}${SEO.logo}`,
        email: SEO.supportEmail,
        sameAs: [SEO.xUrl],
        description: SEO.description,
        knowsAbout: [
          "Chile",
          "cápsulas",
          "gastronomía",
          "itinerario",
          "desiertos",
          "playas",
          "viñedos",
          "volcanes",
          "ríos",
          "lagos",
          "bosques",
          "nieve",
        ],
        areaServed: { "@type": "Country", name: "Chile" },
        parentOrganization: {
          "@type": "Organization",
          name: SEO.legalName,
          url: "https://salvazion.org",
          address: {
            "@type": "PostalAddress",
            ...SEO.address,
          },
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SEO.url}/#site`,
        url: SEO.url,
        name: SEO.siteName,
        description: SEO.description,
        inLanguage: ["es-CL", "en", "pt-BR", "fr", "it", "de"],
        publisher: { "@id": `${SEO.url}/#org` },
      },
      {
        "@type": "WebPage",
        "@id": `${SEO.url}/#webpage`,
        url: SEO.url,
        name: SEO.title,
        description: SEO.description,
        isPartOf: { "@id": `${SEO.url}/#site` },
        about: { "@id": `${SEO.url}/#org` },
        inLanguage: ["es-CL", "en", "pt-BR", "fr", "it", "de"],
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["#hero-heading", "#hero-lead"],
        },
      },
      {
        "@type": "Service",
        "@id": `${SEO.url}/#service`,
        name: "Mapucoin",
        serviceType: "Travel platform",
        provider: { "@id": `${SEO.url}/#org` },
        areaServed: { "@type": "Country", name: "Chile" },
        url: SEO.url,
        description: SEO.description,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function catalogJsonLd(item: CatalogItem) {
  const path =
    item.kind === "capsule" ? `/capsulas/${item.slug}` : `/destinos/${item.slug}`;
  const url = `${SEO.url}${path}`;
  const image = item.image.startsWith("http")
    ? item.image
    : `${SEO.url}${item.image.startsWith("/") ? item.image : `/${item.image}`}`;
  const entity =
    item.kind === "capsule"
      ? {
          "@type": "Product",
          name: item.name,
          description: item.description,
          image,
          url,
          brand: { "@type": "Brand", name: "Mapucoin" },
          category: "Capsule stay",
          ...(item.priceFromCLP > 0
            ? {
                offers: {
                  "@type": "Offer",
                  priceCurrency: "CLP",
                  price: String(item.priceFromCLP),
                  availability: "https://schema.org/InStock",
                  url,
                },
              }
            : {}),
        }
      : {
          "@type": "TouristDestination",
          name: item.name,
          description: item.description,
          image,
          url,
          geo: {
            "@type": "GeoCoordinates",
            latitude: item.lat,
            longitude: item.lng,
          },
          containedInPlace: { "@type": "Country", name: "Chile" },
          address: {
            "@type": "PostalAddress",
            addressLocality: item.city,
            addressRegion: item.region,
            addressCountry: "CL",
          },
        };
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      entity,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Mapucoin", item: SEO.url },
          { "@type": "ListItem", position: 2, name: item.name, item: url },
        ],
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
