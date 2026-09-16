import Link from "next/link";
import type { Product } from "@/data/products";
import { absoluteUrl, siteConfig } from "@/data/site";
import { waUrl } from "@/lib/whatsapp";
import ProductCard from "./ProductCard";
import CategoryCards from "./CategoryCards";
import InstagramSection from "./InstagramSection";
import LocationSection from "./LocationSection";
import LivingBloom from "./LivingBloom";
import Reveal from "./Reveal";
import { ArrowIcon, SparkleIcon, WhatsAppIcon } from "./Icons";
import { floristId, floristSchema, serializeJsonLd, websiteId, websiteSchema } from "@/lib/structured-data";

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
      "Biorona Florist melayani kebutuhan bunga dari Cibinong untuk hadiah, wisuda, ulang tahun, anniversary, acara perusahaan, dan momen simpati. Anda dapat memilih buket, standing flower, bunga ucapan, atau custom arrangement yang tersedia, lalu membahas detailnya melalui WhatsApp.",
      "Cibinong menjadi titik awal konsultasi lokal Biorona. Proses pemesanan dimulai dari momen dan kebutuhan Anda, kemudian tim membantu mencocokkan produk aktif, warna atau gaya yang diinginkan, isi kartu, jadwal, serta budget sebelum pesanan diproses.",
    ],
    services: [
      ["Buket untuk hadiah personal", "Pilih buket fresh flower atau artificial untuk ulang tahun, wisuda, anniversary, hadiah pasangan, atau keluarga. Produk aktif menampilkan harga dan status yang dapat diperiksa sebelum konsultasi."],
      ["Standing flower dan bunga ucapan", "Untuk grand opening, ucapan selamat, acara perusahaan, pernikahan, atau simpati, pilih kategori rangkaian yang sesuai lalu siapkan teks, nama penerima, dan nama pengirim untuk dikonfirmasi."],
      ["Custom arrangement dari Cibinong", "Jika produk reguler belum sesuai, sampaikan momen, warna, gaya, dan kisaran budget. Tim akan membahas opsi yang realistis berdasarkan bahan dan produk yang tersedia."],
    ],
    strengths: "Konsultasi lokal membuat detail pesanan lebih mudah dibicarakan sejak awal. Katalog menunjukkan produk aktif, sedangkan WhatsApp dipakai untuk mencocokkan pilihan dengan momen, alamat, jadwal, dan catatan penerima. Bila ada penyesuaian pada bunga segar atau gaya rangkaian, keputusan dibahas terlebih dahulu agar tidak ada substitusi yang tidak disepakati.",
    delivery: "Pickup dapat dikonsultasikan di Cibinong. Pengiriman ke Cibinong dan area Bogor sekitar ditentukan berdasarkan alamat tujuan, waktu pemesanan, produk, dan ketersediaan kurir. Kirimkan patokan atau alamat lengkap beserta jadwal kebutuhan agar opsi pengiriman dan biayanya dapat diperiksa.",
    order: "Mulai dengan membuka katalog dan memilih produk yang sesuai, atau kirimkan momen serta budget jika membutuhkan arahan. Melalui WhatsApp, sampaikan nama penerima, alamat, tanggal, pilihan pickup atau delivery, dan isi kartu atau ucapan. Tim kemudian mengonfirmasi produk, ketersediaan, total, dan langkah pembayaran.",
    guidance: [
      "Untuk memilih bunga dari Cibinong, tentukan dulu momen dan kesan yang ingin disampaikan. Buket dapat dibahas untuk hadiah personal, sedangkan standing flower atau bunga ucapan lebih sesuai ketika ada acara dan pesan untuk penerima. Foto referensi boleh dikirim sebagai arah gaya, sementara hasil akhir mengikuti produk dan bahan yang tersedia.",
      "Sebelum konfirmasi, siapkan tanggal, lokasi, nama penerima, teks kartu atau ucapan, serta kisaran budget. Untuk kebutuhan acara, jelaskan jenis acara dan jumlah rangkaian yang dibutuhkan. Untuk hadiah kejutan, sampaikan catatan tersebut saat konsultasi agar detail komunikasi pengiriman dapat dibicarakan.",
    ],
    faqs: [
      ["Bagaimana cara konsultasi bunga di Cibinong?", "Pilih produk dari katalog atau sampaikan momen, budget, dan preferensi melalui WhatsApp. Tim akan membantu memeriksa opsi yang tersedia."],
      ["Apakah pickup dapat dibahas di Cibinong?", "Bisa. Lokasi dan waktu pickup dikonfirmasi melalui WhatsApp setelah produk dan kesiapan pesanan diperiksa."],
      ["Apakah pengiriman tersedia ke area Bogor?", "Pengiriman ke Cibinong dan area Bogor sekitar bergantung pada alamat, jadwal, produk, dan ketersediaan kurir. Detailnya dikonfirmasi sebelum pesanan diproses."],
    ],
  },
} as const;

const localCategories = [
  { title: "Buket Bunga Bogor", href: "/buket-bunga-bogor/", description: "Bouquet untuk wisuda, ulang tahun, anniversary, hadiah, dan momen personal." },
  { title: "Standing Flower Bogor", href: "/standing-flower-bogor/", description: "Rangkaian standing flower untuk grand opening, pernikahan, ucapan, dan acara." },
  { title: "Bunga Ucapan Bogor", href: "/bunga-ucapan-bogor/", description: "Rangkaian bunga ucapan dengan pesan, warna, dan kebutuhan acara yang dapat dikonsultasikan." },
  { title: "Flower Box", href: "/katalog/?category=Bloom%20Box", description: "Pilihan flower box Biorona untuk hadiah dan momen personal." },
  { title: "Custom Bouquet", href: "/katalog/?category=Custom%20Arrangement%20%2F%20Vase", description: "Jelajahi rangkaian custom yang tersedia di katalog Biorona." },
] as const;

export default function LocalLandingPage({ area, products }: { area: Area; products: Product[] }) {
  const page = copy[area];
  const chosen = products.slice(0, 3);
  const canonical = absoluteUrl(`/${page.slug}/`);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      websiteSchema(),
      floristSchema(),
      { "@type": "WebPage", "@id": canonical, url: canonical, name: page.h1, isPartOf: { "@id": websiteId }, about: { "@id": floristId } },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: `${siteConfig.siteUrl}/` },
        { "@type": "ListItem", position: 2, name: page.h1, item: canonical },
      ] },
      { "@type": "FAQPage", mainEntity: page.faqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) },
    ],
  };

  return <main className="localLanding">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
      <section className="localLandingHero">
        <div className="localLandingHeroBackdrop" aria-hidden="true" />
        <div className="container localLandingHeroGrid">
          <div className="localLandingHeroCopy"><span className="eyebrow heroEntrance"><SparkleIcon size={16}/>{page.eyebrow}</span><h1>{page.h1}</h1><p>{page.intro[0]}</p><div className="heroCtas"><a className="primaryButton" href={waUrl(`Halo Biorona 🌷 Saya ingin memesan bunga untuk area ${area}.`)} target="_blank" rel="noreferrer"><WhatsAppIcon size={19}/> Pesan via WhatsApp</a><Link className="secondaryGlassButton glassSurface" href="/katalog/">Lihat Katalog <ArrowIcon size={18}/></Link></div></div>
          <div className="localLandingOrb glassSurface" aria-hidden="true"><LivingBloom /></div>
        </div>
      </section>
      <div className="container localLandingBody">
        <nav className="productBreadcrumb" aria-label="Breadcrumb"><Link href="/">Beranda</Link><span aria-hidden="true">/</span><span aria-current="page">{page.h1}</span></nav>
        <Reveal><section aria-labelledby="layanan-title"><h2 id="layanan-title">Rangkaian bunga untuk kebutuhan personal dan acara</h2><p>{page.intro[1]}</p><div className="localLandingServices">{page.services.map(([title, description]) => <article className="glassSurface" key={title}><h3>{title}</h3><p>{description}</p></article>)}</div></section></Reveal>
        <Reveal><section className="localLandingSplit" aria-labelledby="keunggulan-title"><div><h2 id="keunggulan-title">Mengapa memilih Biorona Florist?</h2><p>{page.strengths}</p></div><div><h2>Area pickup dan pengiriman</h2><p>{page.delivery}</p></div></section></Reveal>
        <Reveal><section aria-labelledby="panduan-title"><h2 id="panduan-title">Panduan memilih dan menyiapkan pesanan</h2>{page.guidance.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section></Reveal>
        <Reveal><section className="localLandingCategories" aria-labelledby="category-title"><div className="sectionHeading splitHeading"><div><span className="kicker">Jelajahi berdasarkan kebutuhan</span><h2 id="category-title">{area === "Cibinong" ? "Koleksi bunga untuk Cibinong" : "Koleksi bunga di Bogor"}</h2></div><p>{area === "Cibinong" ? "Pilih rangkaian untuk pickup dari Cibinong atau konsultasikan delivery lokal sesuai alamat tujuan." : "Pilih jenis rangkaian sesuai momen, lalu konsultasikan cakupan dan jadwal delivery ke area Bogor."}</p></div><CategoryCards categories={localCategories} label={`Kategori bunga untuk ${area}`} /><div className="catalogAllCta"><Link className="secondaryGlassButton glassSurface" href="/katalog/">Lihat semua koleksi <ArrowIcon size={18}/></Link></div></section></Reveal>
        <Reveal><section className="localLandingOrder glassSurface" aria-labelledby="cara-order-title"><div><span className="kicker">Langsung, jelas, dan personal</span><h2 id="cara-order-title">Cara order bunga melalui WhatsApp</h2><p>{page.order}</p></div><a className="primaryButton" href={waUrl(`Halo Biorona 🌷 Saya ingin konsultasi pesanan bunga di ${area}.`)} target="_blank" rel="noreferrer"><WhatsAppIcon size={19}/> Mulai konsultasi</a></section></Reveal>
        {chosen.length > 0 && <Reveal><section aria-labelledby="produk-pilihan-title"><div className="sectionHeading splitHeading"><div><span className="kicker">Dari katalog aktif</span><h2 id="produk-pilihan-title">Produk pilihan Biorona</h2></div><p>Lihat detail, harga, dan opsi pemesanan pada setiap produk.</p></div><div className="productGrid">{chosen.map((product) => <ProductCard product={product} key={product.slug}/>)}</div><div className="catalogAllCta"><Link className="secondaryGlassButton glassSurface" href="/katalog/">Lihat semua koleksi <ArrowIcon size={18}/></Link></div></section></Reveal>}
        <Reveal><section className="localLandingFaq" aria-labelledby="local-faq-title"><div><span className="kicker">Pertanyaan umum</span><h2 id="local-faq-title">Sebelum memesan bunga</h2></div><div className="faqList">{page.faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></section></Reveal>
        <Reveal><section className="localLandingFinal"><h2>Siapkan bunga untuk momen Anda bersama Biorona</h2><p>Pilih koleksi yang tersedia atau ceritakan kebutuhan Anda. Tim Biorona akan membantu menyiapkan opsi yang sesuai untuk area {area} dan sekitarnya.</p><a className="primaryButton" href={waUrl(`Halo Biorona 🌷 Saya ingin memesan bunga untuk area ${area}.`)} target="_blank" rel="noreferrer"><WhatsAppIcon size={19}/> Pesan bunga sekarang</a></section></Reveal>
      </div>
      <Reveal><LocationSection /></Reveal>
      <Reveal><InstagramSection /></Reveal>
    </main>;
}
