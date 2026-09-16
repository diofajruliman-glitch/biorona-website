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

const articleUrl = absoluteUrl("/artikel/bunga-duka-cita/");
const articleTitle = "Bunga Duka Cita: Panduan Memilih Simpati yang Tepat | Biorona";
const articleDescription = "Panduan memilih bunga duka cita berdasarkan bentuk rangkaian, occasion simpati, dan produk runtime Biorona yang relevan.";
const primaryKeyword = "bunga duka cita";

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
    images: [{ url: absoluteUrl(siteConfig.defaultImage), alt: "Pilihan bunga duka cita dari Biorona Florist" }],
  },
  twitter: {
    card: "summary_large_image",
    title: articleTitle,
    description: articleDescription,
    images: [absoluteUrl(siteConfig.defaultImage)],
  },
};

function sympathyProducts(products: Product[]) {
  const selectedSlugs = ["sympathy-white-stand", "peaceful-farewell", "papan-duka-cita-putih"];
  const productsBySlug = new Map(products.map((product) => [product.slug, product]));
  return selectedSlugs
    .map((slug) => productsBySlug.get(slug))
    .filter((product): product is Product => Boolean(product));
}

function productReason(product: Product) {
  const occasions = product.occasions.map(formatProductAttribute).filter(Boolean).join(", ");
  const tags = (product.tags ?? []).map(formatProductAttribute).filter(Boolean).join(", ");
  return [
    occasions ? `Occasion yang tercatat: ${occasions}.` : "",
    tags ? `Tag yang tercatat: ${tags}.` : "",
    "Relevan untuk dipertimbangkan karena data produknya mencantumkan simpati atau duka cita.",
  ].filter(Boolean).join(" ");
}

export default async function BungaDukaCitaArticle() {
  const products = sympathyProducts(await getProducts());
  if (!products.length) notFound();

  const faqs = [
    ["Produk apa yang relevan untuk menyampaikan simpati?", "Gunakan produk runtime yang mencantumkan occasion duka-cita atau simpati. Tiga pilihan pada artikel ini diambil langsung dari katalog runtime Biorona."],
    ["Bagaimana memilih bentuk rangkaian bunga duka cita?", "Pertimbangkan konteks penyampaian dan bentuk yang ingin dikirim. Bandingkan kategori serta occasion yang tercatat pada halaman produk sebelum memilih."],
    ["Apakah status pemesanan perlu dikonfirmasi?", "Ya. Status availability dan preorder perlu diperiksa pada halaman produk atau dikonfirmasi melalui WhatsApp sebelum memesan."],
    ["Apa yang perlu disiapkan sebelum konsultasi?", "Siapkan nama produk, nama penerima atau keluarga, serta pesan simpati yang ingin disampaikan agar detail dapat dibahas dengan jelas."],
    ["Bisakah saya meminta rekomendasi?", "Bisa. Sampaikan konteks simpati melalui WhatsApp agar pilihan produk dapat dibahas berdasarkan data runtime yang tersedia."],
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
            <span aria-current="page">Bunga Duka Cita</span>
          </nav>
          <header className="articleHeader">
            <span className="kicker">Panduan menyampaikan simpati</span>
            <h1>{articleTitle}</h1>
            <p>Memilih bunga duka cita dapat dimulai dari pesan yang ingin disampaikan, bentuk rangkaian, dan occasion simpati yang tercatat pada produk runtime.</p>
          </header>
          <div className="articleContent">
            <section aria-labelledby="context-title">
              <h2 id="context-title">Mulai dari pesan simpati</h2>
              <p>Dalam situasi duka, rangkaian bunga menjadi cara untuk menyampaikan perhatian dengan tenang dan penuh hormat. Pilih berdasarkan konteks penerima dan informasi produk yang tersedia, tanpa menambahkan detail yang belum dikonfirmasi.</p>
              <h3>Perhatikan bentuk rangkaian</h3>
              <p>Bandingkan kategori produk untuk memahami bentuk pilihan yang tersedia. Occasion duka-cita dan simpati pada data runtime dapat menjadi titik awal untuk mempersempit pilihan.</p>
              <h3>Periksa informasi produk</h3>
              <p>Buka halaman produk untuk memeriksa nama, kategori, occasion, dan status pemesanan. Detail aktual dikonfirmasi melalui halaman produk atau WhatsApp.</p>
            </section>
            <section aria-labelledby="products-title">
              <h2 id="products-title">Tiga pilihan yang dapat dipertimbangkan</h2>
              <p>Ketiga produk berikut dipilih secara dinamis dari produk runtime yang mencantumkan occasion duka-cita atau simpati.</p>
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
              <p>Sebelum menghubungi Biorona, siapkan nama produk, nama penerima atau keluarga, dan pesan simpati yang ingin disampaikan. Detail tersebut membantu percakapan pemesanan dimulai dengan jelas.</p>
              <p><Link className="articleCategoryLink" href="/standing-flower-bogor/">Jelajahi standing flower untuk menyampaikan simpati</Link> untuk membandingkan pilihan yang tersedia, lalu buka halaman produk yang paling sesuai.</p>
            </section>
            <section className="articleCta" aria-labelledby="cta-title">
              <div>
                <span className="kicker">Langkah berikutnya</span>
                <h2 id="cta-title">Konsultasikan bunga duka cita</h2>
                <p>Kirimkan konteks simpati dan pilihan produk yang ingin dibahas secara langsung.</p>
              </div>
              <a className="primaryButton" href={waUrl("Halo Biorona, saya ingin konsultasi bunga duka cita.")} target="_blank" rel="noreferrer">Konsultasi via WhatsApp</a>
            </section>
            <section className="articleFaq" aria-labelledby="faq-title">
              <h2 id="faq-title">FAQ bunga duka cita</h2>
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
