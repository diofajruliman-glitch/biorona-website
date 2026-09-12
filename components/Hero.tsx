import Image from "next/image";
import { ArrowIcon, SparkleIcon, WhatsAppIcon } from "./Icons";
import { waUrl } from "@/lib/whatsapp";

export default function Hero() {
  return (
    <section className="hero" id="beranda">
      <div className="heroBackdrop" aria-hidden="true" />
      <div className="container heroGrid">
        <div className="heroCopy">
          <div className="eyebrow"><SparkleIcon size={17}/> Biorona Florist • Cibinong, Bogor</div>
          <h1>Toko Bunga Bogor &amp; Florist Cibinong untuk Setiap Momen Spesial</h1>
          <div className="heroDescriptions">
            <p className="heroLead">Biorona Florist adalah toko bunga di Cibinong, Bogor yang menyediakan buket bunga, custom bouquet, standing flower, bunga ucapan, flower box, dan rangkaian bunga untuk wisuda, ulang tahun, anniversary, grand opening, pernikahan, duka cita, dan berbagai momen spesial.</p>
            <p className="heroSupportingCopy">Pilih koleksi Biorona atau konsultasikan desain, warna, ukuran, ucapan, dan budget sesuai kebutuhan. Pemesanan dapat dilakukan langsung melalui WhatsApp tanpa login atau checkout.</p>
          </div>
          <div className="heroCtas">
            <a className="primaryButton" href="#katalog">Lihat Koleksi Bunga <ArrowIcon size={18}/></a>
            <a className="secondaryGlassButton glassSurface" href="#custom"><SparkleIcon size={18}/> Custom Bouquet</a>
            <a className="secondaryGlassButton glassSurface" href={waUrl("Halo Biorona 🌷 Saya ingin konsultasi untuk memilih bunga.")} target="_blank" rel="noreferrer"><WhatsAppIcon size={19}/> Pesan via WhatsApp</a>
          </div>
          <p className="heroKeywords">Buket Bunga <span aria-hidden="true">•</span> Standing Flower <span aria-hidden="true">•</span> Bunga Ucapan <span aria-hidden="true">•</span> Flower Box <span aria-hidden="true">•</span> Custom Bouquet</p>
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
