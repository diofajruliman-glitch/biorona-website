import { WhatsAppIcon } from "./Icons";
import { waUrl } from "@/lib/whatsapp";

export default function MobileOrderBar(){return <nav className="mobileOrderBar glassSurface" aria-label="Aksi cepat"><a href="#katalog">Lihat katalog</a><a className="mobileWa" href={waUrl("Halo Biorona 🌷 Saya ingin bertanya tentang produk.")} target="_blank" rel="noreferrer"><WhatsAppIcon size={18}/> WhatsApp</a></nav>}
