import Link from "next/link";
import type { Product } from "@/data/products";
import { absoluteUrl, siteConfig } from "@/data/site";
import { categorySeoRoutes, type CategorySeoKey } from "@/lib/product-seo";
import { waUrl } from "@/lib/whatsapp";
import ProductCard from "./ProductCard";
import { ArrowIcon, SparkleIcon, WhatsAppIcon } from "./Icons";
import { floristId, floristSchema, serializeJsonLd, websiteId, websiteSchema } from "@/lib/structured-data";

const pageCopy = {
  buket: {
    h1: "Buket Bunga Bogor untuk Hadiah & Momen Spesial",
    eyebrow: "Fresh flower • Artificial bouquet • Custom",
    intro: "Temukan buket bunga Bogor dari Biorona Florist Cibinong untuk ulang tahun, wisuda, anniversary, hadiah, dan ucapan personal. Koleksi di bawah menggunakan produk aktif Biorona, mencakup buket fresh flower dan buket artificial dengan harga serta status ketersediaan yang dapat diperiksa sebelum memesan.",
    usage: [
      ["Fresh flower", "Rangkaian bunga segar untuk hadiah yang hangat, wisuda, ulang tahun, anniversary, dan kejutan personal."],
      ["Artificial bouquet", "Pilihan buket yang tahan lama untuk hadiah, dekorasi, atau kenang-kenangan dengan perawatan sederhana."],
      ["Custom bouquet", "Konsultasikan warna, gaya, momen, dan kisaran budget. Ketersediaan bahan serta hasil yang memungkinkan akan dikonfirmasi oleh tim."],
    ],
    area: "Pickup tersedia di Cibinong. Pengiriman buket bunga ke Cibinong, Bogor, dan area sekitar dapat dikonsultasikan berdasarkan alamat, waktu pemesanan, produk, dan ketersediaan kurir. Same-day bukan janji otomatis; tim akan memeriksa kapasitas dan estimasi sebelum pesanan diproses.",
    moments: "Buket dapat dipilih berdasarkan suasana yang ingin disampaikan, bukan hanya jenis bunga. Nuansa lembut cocok untuk hadiah personal, warna cerah terasa meriah untuk wisuda dan ulang tahun, sementara komposisi yang tenang dapat dipilih untuk ucapan formal. Foto produk menjadi referensi gaya. Untuk bunga segar, substitusi bahan bila diperlukan selalu dibicarakan lebih dahulu agar warna dan nilai rangkaian tetap terjaga.",
    faqs: [
      ["Apakah tersedia buket fresh flower dan artificial?", "Ya. Halaman ini menampilkan produk aktif dari kategori Buket Fresh Flower dan Buket Artificial milik Biorona."],
      ["Bisakah memesan custom bouquet di Bogor?", "Bisa. Sampaikan momen, warna, gaya, dan budget melalui WhatsApp agar tim dapat memberikan opsi berdasarkan bahan yang tersedia."],
      ["Apakah buket bisa dikirim pada hari yang sama?", "Same-day dapat dikonsultasikan dan bergantung pada waktu pemesanan, produk, kapasitas pengerjaan, serta area tujuan."],
    ],
  },
  standing: {
    h1: "Standing Flower Bogor untuk Ucapan & Acara",
    eyebrow: "Ucapan selamat • Acara • Simpati",
    intro: "Biorona menyediakan standing flower Bogor untuk kebutuhan ucapan dan acara di Cibinong, Bogor, dan area sekitar. Produk yang tampil merupakan Standing Flower aktif dengan harga serta status ketersediaan yang nyata, sehingga Anda dapat memilih referensi sebelum mengonfirmasi tulisan, ukuran, waktu, dan alamat pengiriman melalui WhatsApp.",
    usage: [
      ["Ucapan selamat", "Untuk grand opening, pencapaian, peluncuran usaha, atau perayaan lain dengan pesan yang disesuaikan."],
      ["Pernikahan dan acara", "Rangkaian standing untuk menyampaikan doa dan dukungan pada acara personal maupun kebutuhan perusahaan."],
      ["Ungkapan simpati", "Pilihan nuansa yang lebih tenang untuk menyampaikan belasungkawa secara pantas dan personal."],
    ],
    area: "Biorona berbasis di Cibinong dan melayani permintaan standing flower untuk Bogor serta area sekitar yang dapat dijangkau. Ongkos kirim, estimasi waktu, dan opsi same-day ditentukan setelah alamat lengkap dan jadwal acara diterima. Untuk pesanan berukuran besar atau bertanggal khusus, konsultasi lebih awal membantu tim merencanakan bahan dan pengiriman.",
    moments: "Saat memesan standing flower, siapkan nama penerima atau instansi, isi ucapan, nama pengirim, jenis acara, dan waktu rangkaian harus tiba. Tim akan memeriksa ejaan sebelum produksi. Gambar katalog berfungsi sebagai acuan komposisi; pilihan bunga dapat menyesuaikan ketersediaan tanpa mengubah pesanan secara sepihak. Ukuran, palet warna, dan perubahan yang diperlukan dikonfirmasi lewat WhatsApp.",
    faqs: [
      ["Untuk acara apa standing flower Biorona dapat dipesan?", "Standing flower dapat dikonsultasikan untuk grand opening, ucapan selamat, pernikahan, acara perusahaan, dan ungkapan simpati."],
      ["Apakah tulisan ucapan dapat disesuaikan?", "Ya. Isi ucapan dan nama pengirim dikirim melalui WhatsApp dan diperiksa kembali saat konfirmasi pesanan."],
      ["Apakah tersedia pengiriman ke Cibinong dan Bogor?", "Tersedia sesuai jangkauan kurir. Kirim alamat lengkap dan jadwal agar ongkir serta estimasi dapat dikonfirmasi."],
    ],
  },
  ucapan: {
    h1: "Bunga Ucapan Bogor untuk Berbagai Momen",
    eyebrow: "Pesan personal • Selamat • Dukacita",
    intro: "Pilih bunga ucapan Bogor dari produk aktif Biorona untuk menyampaikan selamat, dukungan, atau simpati. Halaman ini secara khusus menampilkan kategori Bunga Papan / Ucapan yang tersedia di katalog, tanpa mencampurkan produk lain hanya untuk menambah jumlah pilihan. Detail pesan dan kebutuhan acara dikonfirmasi langsung melalui WhatsApp.",
    usage: [
      ["Perayaan dan pembukaan", "Sampaikan selamat untuk grand opening, pencapaian, atau momen penting dengan teks yang telah diperiksa."],
      ["Pernikahan dan anniversary", "Rangkaian ucapan dapat dikonsultasikan untuk pernikahan, anniversary, atau dukungan bagi orang terdekat."],
      ["Simpati dan dukacita", "Gunakan pesan yang pantas dan nuansa lebih tenang untuk mewakili perhatian keluarga, kerabat, atau perusahaan."],
    ],
    area: "Pesanan bunga ucapan dapat diambil di Cibinong atau dikirim ke area Cibinong, Bogor, dan sekitarnya sesuai jangkauan. Ketersediaan produk, ongkos kirim, dan waktu tiba perlu dikonfirmasi terlebih dahulu. Cantumkan alamat lengkap, tanggal, batas waktu acara, serta kontak penerima agar proses pengiriman dapat direncanakan dengan jelas.",
    moments: "Agar pesan tidak keliru, kirim teks ucapan, nama penerima, dan nama pengirim dalam format final. Biorona akan mengonfirmasi detail tersebut bersama produk dan jadwal sebelum pengerjaan. Jika Anda belum yakin memilih rangkaian untuk ulang tahun, anniversary, ucapan selamat, atau duka cita, jelaskan momennya agar tim dapat membantu menunjukkan opsi yang memang tersedia tanpa menjanjikan bahan yang belum dikonfirmasi.",
    faqs: [
      ["Apakah isi bunga ucapan dapat dibuat personal?", "Ya. Teks, nama penerima, dan nama pengirim dikonfirmasi melalui WhatsApp sebelum pesanan diproses."],
      ["Apakah halaman ini menampilkan produk aktual?", "Ya. Produk diambil dari kategori aktif Bunga Papan / Ucapan pada katalog Biorona."],
      ["Bisakah dikirim untuk acara di Bogor?", "Bisa sesuai jangkauan dan jadwal kurir. Alamat, ongkir, dan estimasi waktu akan dikonfirmasi melalui WhatsApp."],
    ],
  },
} as const;

export default function CategorySeoPage({ categoryKey, products }: { categoryKey: CategorySeoKey; products: Product[] }) {
  const route = categorySeoRoutes[categoryKey];
  const page = pageCopy[categoryKey];
  const canonical = absoluteUrl(`/${route.slug}/`);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      websiteSchema(),
      floristSchema(),
      { "@type": "WebPage", "@id": canonical, url: canonical, name: page.h1, isPartOf: { "@id": websiteId }, about: { "@id": floristId } },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: `${siteConfig.siteUrl}/` },
        { "@type": "ListItem", position: 2, name: route.label, item: canonical },
      ] },
      { "@type": "ItemList", itemListElement: products.map((product, index) => ({ "@type": "ListItem", position: index + 1, name: product.name, url: absoluteUrl(`/produk/${product.slug}/`) })) },
      { "@type": "FAQPage", mainEntity: page.faqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) },
    ],
  };
  const related = Object.values(categorySeoRoutes).filter((item) => item.slug !== route.slug);

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
    <main className="localLanding categorySeoPage">
      <section className="localLandingHero">
        <div className="container localLandingHeroGrid">
          <div><span className="kicker"><SparkleIcon size={16}/>{page.eyebrow}</span><h1>{page.h1}</h1><p>{page.intro}</p><div className="heroCtas"><Link className="secondaryGlassButton glassSurface" href="#produk">Lihat produk <ArrowIcon size={18}/></Link><a className="primaryButton" href={waUrl(`Halo Biorona 🌷 Saya ingin konsultasi ${route.label}.`)} target="_blank" rel="noreferrer"><WhatsAppIcon size={19}/> Pesan via WhatsApp</a></div></div>
          <div className="localLandingOrb glassSurface" aria-hidden="true"><img src="/brand/biorona-logo.png" alt="" width="480" height="240"/></div>
        </div>
      </section>
      <div className="container localLandingBody">
        <nav className="productBreadcrumb" aria-label="Breadcrumb"><Link href="/">Beranda</Link><span aria-hidden="true">/</span><span aria-current="page">{route.label}</span></nav>
        <section id="produk" aria-labelledby="produk-title"><div className="sectionHeading splitHeading"><div><span className="kicker">Katalog aktif Biorona</span><h2 id="produk-title">Pilihan {route.label}</h2></div><p>Harga dan status ketersediaan ditampilkan pada setiap produk.</p></div><div className="productGrid">{products.map((product) => <ProductCard product={product} key={product.slug}/>)}</div></section>
        <section aria-labelledby="penggunaan-title"><h2 id="penggunaan-title">Jenis rangkaian dan momen penggunaan</h2><p>{page.moments}</p><div className="localLandingServices">{page.usage.map(([title, description]) => <article className="glassSurface" key={title}><h3>{title}</h3><p>{description}</p></article>)}</div></section>
        <section className="localLandingSplit" aria-labelledby="area-title"><div><h2 id="area-title">Area layanan Bogor dan Cibinong</h2><p>{page.area}</p><p><Link href="/toko-bunga-bogor/">Layanan toko bunga Bogor</Link> · <Link href="/toko-bunga-cibinong/">Florist Cibinong</Link></p></div><div><h2>Cara order</h2><p>Pilih produk dan buka halaman detail untuk melihat informasi lengkap. Tekan tombol WhatsApp, lalu kirim tanggal, alamat, nama penerima, isi kartu atau ucapan, dan permintaan warna bila ada. Tim Biorona akan mengonfirmasi ketersediaan, ongkir, total, serta langkah pembayaran sebelum pengerjaan.</p></div></section>
        <section className="localLandingOrder glassSurface" aria-labelledby="related-title"><div><span className="kicker">Jelajahi koleksi terkait</span><h2 id="related-title">Kategori bunga lainnya</h2><p>{related.map((item, index) => <span key={item.slug}>{index > 0 && " · "}<Link href={`/${item.slug}/`}>{item.label}</Link></span>)} · <Link href="/katalog/">Semua koleksi Biorona</Link></p></div><Link className="secondaryGlassButton" href="/katalog/">Buka katalog <ArrowIcon size={18}/></Link></section>
        <section className="localLandingFaq" aria-labelledby="category-faq-title"><div><span className="kicker">Pertanyaan umum</span><h2 id="category-faq-title">Sebelum memesan</h2></div><div className="faqList">{page.faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></section>
        <section className="localLandingFinal"><h2>Konsultasikan rangkaian Anda bersama Biorona</h2><p>Pilih produk yang tersedia atau sampaikan momen, alamat, jadwal, dan budget agar tim dapat membantu memeriksa opsi yang sesuai.</p><a className="primaryButton" href={waUrl(`Halo Biorona 🌷 Saya ingin memesan ${route.label}.`)} target="_blank" rel="noreferrer"><WhatsAppIcon size={19}/> Pesan bunga sekarang</a></section>
      </div>
    </main>
  </>;
}
