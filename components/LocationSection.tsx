import { siteConfig } from "@/data/site";
import { waUrl } from "@/lib/whatsapp";
import { MapPinIcon, WhatsAppIcon } from "./Icons";

export default function LocationSection() {
  return (
    <section className="section locationSection" aria-labelledby="location-title">
      <div className="container">
        <div className="sectionHeading compactHeading">
          <span className="kicker">Lokasi &amp; pengambilan</span>
          <h2 id="location-title">Kunjungi Biorona Florist</h2>
        </div>
        <div className="locationPanel glassSurface">
          <div className="locationMap">
            <iframe
              src={siteConfig.googleMapsEmbedUrl}
              title={`Lokasi ${siteConfig.brand} ${siteConfig.location.city} ${siteConfig.location.region}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              width="800"
              height="520"
            />
          </div>
          <div className="locationCopy">
            <span className="kicker"><MapPinIcon size={16}/> {siteConfig.location.city}, {siteConfig.location.region}</span>
            <h3>{siteConfig.brand}</h3>
            <p>Pickup tersedia di area {siteConfig.location.city}. Delivery ke {siteConfig.location.city}, {siteConfig.location.region}, dan sekitarnya dapat dikonsultasikan sesuai alamat, waktu, dan ketersediaan kurir.</p>
          </div>
          <div className="locationActions">
            {siteConfig.googleMapsUrl && <a className="secondaryGlassButton" href={siteConfig.googleMapsUrl} target="_blank" rel="noreferrer"><MapPinIcon size={18}/> Buka di Google Maps</a>}
            <a className="primaryButton" href={waUrl("Halo Biorona 🌷 Saya ingin menanyakan lokasi pickup atau layanan delivery.")} target="_blank" rel="noreferrer"><WhatsAppIcon size={19}/> Pesan via WhatsApp</a>
          </div>
        </div>
      </div>
    </section>
  );
}
