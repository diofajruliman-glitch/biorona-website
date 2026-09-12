import { getPrimaryProductImage, products } from "@/data/products";
import { absoluteUrl, siteConfig } from "@/data/site";

export default function JsonLd() {
  const floristId = `${siteConfig.siteUrl}/#florist`;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Florist", "LocalBusiness"],
        "@id": floristId,
        name: siteConfig.brand,
        url: siteConfig.siteUrl,
        image: absoluteUrl(siteConfig.defaultImage),
        description: siteConfig.description,
        telephone: siteConfig.whatsapp ? `+${siteConfig.whatsapp}` : undefined,
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
        numberOfItems: products.length,
        itemListElement: products.map((product, index) => ({
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
