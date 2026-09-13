import Image from "next/image";
import { ArrowIcon, SparkleIcon, WhatsAppIcon } from "./Icons";
import { waUrl } from "@/lib/whatsapp";

export default function Hero() {
  return (
    <section className="hero" id="beranda">
      <div className="heroBackdrop" aria-hidden="true" />
      <div className="container heroGrid">
        <div className="heroCopy">
          <div className="sameDayBadge"><span aria-hidden="true">⚡</span> Pesan Hari Ini <span aria-hidden="true">•</span> Kirim Hari Ini</div>
          <div className="eyebrow heroEntrance heroEntranceLocation"><SparkleIcon size={17}/> Biorona Florist • Cibinong, Bogor</div>
          <h1>Toko Bunga Bogor &amp; Florist Cibinong untuk Setiap Momen Spesial</h1>
          <div className="heroDescriptions">
            <p className="heroLead">Pesan buket bunga, standing flower, bunga ucapan, dan rangkaian bunga pilihan dari Biorona. Pesan hari ini dan kirim hari yang sama untuk Cibinong, Bogor, dan sekitarnya.</p>
            <p className="heroSupportingCopy">Pilih koleksi Biorona atau konsultasikan desain, warna, ukuran, ucapan, dan budget sesuai kebutuhan. Pemesanan dapat dilakukan langsung melalui WhatsApp tanpa login atau checkout.</p>
          </div>
          <div className="heroCtas">
            <a className="primaryButton" href="/katalog">Lihat Koleksi Bunga <ArrowIcon size={18}/></a>
            <a className="secondaryGlassButton glassSurface" href="#custom"><SparkleIcon size={18}/> Custom Bouquet</a>
            <a className="secondaryGlassButton glassSurface" href={waUrl("Halo Biorona 🌷 Saya ingin konsultasi untuk memilih bunga.")} target="_blank" rel="noreferrer"><WhatsAppIcon size={19}/> Pesan via WhatsApp</a>
          </div>
          <p className="heroKeywords">Buket Bunga <span aria-hidden="true">•</span> Standing Flower <span aria-hidden="true">•</span> Bunga Ucapan <span aria-hidden="true">•</span> Flower Box <span aria-hidden="true">•</span> Custom Bouquet</p>
          <p className="sameDayNote">Same-Day Delivery <span>•</span> Tergantung ketersediaan produk dan area pengiriman.</p>
        </div>
        <div className="heroVisual">
          <div className="heroImageFrame">
            <Image src="/products/hero-bouquet.jpg" fill sizes="(max-width: 860px) 100vw, 48vw" alt="Bouquet bunga bernuansa pink dari Biorona Florist" priority />
            <div className="imageVeil" />
          </div>
          <div className="heroGlassCard glassSurface heroNote">
            <span className="noteKicker">BIORONA NOTE</span>
            <strong>“Karena hadiah terbaik terasa dibuat khusus untuk seseorang.”</strong>
          </div>
          <div className="heroGlassCard glassSurface heroAvailability">
            <span className="statusDot" />
            <div><strong>Order lebih praktis</strong><small>Konsultasi & konfirmasi via WhatsApp</small></div>
          </div>
        </div>
      </div>
    </section>
  );
}
