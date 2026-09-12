import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPrimaryProductImage,
  getProductImages,
  getProductStatus,
} from "@/data/products";
import { getProductBySlug } from "@/lib/products";
import { absoluteUrl, siteConfig } from "@/data/site";
import { formatRupiah } from "@/lib/format";
import Logo from "@/components/Logo";
import ProductGallery from "@/components/ProductGallery";
import ProductOrderForm from "@/components/ProductOrderForm";
import { CheckIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const canonical = `/produk/${product.slug}/`;
  const image = getPrimaryProductImage(product);
  const description = `${product.shortDescription} Pesan dari ${siteConfig.brand} di ${siteConfig.location.city}, ${siteConfig.location.region}.`;

  return {
    title: `${product.name} - ${formatRupiah(product.price)}`,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: canonical,
      siteName: siteConfig.brand,
      title: product.name,
      description,
      images: [{ url: image, alt: product.altText }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: [image],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const formattedPrice = formatRupiah(product.price);
  const status = getProductStatus(product);
  const productUrl = absoluteUrl(`/produk/${product.slug}/`);
  const floristId = `${siteConfig.siteUrl}/#florist`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${productUrl}#product`,
        sku: product.id,
        name: product.name,
        category: product.category,
        url: productUrl,
        mainEntityOfPage: productUrl,
        image: getProductImages(product).map((image) => absoluteUrl(image)),
        description: product.shortDescription,
        brand: { "@type": "Brand", name: siteConfig.shortBrand },
        offers: {
          "@type": "Offer",
          priceCurrency: "IDR",
          price: product.price,
          availability: product.available
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          url: productUrl,
          seller: { "@id": floristId },
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${productUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Beranda", item: siteConfig.siteUrl },
          { "@type": "ListItem", position: 2, name: "Katalog", item: `${siteConfig.siteUrl}/#katalog` },
          { "@type": "ListItem", position: 3, name: product.name, item: productUrl },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header className="productPageHeader">
        <div className="container productPageNav">
          <Logo />
          <Link href="/#katalog">← Kembali ke katalog</Link>
        </div>
      </header>
      <main className="productPage">
        <nav className="container productBreadcrumb" aria-label="Breadcrumb">
          <Link href="/">Beranda</Link><span aria-hidden="true">/</span>
          <Link href="/#katalog">Katalog</Link><span aria-hidden="true">/</span>
          <span aria-current="page">{product.name}</span>
        </nav>
        <div className="container productDetailGrid">
          <ProductGallery images={product.images} alt={product.altText} />
          <div className="productDetailCopy">
            <span className="kicker">{product.category}</span>
            <h1>{product.name}</h1>
            <strong className="productDetailPrice">{formattedPrice}</strong>
            <p>{product.description}</p>
            <div className={`availabilityLine ${!product.available ? "isUnavailable" : ""}`}>
              {product.available && <CheckIcon size={17} />}
              {status}{product.preorder && product.available ? " · Konfirmasi estimasi melalui WhatsApp" : ""}
            </div>
            <div className="productMeta">
              <div><b>Pilihan warna</b><span>{product.colors.join(" · ")}</span></div>
              <div><b>Cocok untuk</b><span>{product.occasions.join(" · ")}</span></div>
            </div>
          </div>
        </div>
        <div className="container"><ProductOrderForm product={product} /></div>
      </main>
    </>
  );
}
