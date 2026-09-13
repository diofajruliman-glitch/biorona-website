import { CheckIcon, ClockIcon, MapPinIcon, WhatsAppIcon } from "./Icons";
import { siteConfig } from "@/data/site";

export default function Trust() {
  const items = [
    [<WhatsAppIcon key="wa" size={22}/>, "Mudah dipesan", "Tidak perlu login. Semua detail diteruskan ke WhatsApp."],
    [<CheckIcon key="check" size={22}/>, "Harga lebih jelas", "Harga dasar terlihat sebelum Anda mulai bertanya."],
    [<ClockIcon key="clock" size={22}/>, "Hemat waktu", "Pilih kebutuhan di website agar chat lebih singkat dan terarah."],
    [<MapPinIcon key="pin" size={22}/>, `Florist lokal ${siteConfig.location.city}`, `Pickup dan delivery untuk ${siteConfig.location.city}, ${siteConfig.location.region}, dan sekitarnya.`],
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

      </div>
    </section>
  );
}
