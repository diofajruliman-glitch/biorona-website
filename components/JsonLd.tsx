import { absoluteUrl, siteConfig } from "@/data/site";
import { homeFaqs } from "./FAQ";

export default function JsonLd() {
  const floristId = `${siteConfig.siteUrl}/#florist`;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteConfig.siteUrl}/#website`,
        url: siteConfig.siteUrl,
        name: siteConfig.brand,
        inLanguage: "id-ID",
      },
      {
        "@type": ["Florist", "LocalBusiness"],
        "@id": floristId,
        name: siteConfig.brand,
        url: siteConfig.siteUrl,
        logo: absoluteUrl("/brand/biorona-logo.png"),
        image: absoluteUrl(siteConfig.defaultImage),
        description: siteConfig.description,
        telephone: siteConfig.whatsapp ? `+${siteConfig.whatsapp}` : undefined,
        address: {
          "@type": "PostalAddress",
          addressLocality: siteConfig.location.city,
          addressRegion: `${siteConfig.location.region}, ${siteConfig.location.province}`,
          addressCountry: siteConfig.location.countryCode,
        },
        areaServed: [
          { "@type": "City", name: siteConfig.location.city },
          { "@type": "AdministrativeArea", name: siteConfig.location.region },
        ],
        sameAs: siteConfig.instagram ? [siteConfig.instagram] : undefined,
      },
      {
        "@type": "FAQPage",
        "@id": `${siteConfig.siteUrl}/#faq`,
        mainEntity: homeFaqs.slice(0, 3).map(([name, text]) => ({
          "@type": "Question",
          name,
          acceptedAnswer: { "@type": "Answer", text },
        })),
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
