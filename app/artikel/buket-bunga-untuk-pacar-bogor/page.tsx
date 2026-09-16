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

const articleUrl = absoluteUrl("/artikel/buket-bunga-untuk-pacar-bogor/");
const articleTitle = "Buket Bunga untuk Pacar di Bogor: Panduan Memilih | Biorona";
const primaryKeyword = "buket bunga untuk pacar Bogor";
const articleDescription = `Panduan memilih ${primaryKeyword} berdasarkan konteks hubungan, karakter rangkaian, dan data produk runtime.`;

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
    images: [{ url: absoluteUrl(siteConfig.defaultImage), alt: "Panduan memilih buket bunga untuk pacar" }],
  },
  twitter: {
    card: "summary_large_image",
    title: articleTitle,
    description: articleDescription,
    images: [absoluteUrl(siteConfig.defaultImage)],
  },
};

function partnerProducts(products: Product[]) {
  const selectedSlugs = ["mawaraster", "buketbalonmawar", "mawa40buket"];
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

export default async function BuketBungaUntukPacarBogorArticle() {
  const products = partnerProducts(await getProducts());
  if (products.length !== 3) notFound();

  const faqs = [
    ["Bagaimana memilih buket untuk pacar?", "Mulai dari momen pemberian, pesan yang ingin disampaikan, dan occasion atau tag yang tercatat pada produk runtime."],
    ["Apa perbedaan karakter produk yang perlu dibandingkan?", "Bandingkan kategori, occasion, tag, harga runtime, dan status availability tanpa menambahkan detail yang tidak tercatat."],
    ["Apakah harga produk bisa berubah?", "Harga mengikuti data produk runtime saat ini. Periksa halaman produk atau konfirmasi kembali melalui WhatsApp sebelum memesan."],
    ["Apa arti status preorder?", "Produk preorder bukan ready stock. Tanyakan ketersediaan dan proses pemesanannya sebelum membuat keputusan."],
    ["Apa yang perlu disiapkan saat konsultasi?", "Sampaikan konteks momen, budget, produk yang diminati, dan preferensi yang ingin dibahas."],
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
            <span aria-current="page">Buket Bunga untuk Pacar di Bogor</span>
          </nav>
          <header className="articleHeader">
            <span className="kicker">Panduan memilih hadiah romantis</span>
            <h1>{articleTitle}</h1>
            <p>Memilih buket untuk pacar dapat dimulai dari momen yang ingin dirayakan, karakter pesan, dan informasi produk yang tersedia saat ini.</p>
          </header>
          <div className="articleContent">
            <section aria-labelledby="context-title">
              <h2 id="context-title">Sesuaikan buket dengan momen</h2>
              <p>Buket untuk pacar bisa menjadi cara menyampaikan perhatian, merayakan momen romantis, atau memberi kejutan personal. Tentukan konteks pemberian agar pilihan terasa sesuai, bukan sekadar mengikuti tampilan.</p>
              <h3>Perhatikan karakter yang tercatat</h3>
              <p>Gunakan kategori, occasion, dan tag sebagai petunjuk karakter produk yang benar-benar tersedia di katalog runtime. Data seperti “romantis”, “cinta”, atau “buat pacar” dapat membantu membandingkan pilihan.</p>
              <h3>Periksa data sebelum memesan</h3>
              <p>Harga, availability, preorder, kategori, dan occasion perlu diperiksa pada halaman produk. Jangan menyimpulkan ukuran, jumlah bunga, material, atau layanan jika tidak tercatat.</p>
            </section>
            <section aria-labelledby="products-title">
              <h2 id="products-title">Pilihan buket untuk pacar</h2>
              <p>Produk berikut dipilih secara dinamis dari Supabase runtime karena memiliki occasion atau tag yang relevan untuk momen romantis dan berstatus tersedia.</p>
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
              <p>Tentukan momen, pesan yang ingin disampaikan, dan batas budget. Bandingkan produk yang paling sesuai, lalu buka halaman produk untuk memeriksa informasi runtime terbaru.</p>
              <p><Link className="articleCategoryLink" href="/buket-bunga-bogor/">Lihat koleksi buket terkait</Link> untuk membandingkan pilihan lain berdasarkan kebutuhan pemberian.</p>
            </section>
            <section className="articleCta" aria-labelledby="cta-title">
              <div>
                <span className="kicker">Langkah berikutnya</span>
                <h2 id="cta-title">Konsultasikan buket untuk pacar</h2>
                <p>Sampaikan konteks momen dan produk yang ingin dibahas agar detail pemesanan dapat dikonfirmasi.</p>
              </div>
              <a className="primaryButton" href={waUrl("Halo Biorona, saya ingin konsultasi buket bunga untuk pacar di Bogor.")} target="_blank" rel="noreferrer">Konsultasi via WhatsApp</a>
            </section>
            <section className="articleFaq" aria-labelledby="faq-title">
              <h2 id="faq-title">FAQ buket bunga untuk pacar</h2>
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
