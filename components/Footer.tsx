import Logo from "./Logo";
import { siteConfig } from "@/data/site";
import { waUrl } from "@/lib/whatsapp";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footerGrid">
        <div><Logo /><p>{siteConfig.tagline} Katalog modern, pemesanan tetap personal lewat WhatsApp.</p></div>
        <div><strong>Jelajahi</strong><a href="/katalog">Katalog bunga</a><a href="/toko-bunga-bogor/">Toko Bunga Bogor</a><a href="/toko-bunga-cibinong/">Toko Bunga Cibinong</a><a href="/#custom">Custom Bouquet</a><a href="/#faq">FAQ</a></div>
        <div>
          <strong>Hubungi</strong>
          <a href={waUrl("Halo Biorona 🌷 Saya ingin bertanya.")} target="_blank" rel="noreferrer">WhatsApp</a>
          {siteConfig.instagram && <a href={siteConfig.instagram} target="_blank" rel="noreferrer">Instagram</a>}
          <span>{siteConfig.location.city}, {siteConfig.location.region}</span>
        </div>
      </div>
      <div className="container footerBottom"><span>© {new Date().getFullYear()} {siteConfig.brand}. - Diocode</span><span>Ingat Bunga? Ingat Biorona</span></div>
    </footer>
  );
}
