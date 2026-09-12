import { ArrowIcon, CheckIcon, WhatsAppIcon } from "./Icons";
import { waUrl } from "@/lib/whatsapp";

const steps = [
  { number: "01", title: "Pilih bunga", description: "Temukan produk dari katalog atau mulai dari Custom Bouquet." },
  { number: "02", title: "Tentukan detail", description: "Isi jumlah, warna, acara, tanggal, dan metode penerimaan." },
  { number: "03", title: "Chat WhatsApp", description: "Kirim ringkasan pesanan untuk konfirmasi stok dan ongkir." },
];

export default function HowToOrder() {
  return (
    <section className="section orderStepsSection" aria-labelledby="order-steps-title">
      <div className="container">
        <div className="sectionHeading compactHeading">
          <span className="kicker">Cara pesan</span>
          <h2 id="order-steps-title">Tiga langkah, langsung terhubung.</h2>
        </div>
        <ol className="orderSteps">
          {steps.map((step, index) => (
            <li key={step.number}>
              <span className="stepNumber" aria-hidden="true">{step.number}</span>
              <div><strong>{step.title}</strong><p>{step.description}</p></div>
              {index < steps.length - 1 && <ArrowIcon className="stepArrow" size={20} />}
            </li>
          ))}
        </ol>
        <a className="waButton orderStepsCta" href={waUrl("Halo Biorona 🌷 Saya ingin mulai memesan bunga.")} target="_blank" rel="noreferrer">
          <WhatsAppIcon size={19} /> Mulai pesan via WhatsApp <CheckIcon size={18} />
        </a>
      </div>
    </section>
  );
}
