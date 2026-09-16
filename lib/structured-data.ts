import { absoluteUrl, siteConfig } from "@/data/site";
import { getProductImages, type Product } from "@/data/products";
import { productSeoDescription } from "@/lib/product-seo";

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
  const address: Record<string, string> = {
    "@type": "PostalAddress",
    addressLocality: siteConfig.location.city,
    addressRegion: `${siteConfig.location.region}, ${siteConfig.location.province}`,
    addressCountry: siteConfig.location.countryCode,
  };

  if (siteConfig.streetAddress) address.streetAddress = siteConfig.streetAddress;
  if (siteConfig.postalCode) address.postalCode = siteConfig.postalCode;

  return {
    "@type": ["Florist", "LocalBusiness"],
    "@id": floristId,
    name: siteConfig.brand,
    url: `${siteConfig.siteUrl}/`,
    logo: absoluteUrl("/brand/biorona-logo.png"),
    image: absoluteUrl(siteConfig.defaultImage),
    description: siteConfig.description,
    telephone: siteConfig.whatsapp ? `+${siteConfig.whatsapp}` : undefined,
    address,
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

export function productSchema(product: Product) {
  const productUrl = absoluteUrl(`/produk/${product.slug}/`);
  return {
    "@type": "Product",
    "@id": `${productUrl}#product`,
    sku: product.sku || product.id,
    name: product.name,
    category: product.category,
    url: productUrl,
    mainEntityOfPage: productUrl,
    image: getProductImages(product).map((image) => absoluteUrl(image)),
    description: productSeoDescription(product),
    brand: { "@type": "Brand", name: siteConfig.shortBrand },
    offers: {
      "@type": "Offer",
      priceCurrency: "IDR",
      price: String(product.price),
      availability: product.available
        ? product.preorder ? "https://schema.org/PreOrder" : "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: productUrl,
      seller: { "@id": floristId },
    },
  };
}

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
