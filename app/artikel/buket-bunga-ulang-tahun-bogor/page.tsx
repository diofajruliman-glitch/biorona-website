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

const articleUrl = absoluteUrl("/artikel/buket-bunga-ulang-tahun-bogor/");
const articleTitle = "Buket Bunga untuk Ulang Tahun di Bogor: Panduan Memilih | Biorona";
const primaryKeyword = "buket bunga ulang tahun Bogor";
const articleDescription = `Panduan memilih ${primaryKeyword} berdasarkan kebutuhan, occasion, dan data produk runtime tanpa mengarang detail katalog.`;

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
    images: [{ url: absoluteUrl(siteConfig.defaultImage), alt: "Panduan memilih buket bunga ulang tahun" }],
  },
  twitter: {
    card: "summary_large_image",
    title: articleTitle,
    description: articleDescription,
    images: [absoluteUrl(siteConfig.defaultImage)],
  },
};

function birthdayProducts(products: Product[]) {
  const selectedSlugs = ["mawaraster", "buketbalonmawar", "lilymixmawarbuket"];
  const productsBySlug = new Map(products.map((product) => [product.slug, product]));
  return selectedSlugs
    .map((slug) => productsBySlug.get(slug))
    .filter((product): product is Product => Boolean(product && product.available));
}

function productDetails(product: Product) {
  const occasions = product.occasions.map(formatProductAttribute).filter(Boolean).join(", ");
  const tags = (product.tags ?? []).map(formatProductAttribute).filter(Boolean).join(", ");
  return [
    `Harga yang tercatat di runtime: ${formatRupiah(product.price)}.`,
    occasions ? `Occasion: ${occasions}.` : "",
    tags ? `Tag: ${tags}.` : "",
    product.preorder
      ? "Produk ini berstatus preorder pada data runtime, jadi konfirmasi pemesanan tetap diperlukan."
      : "Produk ini tercatat tersedia pada data runtime.",
  ].filter(Boolean).join(" ");
}

export default async function BuketBungaUlangTahunBogorArticle() {
  const products = birthdayProducts(await getProducts());
  if (products.length !== 3) notFound();

  const faqs = [
    ["Bagaimana memilih buket untuk ulang tahun?", "Mulai dari hubungan dengan penerima, suasana yang ingin disampaikan, dan occasion yang tercatat pada produk runtime."],
    ["Apa yang perlu dibandingkan sebelum memilih?", "Bandingkan kategori, occasion, tag, harga runtime, dan status availability pada halaman produk yang relevan."],
    ["Apakah harga produk bisa berubah?", "Harga mengikuti data produk runtime saat ini. Periksa halaman produk atau konfirmasi kembali melalui WhatsApp sebelum memesan."],
    ["Apakah semua produk tersedia untuk langsung dipesan?", "Periksa status availability dan preorder pada halaman produk. Status tersebut menjadi acuan sebelum pemesanan."],
    ["Apa yang perlu disiapkan saat konsultasi?", "Sampaikan konteks ulang tahun, budget, produk yang diminati, dan preferensi yang ingin dibahas."],
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
            <span aria-current="page">Buket Bunga untuk Ulang Tahun di Bogor</span>
          </nav>
          <header className="articleHeader">
            <span className="kicker">Panduan memilih hadiah ulang tahun</span>
            <h1>{articleTitle}</h1>
            <p>Memilih buket untuk ulang tahun dapat dimulai dari hubungan dengan penerima, pesan yang ingin disampaikan, dan data produk yang tersedia saat ini.</p>
          </header>
          <div className="articleContent">
            <section aria-labelledby="context-title">
              <h2 id="context-title">Sesuaikan buket dengan momen</h2>
              <p>Buket ulang tahun dapat dipilih untuk menyampaikan perhatian, ucapan hangat, atau kejutan personal. Tentukan lebih dulu konteks pemberian agar pilihan tidak hanya berdasarkan tampilan.</p>
              <h3>Perhatikan karakter rangkaian</h3>
              <p>Gunakan kategori dan tag produk sebagai petunjuk karakter yang memang tercatat di katalog. Occasion ulang tahun juga membantu mempersempit pilihan yang relevan.</p>
              <h3>Periksa data sebelum memesan</h3>
              <p>Harga, availability, preorder, kategori, dan occasion perlu diperiksa pada halaman produk. Jangan menyimpulkan ukuran, jumlah bunga, material, atau layanan jika tidak tercatat.</p>
            </section>
            <section aria-labelledby="products-title">
              <h2 id="products-title">Pilihan buket untuk ulang tahun</h2>
              <p>Produk berikut dipilih secara dinamis dari Supabase runtime karena memiliki occasion ulang tahun dan status tersedia.</p>
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
              <h2 id="steps-title">Langkah sebelum memesan</h2>
              <p>Tentukan penerima, pesan ulang tahun, dan batas budget. Bandingkan produk yang paling sesuai, lalu buka halaman produk untuk memeriksa informasi runtime terbaru.</p>
              <p><Link className="articleCategoryLink" href="/buket-bunga-bogor/">Lihat koleksi buket terkait</Link> untuk membandingkan pilihan lain berdasarkan kebutuhan pemberian.</p>
            </section>
            <section className="articleCta" aria-labelledby="cta-title">
              <div>
                <span className="kicker">Langkah berikutnya</span>
                <h2 id="cta-title">Konsultasikan buket ulang tahun</h2>
                <p>Sampaikan konteks ulang tahun dan produk yang ingin dibahas agar detail pemesanan dapat dikonfirmasi.</p>
              </div>
              <a className="primaryButton" href={waUrl("Halo Biorona, saya ingin konsultasi buket bunga ulang tahun di Bogor.")} target="_blank" rel="noreferrer">Konsultasi via WhatsApp</a>
            </section>
            <section className="articleFaq" aria-labelledby="faq-title">
              <h2 id="faq-title">FAQ buket bunga ulang tahun</h2>
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
