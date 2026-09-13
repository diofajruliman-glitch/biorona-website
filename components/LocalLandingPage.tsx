import Link from "next/link";
import type { Product } from "@/data/products";
import { absoluteUrl, siteConfig } from "@/data/site";
import { waUrl } from "@/lib/whatsapp";
import ProductCard from "./ProductCard";
import { ArrowIcon, SparkleIcon, WhatsAppIcon } from "./Icons";

type Area = "Bogor" | "Cibinong";

const copy = {
  Bogor: {
    slug: "toko-bunga-bogor",
    eyebrow: "Florist lokal untuk Bogor",
    h1: "Toko Bunga Bogor untuk Setiap Momen Berarti",
    intro: [
      "Biorona Florist membantu Anda mengirim perhatian melalui rangkaian bunga yang terasa personal. Berbasis di Cibinong, kami melayani kebutuhan pelanggan yang mencari toko bunga Bogor untuk hadiah, perayaan, ucapan selamat, maupun ungkapan simpati. Anda dapat memilih koleksi yang tersedia atau berkonsultasi lebih dahulu agar warna, ukuran, pesan, dan anggaran rangkaian sesuai dengan momen yang ingin disampaikan.",
      "Sebagai florist Bogor dengan proses pemesanan langsung melalui WhatsApp, Biorona membuat pengalaman memilih bunga tetap sederhana. Tidak perlu membuat akun atau melewati checkout panjang. Pilih produk, sampaikan alamat dan waktu pengiriman, lalu tim kami akan mengonfirmasi ketersediaan, detail rangkaian, ongkos kirim, dan metode pembayaran sebelum pesanan diproses.",
    ],
    services: [
      ["Buket bunga yang personal", "Koleksi buket bunga Bogor tersedia untuk ulang tahun, wisuda, anniversary, ucapan terima kasih, kejutan untuk pasangan, serta hadiah bagi keluarga atau sahabat. Pilihan warna dan gaya dapat dibicarakan agar hasilnya selaras dengan karakter penerima."],
      ["Standing flower dan bunga ucapan", "Untuk grand opening, pernikahan, acara perusahaan, ucapan selamat, atau duka cita, Biorona menyediakan standing flower Bogor dan bunga ucapan Bogor. Isi pesan, nuansa warna, ukuran, serta waktu kebutuhan akan dikonfirmasi sebelum pengerjaan."],
      ["Flower box dan custom bouquet", "Jika Anda menginginkan bentuk yang berbeda dari koleksi reguler, layanan custom bouquet Bogor dapat disesuaikan berdasarkan tema, palet warna, jenis momen, dan kisaran budget. Flower box juga tersedia sebagai hadiah yang rapi dan mudah diberikan."],
    ],
    strengths: "Setiap pesanan dimulai dari komunikasi yang jelas. Tim Biorona membantu memeriksa kecocokan pilihan, menjelaskan status ready atau pre-order, dan memastikan catatan ucapan tidak terlewat. Foto pada katalog menjadi referensi gaya; ketersediaan bunga segar dapat berubah sehingga substitusi, jika diperlukan, selalu dibicarakan terlebih dahulu. Pendekatan ini membuat hasil akhir tetap memiliki karakter Biorona sekaligus relevan dengan permintaan Anda.",
    delivery: "Layanan pengiriman mencakup Cibinong, area Bogor, dan wilayah sekitar yang dapat dijangkau berdasarkan alamat tujuan. Untuk menjaga ekspektasi tetap akurat, cakupan same-day, jadwal pickup, biaya kurir, dan estimasi tiba dikonfirmasi melalui WhatsApp. Berikan kecamatan atau titik tujuan, tanggal, serta rentang waktu yang diharapkan agar tim dapat memeriksa opsi pengiriman yang paling sesuai.",
    order: "Cara memesan cukup singkat: buka katalog, pilih rangkaian yang disukai, lalu tekan tombol pesan. Pesan WhatsApp akan membawa informasi produk sehingga konsultasi dapat langsung dimulai. Sampaikan nama penerima, alamat, tanggal pengiriman, teks kartu ucapan, dan permintaan warna bila ada. Setelah ketersediaan dan total biaya dikonfirmasi, tim akan memberikan arahan pembayaran dan pengerjaan.",
    guidance: [
      "Memilih rangkaian tidak harus dimulai dari nama bunga. Anda dapat memulai dari suasana yang ingin disampaikan: hangat untuk ulang tahun, tenang untuk simpati, elegan untuk acara resmi, atau cerah untuk ucapan selamat. Informasi tentang penerima dan acaranya membantu florist menyarankan bentuk rangkaian yang lebih tepat. Jika memiliki foto referensi, gunakan sebagai arah gaya, bukan janji salinan persis, karena karakter dan ketersediaan bunga dapat berbeda.",
      "Untuk pesanan acara, sebaiknya hubungi Biorona lebih awal agar ukuran, jumlah, warna utama, tulisan, dan jadwal penyerahan dapat direncanakan. Untuk hadiah personal, jangan lupa memeriksa ejaan nama dan isi kartu. Nomor penerima juga berguna bagi kurir, tetapi kejutan tetap dapat diatur dengan memberi catatan saat konsultasi. Semua keputusan akhir dikonfirmasi melalui WhatsApp agar pesanan tercatat jelas.",
    ],
    faqs: [
      ["Apakah Biorona melayani pengiriman bunga ke seluruh Bogor?", "Biorona melayani Cibinong, Bogor, dan sekitarnya. Ketersediaan pengiriman, ongkir, dan estimasi waktu ditentukan setelah alamat lengkap dikirim melalui WhatsApp."],
      ["Bisakah memesan bunga untuk dikirim pada hari yang sama?", "Same-day dapat dikonsultasikan dan bergantung pada produk, waktu pemesanan, kapasitas pengerjaan, serta area tujuan."],
      ["Apakah desain buket dapat disesuaikan?", "Bisa. Berikan referensi warna, gaya, momen, dan budget. Tim akan mengonfirmasi opsi bahan serta hasil yang memungkinkan sebelum produksi."],
    ],
  },
  Cibinong: {
    slug: "toko-bunga-cibinong",
    eyebrow: "Biorona dekat dengan momen Anda",
    h1: "Toko Bunga Cibinong dengan Pemesanan Mudah",
    intro: [
      "Biorona Florist adalah pilihan lokal bagi Anda yang mencari toko bunga Cibinong untuk mengirim hadiah yang hangat dan berkesan. Kami menyiapkan rangkaian untuk ulang tahun, wisuda, anniversary, ucapan selamat, grand opening, pernikahan, duka cita, serta berbagai momen personal. Koleksi dapat dilihat secara transparan melalui katalog, kemudian detail pesanan dikonsultasikan langsung bersama tim melalui WhatsApp.",
      "Berada di Cibinong, Bogor, Biorona memahami bahwa banyak pesanan bunga membutuhkan respons cepat sekaligus perhatian pada detail. Karena itu, prosesnya dibuat ringkas tanpa menghilangkan sentuhan personal. Anda cukup memilih produk atau menyampaikan ide, lalu florist Cibinong kami akan membantu menyesuaikan pilihan warna, ukuran, isi kartu ucapan, jadwal, dan budget sebelum pesanan dikerjakan.",
    ],
    services: [
      ["Buket untuk hadiah dan perayaan", "Pilihan buket bunga Cibinong mencakup gaya lembut, cerah, romantis, hingga elegan untuk wisuda dan acara formal. Setiap produk memiliki informasi harga awal serta status ketersediaan agar Anda memiliki gambaran sebelum menghubungi tim."],
      ["Rangkaian untuk acara dan ucapan", "Selain buket, tersedia flower box, standing flower, dan rangkaian bunga ucapan. Produk dapat digunakan untuk pembukaan usaha, ucapan selamat, pernikahan, atau simpati. Teks ucapan dan detail penerima diperiksa kembali saat konfirmasi."],
      ["Pesanan custom sesuai kebutuhan", "Sebagai toko buket Cibinong yang menerima konsultasi personal, Biorona menyediakan custom bouquet berdasarkan momen, warna favorit, gaya, dan kisaran anggaran. Tim akan menjelaskan opsi yang realistis sesuai bahan yang tersedia."],
    ],
    strengths: "Biorona mengutamakan kejelasan sejak awal. Katalog membantu Anda membandingkan produk, sedangkan WhatsApp menjadi ruang untuk memastikan detail yang tidak bisa diwakili foto saja. Bunga segar bersifat musiman dan ketersediaannya dapat berubah; bila diperlukan penyesuaian, tim akan mendiskusikannya agar karakter warna dan nilai rangkaian tetap terjaga. Pesanan tidak diproses diam-diam dengan substitusi yang tidak disepakati.",
    delivery: "Pickup tersedia di area Cibinong. Pengiriman bunga Cibinong dan ke area Bogor diatur berdasarkan lokasi tujuan, waktu pemesanan, serta kapasitas pada hari tersebut. Same-day dapat ditanyakan, tetapi tetap perlu konfirmasi produk dan kurir. Kirimkan alamat atau patokan yang jelas beserta waktu acara agar estimasi dan biaya pengiriman dapat dihitung secara wajar.",
    order: "Untuk memesan, jelajahi katalog Biorona dan buka halaman produk yang Anda minati. Tekan tombol WhatsApp, lalu lengkapi nama penerima, nomor yang dapat dihubungi, alamat, tanggal, pilihan pickup atau delivery, serta isi kartu ucapan. Jika belum menemukan desain yang tepat, kirim informasi momen dan budget untuk memulai konsultasi custom. Tim akan mengonfirmasi ketersediaan, total, dan langkah pembayaran.",
    guidance: [
      "Agar lebih mudah memilih bunga Cibinong yang sesuai, mulailah dengan menentukan momen dan kesan yang diinginkan. Warna pastel memberi nuansa lembut, kombinasi cerah terasa meriah, sedangkan warna netral cenderung formal. Tim dapat membantu menerjemahkan preferensi tersebut menjadi buket atau rangkaian yang realistis. Foto referensi boleh dikirim sebagai panduan gaya, dengan hasil akhir menyesuaikan bahan yang tersedia dan karakter desain Biorona.",
      "Pesanan untuk acara dengan ukuran atau jumlah khusus idealnya dibicarakan lebih awal. Siapkan informasi tanggal, lokasi, tema, jumlah rangkaian, dan kisaran budget agar rekomendasi lebih terarah. Untuk hadiah, periksa nama penerima, teks kartu, serta nomor kontak tujuan sebelum konfirmasi. Jika pesanan dimaksudkan sebagai kejutan, sampaikan kepada tim supaya komunikasi pengiriman dapat diatur tanpa menghilangkan momennya.",
    ],
    faqs: [
      ["Apakah bisa pickup langsung di Cibinong?", "Ya, pickup tersedia di area Cibinong. Lokasi dan waktu pengambilan dikonfirmasi melalui WhatsApp setelah produk siap."],
      ["Apakah Biorona menerima pesanan buket custom?", "Ya. Sampaikan budget, warna, gaya, dan tujuan pemberian. Tim akan memberikan opsi sesuai ketersediaan bahan."],
      ["Berapa lama waktu pemesanan yang disarankan?", "Produk reguler sebaiknya dipesan minimal H-1. Pesanan custom atau kebutuhan acara disarankan dikonsultasikan lebih awal; same-day bergantung pada ketersediaan."],
    ],
  },
} as const;

export default function LocalLandingPage({ area, products }: { area: Area; products: Product[] }) {
  const page = copy[area];
  const chosen = products.slice(0, 3);
  const canonical = absoluteUrl(`/${page.slug}/`);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": canonical, url: canonical, name: page.h1, isPartOf: { "@id": `${siteConfig.siteUrl}/#website` }, about: { "@id": `${siteConfig.siteUrl}/#florist` } },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: `${siteConfig.siteUrl}/` },
        { "@type": "ListItem", position: 2, name: page.h1, item: canonical },
      ] },
      { "@type": "FAQPage", mainEntity: page.faqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) },
    ],
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <main className="localLanding">
      <section className="localLandingHero">
        <div className="container localLandingHeroGrid">
          <div><span className="kicker"><SparkleIcon size={16}/>{page.eyebrow}</span><h1>{page.h1}</h1><p>{page.intro[0]}</p><div className="heroCtas"><a className="primaryButton" href={waUrl(`Halo Biorona 🌷 Saya ingin memesan bunga untuk area ${area}.`)} target="_blank" rel="noreferrer"><WhatsAppIcon size={19}/> Pesan via WhatsApp</a><Link className="secondaryGlassButton glassSurface" href="/katalog/">Lihat katalog <ArrowIcon size={18}/></Link></div></div>
          <div className="localLandingOrb glassSurface" aria-hidden="true"><img src="/brand/biorona-logo.png" alt="" width="480" height="240"/></div>
        </div>
      </section>
      <div className="container localLandingBody">
        <nav className="productBreadcrumb" aria-label="Breadcrumb"><Link href="/">Beranda</Link><span aria-hidden="true">/</span><span aria-current="page">{page.h1}</span></nav>
        <section aria-labelledby="layanan-title"><h2 id="layanan-title">Rangkaian bunga untuk kebutuhan personal dan acara</h2><p>{page.intro[1]}</p><div className="localLandingServices">{page.services.map(([title, description]) => <article className="glassSurface" key={title}><h3>{title}</h3><p>{description}</p></article>)}</div></section>
        <section className="localLandingSplit" aria-labelledby="keunggulan-title"><div><h2 id="keunggulan-title">Mengapa memilih Biorona Florist?</h2><p>{page.strengths}</p></div><div><h2>Area pickup dan pengiriman</h2><p>{page.delivery}</p></div></section>
        <section aria-labelledby="panduan-title"><h2 id="panduan-title">Panduan memilih dan menyiapkan pesanan</h2>{page.guidance.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>
        <nav className="localLandingOrder glassSurface" aria-label="Kategori bunga Biorona"><div><span className="kicker">Jelajahi berdasarkan kebutuhan</span><h2>Koleksi bunga di Bogor</h2><p><Link href="/buket-bunga-bogor/">Buket bunga Bogor</Link> · <Link href="/standing-flower-bogor/">Standing flower Bogor</Link> · <Link href="/bunga-ucapan-bogor/">Bunga ucapan Bogor</Link></p></div><Link className="secondaryGlassButton" href="/katalog/">Lihat katalog <ArrowIcon size={18}/></Link></nav>
        <section className="localLandingOrder glassSurface" aria-labelledby="cara-order-title"><div><span className="kicker">Langsung, jelas, dan personal</span><h2 id="cara-order-title">Cara order bunga melalui WhatsApp</h2><p>{page.order}</p></div><a className="primaryButton" href={waUrl(`Halo Biorona 🌷 Saya ingin konsultasi pesanan bunga di ${area}.`)} target="_blank" rel="noreferrer"><WhatsAppIcon size={19}/> Mulai konsultasi</a></section>
        {chosen.length > 0 && <section aria-labelledby="produk-pilihan-title"><div className="sectionHeading splitHeading"><div><span className="kicker">Dari katalog aktif</span><h2 id="produk-pilihan-title">Produk pilihan Biorona</h2></div><p>Lihat detail, harga, dan opsi pemesanan pada setiap produk.</p></div><div className="productGrid">{chosen.map((product) => <ProductCard product={product} key={product.slug}/>)}</div><p className="localLandingMore"><Link href="/katalog/">Jelajahi seluruh katalog bunga Biorona <ArrowIcon size={17}/></Link></p></section>}
        <section className="localLandingFaq" aria-labelledby="local-faq-title"><div><span className="kicker">Pertanyaan umum</span><h2 id="local-faq-title">Sebelum memesan bunga</h2></div><div className="faqList">{page.faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></section>
        <section className="localLandingFinal"><h2>Siapkan bunga untuk momen Anda bersama Biorona</h2><p>Pilih koleksi yang tersedia atau ceritakan kebutuhan Anda. Tim Biorona akan membantu menyiapkan opsi yang sesuai untuk area {area} dan sekitarnya.</p><a className="primaryButton" href={waUrl(`Halo Biorona 🌷 Saya ingin memesan bunga untuk area ${area}.`)} target="_blank" rel="noreferrer"><WhatsAppIcon size={19}/> Pesan bunga sekarang</a></section>
      </div>
    </main>
  </>;
}
