import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import MobileOrderBar from "@/components/MobileOrderBar";
import { absoluteUrl, siteConfig } from "@/data/site";
import type { Product } from "@/data/products";
import { formatProductAttribute } from "@/lib/product-seo";
import { getProducts } from "@/lib/products";
import { waUrl } from "@/lib/whatsapp";
import { serializeJsonLd, floristId, floristSchema, websiteId, websiteSchema } from "@/lib/structured-data";

const articleUrl = absoluteUrl("/artikel/standing-flower-grand-opening/");
const articleTitle = "Standing Flower untuk Grand Opening dan Corporate | Biorona";
const articleDescription = "Panduan memilih standing flower untuk grand opening dan kebutuhan corporate berdasarkan occasion yang tercatat pada produk runtime Biorona.";
const primaryKeyword = "standing flower untuk grand opening";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: articleTitle },
  description: articleDescription,
  alternates: { canonical: articleUrl },
  openGraph: {
    type: "article",
    locale: "id_ID",
    siteName: siteConfig.brand,
    url: articleUrl,
    title: articleTitle,
    description: articleDescription,
    images: [{ url: absoluteUrl(siteConfig.defaultImage), alt: "Standing flower untuk grand opening dari Biorona Florist" }],
  },
  twitter: {
    card: "summary_large_image",
    title: articleTitle,
    description: articleDescription,
    images: [absoluteUrl(siteConfig.defaultImage)],
  },
};

function relevantProducts(products: Product[]) {
  const occasions = new Set(["grand-opening", "corporate", "bisnis", "peresmian"]);
  return products
    .filter((product) => product.category === "Standing Flower")
    .filter((product) => product.occasions.some((occasion) => occasions.has(occasion.toLowerCase())))
    .slice(0, 3);
}

function productReason(product: Product) {
  const occasions = product.occasions.map(formatProductAttribute).filter(Boolean).join(", ");
  const tags = (product.tags ?? []).map(formatProductAttribute).filter(Boolean).join(", ");
  return [
    occasions ? `Occasion yang tercatat: ${occasions}.` : "",
    tags ? `Tag yang tercatat: ${tags}.` : "",
    "Relevan untuk dipertimbangkan karena data produknya mencantumkan kebutuhan pembukaan atau corporate.",
  ].filter(Boolean).join(" ");
}

export default async function StandingFlowerGrandOpeningArticle() {
  const products = relevantProducts(await getProducts());
  if (!products.length) notFound();

  const faqs = [
    ["Produk apa yang relevan untuk grand opening?", "Gunakan produk runtime yang mencantumkan occasion grand-opening, peresmian, corporate, atau bisnis. Tiga pilihan pada artikel ini diambil langsung dari katalog runtime Biorona."],
    ["Bagaimana memilih rangkaian untuk kebutuhan corporate?", "Mulai dari konteks acara dan occasion yang tercatat pada produk. Setelah itu, bandingkan nama, kategori, dan atribut produk sebelum berkonsultasi."],
    ["Apakah semua produk dapat langsung dipesan?", "Status availability dan preorder perlu diperiksa pada halaman produk atau dikonfirmasi melalui WhatsApp sebelum memesan."],
    ["Apa yang perlu disiapkan sebelum konsultasi?", "Siapkan nama produk, konteks acara, nama penerima atau instansi, serta preferensi yang ingin dibicarakan."],
    ["Bisakah saya meminta rekomendasi produk?", "Bisa. Kirimkan konteks grand opening atau kebutuhan corporate melalui WhatsApp agar pilihan dapat dibahas berdasarkan produk runtime yang tersedia."],
  ] as const;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      websiteSchema(),
      floristSchema(),
      {
        "@type": "Article",
        "@id": `${articleUrl}#article`,
        url: articleUrl,
        mainEntityOfPage: articleUrl,
        headline: articleTitle,
        description: articleDescription,
        inLanguage: "id-ID",
        image: [absoluteUrl(siteConfig.defaultImage)],
        author: { "@type": "Organization", name: siteConfig.brand, url: siteConfig.siteUrl },
        publisher: { "@id": floristId },
        isPartOf: { "@id": websiteId },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${articleUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Beranda", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: articleTitle, item: articleUrl },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${articleUrl}#faq`,
        mainEntity: faqs.map(([name, text]) => ({
          "@type": "Question",
          name,
          acceptedAnswer: { "@type": "Answer", text },
        })),
      },
    ],
  };

  return (
    <>
      <Navbar />
      <main className="articlePage">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
        <article className="container articleLayout">
          <nav className="productBreadcrumb articleBreadcrumb" aria-label="Breadcrumb">
            <Link href="/">Beranda</Link><span aria-hidden="true">/</span>
            <span aria-current="page">Standing Flower Grand Opening</span>
          </nav>
          <header className="articleHeader">
            <span className="kicker">Panduan untuk acara bisnis</span>
            <h1>{articleTitle}</h1>
            <p>Memilih rangkaian untuk grand opening atau kebutuhan corporate dapat dimulai dari occasion yang tercatat pada produk, konteks acara, dan detail yang ingin dikonsultasikan.</p>
          </header>
          <div className="articleContent">
            <section aria-labelledby="context-title">
              <h2 id="context-title">Mulai dari konteks acara</h2>
              <p>Acara pembukaan membutuhkan pilihan yang selaras dengan suasana perayaan dan penerima. Gunakan data produk runtime sebagai titik awal, lalu periksa kembali status pemesanan sebelum menentukan pilihan.</p>
              <h3>Periksa occasion yang tercatat</h3>
              <p>Produk yang dipilih pada artikel ini memiliki occasion yang berkaitan dengan grand opening, peresmian, corporate, atau bisnis. Dengan begitu, pertimbangan berangkat dari data katalog, bukan asumsi tentang produk.</p>
              <h3>Bandingkan detail yang tersedia</h3>
              <p>Bandingkan nama, kategori, occasion, dan tag yang tercatat pada setiap halaman produk. Detail pemesanan aktual dikonfirmasi melalui halaman produk atau WhatsApp.</p>
            </section>
            <section aria-labelledby="products-title">
              <h2 id="products-title">Tiga pilihan yang dapat dipertimbangkan</h2>
              <p>Ketiga produk berikut dipilih secara dinamis dari produk aktif runtime dengan kategori Standing Flower dan occasion yang relevan.</p>
              <div className="articleProductList">
                {products.map((product) => (
                  <article className="articleProductItem" key={product.slug}>
                    <h3><Link href={`/produk/${product.slug}/`}>{product.name}</Link></h3>
                    <p><strong>{product.category}</strong>. {productReason(product)} Status pemesanan aktual dapat diperiksa di halaman produk.</p>
                  </article>
                ))}
              </div>
            </section>
            <section aria-labelledby="steps-title">
              <h2 id="steps-title">Siapkan detail sebelum memesan</h2>
              <p>Sebelum menghubungi Biorona, siapkan nama produk, konteks acara, nama penerima atau instansi, dan preferensi yang ingin dibicarakan. Detail tersebut membantu percakapan pemesanan dimulai dari kebutuhan yang jelas.</p>
              <p><Link className="articleCategoryLink" href="/standing-flower-bogor/">Bandingkan pilihan standing flower untuk acara</Link> untuk melihat pilihan yang tersedia, lalu buka halaman produk yang paling sesuai.</p>
            </section>
            <section className="articleCta" aria-labelledby="cta-title">
              <div>
                <span className="kicker">Langkah berikutnya</span>
                <h2 id="cta-title">Konsultasikan kebutuhan acara</h2>
                <p>Kirimkan konteks grand opening atau corporate dan pilihan produk yang ingin dibahas.</p>
              </div>
              <a className="primaryButton" href={waUrl("Halo Biorona, saya ingin konsultasi standing flower untuk grand opening atau kebutuhan corporate.")} target="_blank" rel="noreferrer">Konsultasi via WhatsApp</a>
            </section>
            <section className="articleFaq" aria-labelledby="faq-title">
              <h2 id="faq-title">FAQ standing flower untuk grand opening</h2>
              <div className="faqList">
                {faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}
              </div>
            </section>
          </div>
        </article>
      </main>
      <MobileOrderBar />
      <Footer />
    </>
  );
}
