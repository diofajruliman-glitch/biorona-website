import { CheckIcon, ClockIcon, MapPinIcon, WhatsAppIcon } from "./Icons";
import { siteConfig } from "@/data/site";
import { testimonials } from "@/data/testimonials";
import { waUrl } from "@/lib/whatsapp";

export default function Trust() {
  const items = [
    [<WhatsAppIcon key="wa" size={22}/>, "Mudah dipesan", "Tidak perlu login. Semua detail diteruskan ke WhatsApp."],
    [<CheckIcon key="check" size={22}/>, "Harga lebih jelas", "Harga dasar terlihat sebelum Anda mulai bertanya."],
    [<ClockIcon key="clock" size={22}/>, "Hemat waktu", "Pilih kebutuhan di website agar chat lebih singkat dan terarah."],
    [<MapPinIcon key="pin" size={22}/>, `${siteConfig.shortBrand} ${siteConfig.location.city}`, `Florist lokal untuk pelanggan di ${siteConfig.location.city} dan ${siteConfig.location.region}.`],
  ];
  return (
    <section className="section trustSection" id="tentang" aria-labelledby="trust-title">
      <div className="container">
        <div className="sectionHeading compactHeading">
          <span className="kicker">Kenapa Biorona</span>
          <h2 id="trust-title">Jelas sebelum pesan, personal saat dikonfirmasi.</h2>
        </div>
        <div className="trustGrid">
          {items.map(([icon,title,desc])=><div className="trustItem" key={String(title)}><span className="trustIcon glassSurface">{icon}</span><div><strong>{title}</strong><p>{desc}</p></div></div>)}
        </div>

        <div className="serviceInfoGrid">
          <article className="serviceInfo">
            <span className="kicker">Pickup / Delivery</span>
            <h3>Pilih cara menerima pesanan.</h3>
            <p>Pickup tersedia di area {siteConfig.location.city}. Delivery dan ongkir dikonfirmasi melalui WhatsApp sesuai alamat dan waktu pengiriman.</p>
            <a href={waUrl("Halo Biorona 🌷 Saya ingin menanyakan opsi Pickup atau Delivery.")} target="_blank" rel="noreferrer">Konfirmasi area via WhatsApp</a>
          </article>
          <article className="serviceInfo mapInfo">
            <div className="mapCopy">
              <span className="kicker">Lokasi</span>
              <h3>Biorona Florist, {siteConfig.location.city}</h3>
              <p>Lihat pin lokasi pickup dan buka petunjuk arah langsung melalui Google Maps.</p>
            </div>
            <div className="mapEmbed">
              <iframe
                src={siteConfig.googleMapsEmbedUrl}
                title={`Peta lokasi ${siteConfig.brand}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            {siteConfig.googleMapsUrl && (
              <a href={siteConfig.googleMapsUrl} target="_blank" rel="noreferrer">
                <MapPinIcon size={18}/> Buka Google Maps
              </a>
            )}
          </article>
          <article className="serviceInfo socialInfo">
            <span className="kicker">Inspirasi & karya</span>
            <h3>Ikuti perjalanan Biorona.</h3>
            <p>Lihat koleksi, detail bunga, dan inspirasi hadiah terbaru melalui kanal Instagram resmi.</p>
            {siteConfig.instagram
              ? <a href={siteConfig.instagram} target="_blank" rel="noreferrer">Lihat Instagram Biorona</a>
              : <span className="pendingLabel">Instagram resmi belum dikonfigurasi</span>}
          </article>
        </div>

        <div className="testimonialBlock" aria-labelledby="testimonial-title">
          <div><span className="kicker">Cerita pelanggan</span><h3 id="testimonial-title">Pengalaman nyata, tanpa ulasan rekaan.</h3></div>
          {testimonials.length > 0 ? (
            <div className="testimonialList">{testimonials.map((item) => <figure key={item.id}><blockquote>{item.quote}</blockquote><figcaption>{item.customerName}{item.occasion ? ` · ${item.occasion}` : ""}</figcaption></figure>)}</div>
          ) : (
            <p className="testimonialPlaceholder">Belum ada testimonial terverifikasi yang dipublikasikan. Bagian ini disiapkan untuk ulasan asli setelah izin pelanggan diperoleh.</p>
          )}
        </div>
      </div>
    </section>
  );
}
