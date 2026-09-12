import { getPrimaryProductImage, isSearchIndexableProduct, type Product } from "@/data/products";
import { absoluteUrl, siteConfig } from "@/data/site";

export default function JsonLd({ products }: { products: Product[] }) {
  const floristId = `${siteConfig.siteUrl}/#florist`;
  const indexableProducts = products.filter(isSearchIndexableProduct);
  const data = {
    "@context": "https://schema.org",
    "@graph": [
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
        "@type": "ItemList",
        "@id": `${siteConfig.siteUrl}/#catalog`,
        name: `Katalog ${siteConfig.brand}`,
        numberOfItems: indexableProducts.length,
        itemListElement: indexableProducts.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Product",
            name: product.name,
            url: absoluteUrl(`/produk/${product.slug}/`),
            image: absoluteUrl(getPrimaryProductImage(product)),
          },
        })),
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
