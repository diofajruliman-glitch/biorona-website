import { siteConfig } from "@/data/site";

const faqs = [
  ["Apakah harus membuat akun?", "Tidak. Biorona dirancang tanpa login pelanggan. Pilih produk lalu lanjutkan pesanan langsung lewat WhatsApp."],
  ["Apakah pembayaran dilakukan di website?", "Tidak. Website berfungsi sebagai katalog dan pembentuk detail pesanan. Konfirmasi ketersediaan, ongkir, dan pembayaran diselesaikan lewat WhatsApp."],
  ["Bisa request warna atau custom bouquet?", "Bisa. Gunakan menu Custom Bouquet untuk memilih budget, warna, dan momen sebelum mengirim konsultasi ke WhatsApp."],
  ["Tersedia Pickup dan Delivery?", `Ya. Pickup tersedia di area ${siteConfig.location.city}. Untuk Delivery, area layanan dan ongkir dikonfirmasi melalui WhatsApp setelah alamat tujuan diberikan.`],
  ["Kapan sebaiknya memesan?", "Untuk produk reguler disarankan H-1. Pesanan custom atau kebutuhan khusus sebaiknya dikonsultasikan lebih awal."],
];

export default function FAQ({ limit }: { limit?: number }) {
  return <section className="section faqSection" id="faq"><div className="container faqGrid"><div className="sectionHeading"><span className="kicker">Pertanyaan umum</span><h2>Yang perlu diketahui sebelum memesan.</h2><p>Pilih bunga favorit Anda, lalu konfirmasi detail dan ketersediaan melalui WhatsApp.</p></div><div className="faqList">{faqs.slice(0, limit).map(([q,a])=><details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div></div></section>;
}
