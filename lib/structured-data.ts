import { absoluteUrl, siteConfig } from "@/data/site";

export const websiteId = `${siteConfig.siteUrl}/#website`;
export const floristId = `${siteConfig.siteUrl}/#florist`;

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": websiteId,
    url: `${siteConfig.siteUrl}/`,
    name: siteConfig.brand,
    inLanguage: "id-ID",
  };
}

export function floristSchema() {
  return {
    "@type": ["Florist", "LocalBusiness"],
    "@id": floristId,
    name: siteConfig.brand,
    url: `${siteConfig.siteUrl}/`,
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
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.location.coordinates.latitude,
      longitude: siteConfig.location.coordinates.longitude,
    },
    areaServed: [
      { "@type": "City", name: siteConfig.location.city },
      { "@type": "AdministrativeArea", name: siteConfig.location.region },
    ],
    sameAs: siteConfig.instagram ? [siteConfig.instagram] : undefined,
  };
}

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
