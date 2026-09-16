import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductImage from "@/components/ProductImage";
import { getProductImageAlt, type Product } from "@/data/products";
import { absoluteUrl, siteConfig } from "@/data/site";
import { getProducts } from "@/lib/products";
import { serializeJsonLd } from "@/lib/structured-data";
import { waUrl } from "@/lib/whatsapp";

const canonical = absoluteUrl("/artikel/bunga-anniversary/");
const title = "Bunga Anniversary untuk Momen yang Lebih Personal | Biorona";
const description = "Panduan memilih bunga anniversary berdasarkan nuansa, bentuk rangkaian, dan pesan yang ingin disampaikan. Lihat pilihan produk Biorona dan konsultasikan detailnya.";
const primaryKeyword = "bunga anniversary";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical },
  robots: { index: true, follow: true },
  openGraph: {
    type: "article",
    locale: "id_ID",
    siteName: siteConfig.brand,
    title,
    description,
    url: canonical,
    images: [{ url: absoluteUrl(siteConfig.defaultImage), alt: "Pilihan bunga anniversary dari Biorona Florist" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [absoluteUrl(siteConfig.defaultImage)],
  },
};

function anniversaryProducts(products: Product[]) {
  return products
    .filter((product) => product.occasions.some((occasion) => occasion.toLowerCase() === "anniversary"))
    .slice(0, 3);
}

function articleFaqs(products: Product[]) {
  const colors = [...new Set(products.flatMap((product) => product.colors))].slice(0, 5).join(", ");
  return [
    ["Produk apa yang cocok untuk anniversary?", "Pilihan dapat disesuaikan dengan nuansa yang ingin disampaikan. Produk yang memiliki occasion Anniversary pada katalog runtime Biorona dapat dilihat di bagian pilihan produk pada artikel ini."],
    ["Lebih baik memilih bouquet atau flower box?", "Bouquet memberi kesan hadiah yang ringan dan personal, sedangkan flower box dapat dipilih ketika Anda menginginkan bentuk rangkaian yang lebih terstruktur. Pertimbangkan gaya penerima dan cara penyampaiannya."],
    ["Warna apa yang dapat dipertimbangkan?", `Pilihan anniversary pada katalog runtime menampilkan warna ${colors || "yang tercantum pada setiap produk"}. Pilih nuansa yang paling dekat dengan karakter penerima.`],
    ["Apa yang perlu disiapkan sebelum memesan?", "Siapkan produk yang ingin ditanyakan, momen anniversary, serta preferensi warna atau gaya. Detail ketersediaan dan kebutuhan pesanan dikonfirmasi melalui WhatsApp."],
    ["Bisakah saya meminta rekomendasi?", "Bisa. Kirimkan pilihan produk dan konteks anniversary melalui WhatsApp agar detail yang sesuai dapat dikonsultasikan langsung dengan Biorona."],
  ] as const;
}

export default async function BungaAnniversaryArticle() {
  const products = anniversaryProducts(await getProducts());
  if (!products.length) notFound();

  const faqs = articleFaqs(products);
  const whatsappHref = waUrl("Halo Biorona, saya ingin konsultasi bunga anniversary.");
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${canonical}#article`,
        headline: title,
        description,
        inLanguage: "id-ID",
        mainEntityOfPage: canonical,
        author: { "@type": "Organization", name: siteConfig.brand, url: absoluteUrl("/") },
        publisher: { "@type": "Organization", name: siteConfig.brand, url: absoluteUrl("/") },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Beranda", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Artikel", item: absoluteUrl("/artikel/") },
          { "@type": "ListItem", position: 3, name: title, item: canonical },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${canonical}#faq`,
        mainEntity: faqs.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
      <main className="articlePage">
        <nav className="container articleBreadcrumb" aria-label="Breadcrumb">
          <span>Beranda</span><span aria-hidden="true">/</span><span>Artikel</span><span aria-hidden="true">/</span><span aria-current="page">Bunga Anniversary</span>
        </nav>
        <article className="container articleContent">
          <header className="articleHero">
            <span className="kicker">Panduan momen personal</span>
            <h1>{primaryKeyword.charAt(0).toUpperCase() + primaryKeyword.slice(1)} untuk momen yang lebih personal</h1>
            <p className="articleIntro">Anniversary adalah momen untuk menyampaikan perhatian dengan cara yang terasa dekat. Pilihan rangkaian dapat dimulai dari nuansa warna, bentuk bunga, dan pesan yang ingin Anda sampaikan kepada penerima.</p>
          </header>

          <section className="articleSection">
            <h2>Mulai dari cerita yang ingin disampaikan</h2>
            <p>Hadiah anniversary tidak harus rumit. Tentukan dulu kesan yang ingin dibawa: lembut, romantis, atau sederhana. Setelah itu, cocokkan dengan bentuk rangkaian dan warna yang tersedia pada produk runtime Biorona.</p>
            <div className="articleRuntimeNotes">
              {products.map((product) => <p key={product.slug}><strong>{product.name}.</strong> {product.description}</p>)}
            </div>
          </section>

          <section className="articleSection">
            <h2>Cara memilih bunga anniversary</h2>
            <ol className="articleSteps">
              <li><strong>Perhatikan karakter penerima.</strong> Pilih nuansa yang terasa paling dekat dengan gaya personalnya.</li>
              <li><strong>Tentukan bentuk rangkaian.</strong> Bouquet dan flower box memberi pengalaman menerima hadiah yang berbeda.</li>
              <li><strong>Siapkan pesan singkat.</strong> Konteks anniversary membantu tim memahami rekomendasi yang ingin Anda konsultasikan.</li>
            </ol>
          </section>

          <section className="articleSection" aria-labelledby="article-products-title">
            <div className="sectionHeading">
              <span className="kicker">Pilihan runtime Biorona</span>
              <h2 id="article-products-title">Produk yang relevan untuk anniversary</h2>
            </div>
            <div className="articleProductGrid">
              {products.map((product) => (
                <div className="articleProductCard" key={product.slug}>
                  <div className="articleProductImage">
                    <ProductImage images={product.images} sizes="(max-width: 700px) 100vw, 33vw" alt={getProductImageAlt(product)} />
                  </div>
                  <span className="productCategory">{product.category}</span>
                  <h3><Link href={`/produk/${product.slug}/`}>{product.name}</Link></h3>
                  <p>{product.shortDescription}</p>
                </div>
              ))}
            </div>
            <p className="articleCategoryLink"><Link href="/katalog/">Lihat katalog Biorona <span aria-hidden="true">→</span></Link></p>
          </section>

          <section className="articleCta" aria-labelledby="article-cta-title">
            <h2 id="article-cta-title">Siapkan ucapan anniversary Anda</h2>
            <p>Pilih produk yang paling sesuai, lalu konsultasikan detail pesanan dan ketersediaannya secara langsung.</p>
            <a className="primaryButton" href={whatsappHref} target="_blank" rel="noreferrer">Konsultasi via WhatsApp</a>
          </section>

          <section className="articleSection articleFaq" aria-labelledby="article-faq-title">
            <h2 id="article-faq-title">FAQ bunga anniversary</h2>
            <div className="faqList">
              {faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
