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
import { primarySeoCategory, productDisplayDescription, productMetadataDescription, productSeoDescription, productSeoTitle, relatedProducts } from "@/lib/product-seo";
import { absoluteUrl, siteConfig } from "@/data/site";
import { formatRupiah } from "@/lib/format";
import Logo from "@/components/Logo";
import ProductGallery from "@/components/ProductGallery";
import ProductOrderForm from "@/components/ProductOrderForm";
import ProductCard from "@/components/ProductCard";
import ProductAuthority from "@/components/ProductAuthority";
import { ArrowIcon, CheckIcon, WhatsAppIcon } from "@/components/Icons";
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
  const description = productMetadataDescription(product);

  const seoTitle = productSeoTitle(product);
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
        <section className="container productDetailGrid" aria-labelledby="product-title">
          <ProductGallery images={product.images} alt={imageAlt} />
          <div className="productDetailCopy glassSurface">
            <div className="productDetailLabels">
              <span className="kicker">{product.category}</span>
              <span className={`productDetailStatus ${product.preorder ? "isPreorder" : ""} ${!product.available ? "isUnavailable" : ""}`}>
                {product.available && <CheckIcon size={14} />}{status}
              </span>
            </div>
            <h1 id="product-title">{product.name}</h1>
            <strong className="productDetailPrice">{formattedPrice}</strong>
            <p className="productDetailDescription">{productDisplayDescription(product)}</p>
            {product.preorder && product.available && <p className="productPreorderNote">Estimasi pengerjaan dikonfirmasi melalui WhatsApp.</p>}
            {product.available ? (
              <a className="primaryButton productHeroCta" href="#productOrderForm">
                <WhatsAppIcon size={19} /> Pesan via WhatsApp <ArrowIcon size={17} />
              </a>
            ) : (
              <Link className="secondaryGlassButton productHeroCta" href="/katalog/">Pilih produk lain <ArrowIcon size={17} /></Link>
            )}
            <small className="productCtaNote">Isi detail pesanan, lalu konfirmasi langsung dengan tim Biorona.</small>
          </div>
        </section>
        <ProductAuthority product={product} categoryHref={categoryHref} categoryName={categoryName} status={status} />
        <div className="container"><ProductOrderForm product={product} /></div>
        {suggestions.length > 0 && <section className="container productRelated" aria-labelledby="related-products-title"><div className="sectionHeading splitHeading"><div><span className="kicker">Pilihan Biorona</span><h2 id="related-products-title">Produk terkait</h2></div><p>Rekomendasi berdasarkan kategori, momen, dan kisaran harga terdekat.</p></div><div className="productGrid">{suggestions.map((suggestion) => <ProductCard product={suggestion} key={suggestion.slug}/>)}</div><p className="localLandingMore"><Link href={categoryHref}>Lihat {categoryName} <span aria-hidden="true">→</span></Link></p></section>}
      </main>
      <Footer />
    </>
  );
}
