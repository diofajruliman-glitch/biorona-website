import { ArrowIcon, SparkleIcon, WhatsAppIcon } from "./Icons";
import { waUrl } from "@/lib/whatsapp";

const services = [
  { title: "Buket Bunga", description: "Bouquet untuk wisuda, ulang tahun, anniversary, hadiah, dan berbagai momen spesial." },
  { title: "Standing Flower", description: "Standing flower untuk grand opening, ucapan selamat, pernikahan, duka cita, dan kebutuhan acara." },
  { title: "Bunga Ucapan", description: "Rangkaian bunga ucapan yang dapat disesuaikan dengan pesan dan kebutuhan acara." },
  { title: "Custom Bouquet", description: "Custom bouquet berdasarkan warna, gaya, ukuran, tema, dan budget pelanggan." },
  { title: "Flower Box", description: "Flower box untuk hadiah ulang tahun, anniversary, ucapan selamat, atau kejutan spesial." },
] as const;

export default function LocalFlorist() {
  return (
    <section className="section localFloristSection" id="florist-cibinong" aria-labelledby="local-florist-title">
      <div className="container">
        <div className="localFloristPanel glassSurface">
          <div className="sectionHeading localFloristHeading">
            <span className="kicker"><SparkleIcon size={16} /> Florist Cibinong • Bogor</span>
            <h2 id="local-florist-title">Toko Bunga di Cibinong, Bogor untuk Buket, Standing Flower &amp; Bunga Ucapan</h2>
          </div>
          <div className="localFloristCopy">
            <p>Biorona Florist adalah toko bunga di Cibinong, Bogor yang menyediakan berbagai rangkaian bunga untuk hadiah dan berbagai momen spesial. Mulai dari buket bunga, custom bouquet, flower box, standing flower hingga bunga ucapan dapat dipesan dengan proses yang praktis melalui WhatsApp.</p>
            <p>Kami melayani kebutuhan bunga untuk wisuda, ulang tahun, anniversary, grand opening, pernikahan, ucapan selamat, duka cita, hadiah untuk pasangan, keluarga, sahabat, maupun kebutuhan lainnya. Pelanggan dapat memilih koleksi yang tersedia atau berkonsultasi untuk membuat rangkaian bunga sesuai warna, ukuran, tema, ucapan, dan budget.</p>
            <p>Biorona melayani pickup di Cibinong serta delivery ke area Cibinong, Bogor, dan wilayah sekitar sesuai ketersediaan. Untuk jadwal, ongkir, desain, dan kebutuhan khusus, pelanggan dapat langsung berkonsultasi melalui WhatsApp.</p>
          </div>
          <div className="localServiceGrid" aria-label="Layanan florist Biorona">
            {services.map((service) => (
              <article className="localServiceCard" key={service.title}>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
          <div className="localFloristCtas">
            <a className="primaryButton" href={waUrl("Halo Biorona 🌷 Saya ingin memesan bunga dan berkonsultasi dengan florist Biorona.")} target="_blank" rel="noreferrer">
              <WhatsAppIcon size={19} /> Pesan Bunga via WhatsApp
            </a>
            <a className="secondaryGlassButton" href="#katalog">Lihat Koleksi Biorona <ArrowIcon size={18} /></a>
          </div>
        </div>
      </div>
    </section>
  );
}
