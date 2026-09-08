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
        inLanguage: "es-CL",
        publisher: { "@id": `${SEO.url}/#org` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
