import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPrimaryProductImage,
  getProductImageAlt,
  getProductImages,
  getProductStatus,
  isSearchIndexableProduct,
} from "@/data/products";
import { getProductBySlug, getProducts } from "@/lib/products";
import { primarySeoCategory, productSeoDescription, relatedProducts } from "@/lib/product-seo";
import { absoluteUrl, siteConfig } from "@/data/site";
import { formatRupiah } from "@/lib/format";
import Logo from "@/components/Logo";
import ProductGallery from "@/components/ProductGallery";
import ProductOrderForm from "@/components/ProductOrderForm";
import ProductCard from "@/components/ProductCard";
import { CheckIcon } from "@/components/Icons";
import Footer from "@/components/Footer";
import { floristId, floristSchema, serializeJsonLd } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const normalizedSlug = slug.trim();
  const product = await getProductBySlug(normalizedSlug);
  if (!product) notFound();

  const canonical = absoluteUrl(`/produk/${product.slug}/`);
  const image = getPrimaryProductImage(product);
  const imageAlt = getProductImageAlt(product);
  const productDescription = productSeoDescription(product);
  const description = `${productDescription} Pesan dari ${siteConfig.brand} di ${siteConfig.location.city}, ${siteConfig.location.region}.`;

  const seoTitle = `${product.name} | ${product.category} - Biorona Florist`;
  return {
    title: { absolute: seoTitle },
    description,
    alternates: { canonical },
    robots: isSearchIndexableProduct(product) ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: canonical,
      siteName: siteConfig.brand,
      title: seoTitle,
      description,
      images: [{ url: absoluteUrl(image), alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description,
      images: [absoluteUrl(image)],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const normalizedSlug = slug.trim();
  const product = await getProductBySlug(normalizedSlug);
  if (!product) notFound();

  const formattedPrice = formatRupiah(product.price);
  const status = getProductStatus(product);
  const isIndexable = isSearchIndexableProduct(product);
  const imageAlt = getProductImageAlt(product);
  const productUrl = absoluteUrl(`/produk/${product.slug}/`);
  const primaryCategory = primarySeoCategory(product);
  const categoryHref = primaryCategory ? `/${primaryCategory.slug}/` : "/katalog/";
  const categoryName = primaryCategory?.label ?? "Katalog";
  const suggestions = relatedProducts(product, await getProducts());
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      floristSchema(),
      {
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
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${productUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Beranda", item: siteConfig.siteUrl },
          { "@type": "ListItem", position: 2, name: categoryName, item: absoluteUrl(categoryHref) },
          { "@type": "ListItem", position: 3, name: product.name, item: productUrl },
        ],
      },
    ],
  };

  return (
    <>
      {isIndexable && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />}
      <header className="productPageHeader">
        <div className="container productPageNav">
          <Logo />
          <Link href="/katalog">← Kembali ke katalog</Link>
        </div>
      </header>
      <main className="productPage">
        <nav className="container productBreadcrumb" aria-label="Breadcrumb">
          <Link href="/">Beranda</Link><span aria-hidden="true">/</span>
          <Link href={categoryHref}>{categoryName}</Link><span aria-hidden="true">/</span>
          <span aria-current="page">{product.name}</span>
        </nav>
        <div className="container productDetailGrid">
          <ProductGallery images={product.images} alt={imageAlt} />
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
        {suggestions.length > 0 && <section className="container productRelated" aria-labelledby="related-products-title"><div className="sectionHeading splitHeading"><div><span className="kicker">Pilihan Biorona</span><h2 id="related-products-title">Produk terkait</h2></div><p>Rekomendasi berdasarkan kategori, momen, dan kisaran harga terdekat.</p></div><div className="productGrid">{suggestions.map((suggestion) => <ProductCard product={suggestion} key={suggestion.slug}/>)}</div><p className="localLandingMore"><Link href={categoryHref}>Lihat {categoryName} <span aria-hidden="true">→</span></Link></p></section>}
        <nav className="container localLandingMore" aria-label="Jelajahi layanan bunga lokal">
          <Link href="/toko-bunga-cibinong/">Biorona Florist di Cibinong</Link><span aria-hidden="true"> · </span>
          <Link href="/toko-bunga-bogor/">Layanan florist Bogor</Link><span aria-hidden="true"> · </span>
          <Link href="/katalog/">Semua produk</Link>
        </nav>
      </main>
      <Footer />
    </>
  );
}
