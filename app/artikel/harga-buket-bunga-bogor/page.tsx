import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import MobileOrderBar from "@/components/MobileOrderBar";
import { absoluteUrl, siteConfig } from "@/data/site";
import type { Product } from "@/data/products";
import { formatProductAttribute } from "@/lib/product-seo";
import { formatRupiah } from "@/lib/format";
import { getProducts } from "@/lib/products";
import { waUrl } from "@/lib/whatsapp";
import { serializeJsonLd, floristId, floristSchema, websiteId, websiteSchema } from "@/lib/structured-data";

const articleUrl = absoluteUrl("/artikel/harga-buket-bunga-bogor/");
const articleTitle = "Harga Buket Bunga di Bogor: Panduan Memilih Sesuai Budget | Biorona";
const primaryKeyword = "harga buket bunga Bogor";
const articleDescription = `Panduan membaca ${primaryKeyword} berdasarkan data produk runtime, kebutuhan, dan budget tanpa menebak harga katalog.`;

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
    images: [{ url: absoluteUrl(siteConfig.defaultImage), alt: "Panduan memilih buket bunga sesuai budget" }],
  },
  twitter: {
    card: "summary_large_image",
    title: articleTitle,
    description: articleDescription,
    images: [absoluteUrl(siteConfig.defaultImage)],
  },
};

function budgetProducts(products: Product[]) {
  const selectedSlugs = ["mawaraster", "gardenia-romancelilysahara", "buketqueen500mawar"];
  const productsBySlug = new Map(products.map((product) => [product.slug, product]));
  return selectedSlugs
    .map((slug) => productsBySlug.get(slug))
    .filter((product): product is Product => Boolean(product && product.available));
}

function productDetails(product: Product) {
  const occasions = product.occasions.map(formatProductAttribute).filter(Boolean).join(", ");
  const tags = (product.tags ?? []).map(formatProductAttribute).filter(Boolean).join(", ");
  const orderingStatus = product.preorder
    ? "Produk ini berstatus preorder pada data runtime, jadi konfirmasi pemesanan tetap diperlukan."
    : "Produk ini tercatat tersedia pada data runtime.";

  return [
    `Harga yang tercatat di runtime: ${formatRupiah(product.price)}.`,
    occasions ? `Occasion: ${occasions}.` : "",
    tags ? `Tag: ${tags}.` : "",
    orderingStatus,
  ].filter(Boolean).join(" ");
}

export default async function HargaBuketBungaBogorArticle() {
  const products = budgetProducts(await getProducts());
  if (products.length !== 3) notFound();

  const faqs = [
    ["Apakah harga buket bunga di Bogor selalu sama?", "Tidak selalu. Gunakan harga yang tercantum pada halaman produk runtime saat ini dan konfirmasi kembali sebelum memesan."],
    ["Bagaimana memilih buket sesuai budget?", "Tentukan batas budget lebih dulu, lalu bandingkan harga, kategori, occasion, dan status pemesanan dari produk runtime yang tersedia."],
    ["Apakah harga di artikel bisa berubah?", "Harga mengikuti data produk runtime dan dapat berubah. Periksa halaman produk atau hubungi Biorona untuk konfirmasi terbaru."],
    ["Apakah produk preorder bisa langsung dipesan?", "Produk preorder bukan ready stock. Tanyakan ketersediaan dan proses pemesanannya melalui halaman produk atau WhatsApp."],
    ["Apa yang perlu disampaikan saat konsultasi?", "Sampaikan budget, tujuan pemberian, preferensi bentuk atau warna jika ada, serta produk yang ingin dibandingkan."],
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
            <span aria-current="page">Harga Buket Bunga di Bogor</span>
          </nav>
          <header className="articleHeader">
            <span className="kicker">Panduan memilih sesuai budget</span>
            <h1>{articleTitle}</h1>
            <p>Memilih buket dapat dimulai dari budget, tujuan pemberian, dan informasi harga yang benar-benar tercatat pada katalog runtime.</p>
          </header>
          <div className="articleContent">
            <section aria-labelledby="context-title">
              <h2 id="context-title">Mulai dari kebutuhan, bukan angka perkiraan</h2>
              <p>Budget membantu mempersempit pilihan, tetapi harga dapat berbeda menurut produk dan pembaruan katalog. Karena itu, gunakan harga yang tampil pada data produk saat ini dan hindari menyamakan semua rangkaian.</p>
              <h3>Bandingkan informasi yang tersedia</h3>
              <p>Perhatikan kategori, occasion, tag, status availability, dan preorder. Atribut tersebut membantu memahami pilihan tanpa menambahkan klaim tentang ukuran, jumlah bunga, material, atau layanan yang tidak tercatat.</p>
              <h3>Bedakan harga dan status pemesanan</h3>
              <p>Harga runtime bukan pengganti konfirmasi pemesanan. Produk yang berstatus preorder perlu diperlakukan berbeda dari produk yang tercatat tersedia tanpa preorder.</p>
            </section>
            <section aria-labelledby="products-title">
              <h2 id="products-title">Contoh produk dan harga runtime</h2>
              <p>Berikut tiga produk buket yang dipilih dinamis dari Supabase runtime. Harga yang ditampilkan mengikuti data aktual saat halaman dirender.</p>
              <div className="articleProductList">
                {products.map((product) => (
                  <article className="articleProductItem" key={product.slug}>
                    <h3><Link href={`/produk/${product.slug}/`}>{product.name}</Link></h3>
                    <p><strong>{product.category}</strong>. {productDetails(product)}</p>
                  </article>
                ))}
              </div>
            </section>
            <section aria-labelledby="steps-title">
              <h2 id="steps-title">Langkah praktis memilih</h2>
              <p>Tentukan batas budget dan konteks pemberian, lalu bandingkan produk yang paling mendekati kebutuhan. Setelah itu, buka halaman produk untuk memeriksa detail dan status terbaru.</p>
              <p><Link className="articleCategoryLink" href="/buket-bunga-bogor/">Lihat koleksi buket terkait</Link> untuk membandingkan pilihan lain tanpa menganggap semua produk memiliki harga yang sama.</p>
            </section>
            <section className="articleCta" aria-labelledby="cta-title">
              <div>
                <span className="kicker">Langkah berikutnya</span>
                <h2 id="cta-title">Konsultasikan pilihan sesuai budget</h2>
                <p>Sampaikan budget dan produk yang ingin dibandingkan agar detail pemesanan dapat dikonfirmasi.</p>
              </div>
              <a className="primaryButton" href={waUrl("Halo Biorona, saya ingin konsultasi harga buket bunga di Bogor.")} target="_blank" rel="noreferrer">Konsultasi via WhatsApp</a>
            </section>
            <section className="articleFaq" aria-labelledby="faq-title">
              <h2 id="faq-title">FAQ harga buket bunga</h2>
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
