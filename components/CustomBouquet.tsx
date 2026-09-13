"use client";

import { useState, type FormEvent } from "react";
import { formatRupiah } from "@/lib/format";
import {
  buildCustomBouquetMessage,
  waUrl,
  type CustomBouquetRequest,
  type FulfillmentMethod,
} from "@/lib/whatsapp";
import { ArrowIcon, SparkleIcon, WhatsAppIcon } from "./Icons";

const budgets = [150000, 250000, 350000, 500000] as const;
const colors = ["Pink", "Putih", "Ungu", "Peach", "Custom"] as const;
const occasions = ["Ulang Tahun", "Wisuda", "Anniversary", "Romantic", "Hadiah", "Lainnya"] as const;
const styles: CustomBouquetRequest["style"][] = ["Elegant", "Romantic", "Cute", "Minimalist"];
const sizes = ["Small", "Medium", "Large"] as const;

export default function CustomBouquet({ variant = "full" }: { variant?: "full" | "cta" }) {
  const [budget, setBudget] = useState<number>(250000);
  const [color, setColor] = useState<string>("Pink");
  const [occasion, setOccasion] = useState<string>("Ulang Tahun");
  const [style, setStyle] = useState<CustomBouquetRequest["style"]>("Elegant");
  const [size, setSize] = useState<string>("Medium");
  const [customerName, setCustomerName] = useState("");
  const [neededDate, setNeededDate] = useState("");
  const [method, setMethod] = useState<FulfillmentMethod>("Pickup");
  const [cardMessage, setCardMessage] = useState("");
  const [notes, setNotes] = useState("");

  function submitConsultation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customerName.trim()) {
      const input = event.currentTarget.elements.namedItem("customCustomerName") as HTMLInputElement;
      input.setCustomValidity("Nama pemesan wajib diisi.");
      input.reportValidity();
      return;
    }

    const message = buildCustomBouquetMessage({
      budget,
      color,
      occasion,
      style,
      size,
      customerName: customerName.trim(),
      neededDate,
      method,
      cardMessage: cardMessage.trim(),
      notes: notes.trim(),
    });

    window.open(waUrl(message), "_blank", "noopener,noreferrer");
  }

  if (variant === "cta") {
    return (
      <section className="section customCtaSection" id="custom" aria-labelledby="custom-cta-title">
        <div className="container">
          <div className="customCta glassSurface">
            <div>
              <span className="kicker"><SparkleIcon size={16} /> Biorona Custom</span>
              <h2 id="custom-cta-title">Punya bunga impian sendiri?</h2>
              <p>Konsultasikan custom bouquet berdasarkan warna, gaya, ukuran, momen, dan budget Anda.</p>
            </div>
            <a className="primaryButton" href={waUrl("Halo Biorona 🌷 Saya ingin konsultasi Custom Bouquet sesuai warna, gaya, dan budget saya.")} target="_blank" rel="noreferrer">
              <WhatsAppIcon size={19} /> Konsultasi Custom Bouquet <ArrowIcon size={17} />
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section customSection" id="custom">
      <div className="container customGrid">
        <div className="customStory">
          <span className="kicker"><SparkleIcon size={16} /> Biorona Custom</span>
          <h2>Tidak menemukan yang pas? Ceritakan versi Anda.</h2>
          <p>Pilih budget, warna, gaya, dan momen. Kami buat percakapan awal jadi ringkas supaya konsultasi di WhatsApp lebih cepat.</p>
          <div className="customSteps">
            <span><b>01</b> Pilih preferensi</span><span><b>02</b> Cek ringkasan</span><span><b>03</b> Konsultasi via WhatsApp</span>
          </div>
        </div>

        <form className="customForm glassSurface" aria-label="Form konsultasi Custom Bouquet" onSubmit={submitConsultation}>
          <div className="formHeader"><span>Custom Bouquet</span><small>* Wajib diisi</small></div>

          <fieldset>
            <legend>Budget *</legend>
            <div className="optionGrid budgetGrid">
              {budgets.map((item) => <button type="button" key={item} className={budget === item ? "selected" : ""} aria-pressed={budget === item} onClick={() => setBudget(item)}>{formatRupiah(item)}{item === 500000 ? "+" : ""}</button>)}
            </div>
          </fieldset>

          <fieldset>
            <legend>Warna utama *</legend>
            <div className="optionGrid">
              {colors.map((item) => <button type="button" key={item} className={color === item ? "selected" : ""} aria-pressed={color === item} onClick={() => setColor(item)}>{item}</button>)}
            </div>
          </fieldset>

          <div className="customCompactGrid">
            <label>Occasion/acara *
              <select required value={occasion} onChange={(event) => setOccasion(event.target.value)}>
                {occasions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label>Tanggal dibutuhkan *
              <input type="date" required value={neededDate} onChange={(event) => setNeededDate(event.target.value)} />
            </label>
          </div>

          <fieldset>
            <legend>Style *</legend>
            <div className="optionGrid">
              {styles.map((item) => <button type="button" key={item} className={style === item ? "selected" : ""} aria-pressed={style === item} onClick={() => setStyle(item)}>{item}</button>)}
            </div>
          </fieldset>

          <fieldset>
            <legend>Ukuran *</legend>
            <div className="optionGrid sizeGrid">
              {sizes.map((item) => <button type="button" key={item} className={size === item ? "selected" : ""} aria-pressed={size === item} onClick={() => setSize(item)}>{item}</button>)}
            </div>
          </fieldset>

          <div className="customCompactGrid">
            <label>Nama pemesan *
              <input name="customCustomerName" type="text" required minLength={2} autoComplete="name" autoCapitalize="words" enterKeyHint="next" value={customerName} onChange={(event) => { event.target.setCustomValidity(""); setCustomerName(event.target.value); }} placeholder="Nama Anda" />
            </label>
            <fieldset className="customMethodFieldset">
              <legend>Metode *</legend>
              <div className="customMethodOptions">
                {(["Pickup", "Delivery"] as const).map((item) => (
                  <label key={item} className={method === item ? "selected" : ""}>
                    <input type="radio" name="customMethod" value={item} checked={method === item} onChange={() => setMethod(item)} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="customOptionalGrid">
            <label>Kartu ucapan <span className="optionalLabel">Opsional</span>
              <textarea enterKeyHint="next" value={cardMessage} onChange={(event) => setCardMessage(event.target.value)} placeholder="Pesan untuk penerima..." rows={3} />
            </label>
            <label>Catatan/referensi <span className="optionalLabel">Opsional</span>
              <textarea enterKeyHint="done" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Warna wrapping, suasana, atau referensi keinginan..." rows={3} />
            </label>
          </div>

          <div className="customSummary" aria-live="polite">
            <span>Ringkasan pilihan</span>
            <strong>{formatRupiah(budget)}{budget === 500000 ? "+" : ""}</strong>
            <p>{color} · {style} · {size}<br />{occasion} · {method}{neededDate ? ` · ${neededDate}` : ""}</p>
          </div>

          <button className="primaryButton fullButton customSubmit" type="submit"><WhatsAppIcon size={19} /> Konsultasikan via WhatsApp <ArrowIcon size={17} /></button>
          <small className="safeNote">Tanpa pembayaran atau checkout. Tim Biorona akan mengonfirmasi desain, ketersediaan, dan detail berikutnya.</small>
        </form>
      </div>
    </section>
  );
}
