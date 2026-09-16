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

const articleUrl = absoluteUrl("/artikel/buket-bunga-wisuda/");
const articleTitle = "Buket Bunga Wisuda: Panduan Memilih Hadiah | Biorona";
const articleDescription = "Panduan memilih buket bunga wisuda berdasarkan warna, occasion kelulusan, dan pilihan produk Biorona yang tersedia di katalog.";
const productSlugs = ["bungabuketwisuda", "gardenia-romancelilysahara", "buketqueen500mawar"] as const;

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
    images: [{ url: absoluteUrl(siteConfig.defaultImage), alt: "Buket bunga Biorona untuk hadiah wisuda" }],
  },
  twitter: {
    card: "summary_large_image",
    title: articleTitle,
    description: articleDescription,
    images: [absoluteUrl(siteConfig.defaultImage)],
  },
};

function productReason(product: { colors: string[]; occasions: string[] }) {
  const colors = product.colors.map(formatProductAttribute).filter(Boolean).join(", ");
  const occasions = product.occasions.map(formatProductAttribute).filter(Boolean).join(", ");
  return [
    colors ? `Warna yang tercatat: ${colors}.` : "",
    occasions ? `Occasion yang tercatat: ${occasions}.` : "",
    "Relevan untuk dipertimbangkan karena data produknya mencantumkan wisuda atau kelulusan.",
  ].filter(Boolean).join(" ");
}

export default async function GraduationBouquetArticle() {
  const products = await getProducts();
  const articleProducts = productSlugs.map((slug) => products.find((product) => product.slug === slug));
  if (articleProducts.some((product) => !product)) notFound();

  const [serenadePutih, coralCharm, meadowOfHope] = articleProducts as [Product, Product, Product];
  const faqs = [
    ["Produk Biorona apa yang tercatat untuk occasion kelulusan?", "Bunga Buket Wisuda, Gardenia Romance Lily Sahara, dan Buket Queen 500 Mawar termasuk produk runtime yang mencantumkan occasion wisuda atau kelulusan."],
    ["Bagaimana memilih warna buket untuk wisuda?", "Gunakan warna yang tercatat pada setiap produk sebagai referensi, lalu pilih nuansa yang paling sesuai dengan penerima dan pesan yang ingin disampaikan."],
    ["Bagaimana cara memesan buket wisuda?", "Buka halaman produk yang dipilih, periksa detailnya, lalu lanjutkan konsultasi melalui WhatsApp Biorona."],
    ["Apakah availability produk wisuda perlu dikonfirmasi?", "Ya. Availability dan status pemesanan perlu diperiksa pada halaman produk atau dikonfirmasi melalui WhatsApp sebelum memesan."],
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
            <span aria-current="page">Buket Bunga Wisuda</span>
          </nav>
          <header className="articleHeader">
            <span className="kicker">Panduan memilih hadiah kelulusan</span>
            <h1>Buket Bunga Wisuda: Panduan Memilih Hadiah Kelulusan</h1>
            <p>Memilih buket untuk wisuda dapat dimulai dari pesan yang ingin disampaikan, warna yang tersedia, dan occasion yang tercatat pada produk. Gunakan panduan ini untuk mempersempit pilihan sebelum membuka detail produk.</p>
          </header>
          <div className="articleContent">
            <section aria-labelledby="cara-memilih-title">
              <h2 id="cara-memilih-title">Cara memilih buket bunga wisuda</h2>
              <p>Hadiah wisuda tidak harus dipilih hanya dari nama produk. Perhatikan nuansa warna dan occasion yang tercatat agar pilihan lebih sesuai dengan penerima. Data katalog Biorona mencantumkan beberapa produk dengan occasion kelulusan yang dapat dijadikan titik awal.</p>
              <h3>Mulai dari warna</h3>
              <p>Warna dapat membantu menentukan kesan hadiah. Bandingkan warna yang tercantum di halaman produk, lalu pilih rangkaian yang paling mendekati preferensi penerima atau tema perayaan.</p>
              <h3>Periksa occasion kelulusan</h3>
              <p>Gunakan produk yang memang memiliki occasion kelulusan pada data katalog. Dengan begitu, pilihan berangkat dari informasi produk yang tersedia, bukan dari asumsi tentang isi rangkaian.</p>
            </section>
            <section aria-labelledby="pilihan-title">
              <h2 id="pilihan-title">Tiga pilihan yang dapat dipertimbangkan</h2>
              <p>Ketiga produk berikut dipilih karena data katalog mencantumkan occasion kelulusan. Buka detail masing-masing untuk melihat informasi terbaru sebelum memesan.</p>
              <div className="articleProductList">
                <article className="articleProductItem">
                  <h3><Link href={`/produk/${serenadePutih.slug}/`}>{serenadePutih.name}</Link></h3>
                  <p><strong>{serenadePutih.category}</strong>. {productReason(serenadePutih)}</p>
                </article>
                <article className="articleProductItem">
                  <h3><Link href={`/produk/${coralCharm.slug}/`}>{coralCharm.name}</Link></h3>
                  <p><strong>{coralCharm.category}</strong>. {productReason(coralCharm)}</p>
                </article>
                <article className="articleProductItem">
                  <h3><Link href={`/produk/${meadowOfHope.slug}/`}>{meadowOfHope.name}</Link></h3>
                  <p><strong>{meadowOfHope.category}</strong>. {productReason(meadowOfHope)} Status pemesanan aktual dapat diperiksa di halaman produk.</p>
                </article>
              </div>
            </section>
            <section aria-labelledby="sebelum-pesan-title">
              <h2 id="sebelum-pesan-title">Siapkan detail sebelum memesan</h2>
              <p>Sebelum menghubungi Biorona, siapkan nama produk, tanggal kebutuhan, nama penerima, isi kartu ucapan, dan preferensi warna jika ada. Detail tersebut membantu percakapan pemesanan dimulai dari kebutuhan yang jelas.</p>
              <p><Link className="articleCategoryLink" href="/buket-bunga-bogor/">Lihat pilihan buket bunga Bogor</Link> untuk membandingkan koleksi yang tersedia, lalu buka halaman produk yang paling sesuai.</p>
            </section>
            <section className="articleCta" aria-labelledby="konsultasi-title">
              <div>
                <span className="kicker">Langkah berikutnya</span>
                <h2 id="konsultasi-title">Konsultasikan pilihan buket wisuda</h2>
                <p>Jika sudah memiliki pilihan atau masih ingin membandingkan warna dan occasion, lanjutkan konsultasi langsung dengan tim Biorona.</p>
              </div>
              <a className="primaryButton" href={waUrl("Halo Biorona, saya ingin konsultasi buket bunga wisuda.")} target="_blank" rel="noreferrer">Konsultasi via WhatsApp</a>
            </section>
            <section className="articleFaq" aria-labelledby="faq-title">
              <h2 id="faq-title">Pertanyaan tentang buket wisuda</h2>
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
