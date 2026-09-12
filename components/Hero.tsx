import Image from "next/image";
import { ArrowIcon, CheckIcon, SparkleIcon, WhatsAppIcon } from "./Icons";
import { waUrl } from "@/lib/whatsapp";

export default function Hero() {
  return (
    <section className="hero" id="beranda">
      <div className="heroBackdrop" aria-hidden="true" />
      <div className="container heroGrid">
        <div className="heroCopy">
          <div className="eyebrow"><SparkleIcon size={17}/> Florist pilihan untuk momen personal</div>
          <h1>Bunga yang terasa <em>personal</em>, pesan tanpa ribet.</h1>
          <p className="heroLead">Pilih rangkaian, atur kebutuhan, lalu kirim detail pesanan langsung ke WhatsApp Biorona. Tanpa login dan tanpa checkout panjang.</p>
          <div className="heroCtas">
            <a className="primaryButton" href="#katalog">Lihat koleksi <ArrowIcon size={18}/></a>
            <a className="secondaryGlassButton glassSurface" href={waUrl("Halo Biorona 🌷 Saya ingin konsultasi untuk memilih bunga.")} target="_blank" rel="noreferrer"><WhatsAppIcon size={19}/> Konsultasi cepat</a>
          </div>
          <div className="microTrust" aria-label="Keunggulan pemesanan">
            <span><CheckIcon size={16}/> Tanpa akun</span>
            <span><CheckIcon size={16}/> Pesan langsung WA</span>
            <span><CheckIcon size={16}/> Bisa custom</span>
          </div>
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
