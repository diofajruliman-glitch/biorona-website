"use client";

import { useState, type FormEvent } from "react";
import type { Product } from "@/data/products";
import { formatRupiah } from "@/lib/format";
import { buildOrderMessage, waUrl, type FulfillmentMethod } from "@/lib/whatsapp";
import { ArrowIcon, WhatsAppIcon } from "./Icons";

export default function ProductOrderForm({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState("1");
  const [color, setColor] = useState(product.colors[0] || "Custom");
  const [occasion, setOccasion] = useState(product.occasions[0] || "Lainnya");
  const [customerName, setCustomerName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [cardMessage, setCardMessage] = useState("");
  const [neededDate, setNeededDate] = useState("");
  const [method, setMethod] = useState<FulfillmentMethod>("Pickup");
  const [notes, setNotes] = useState("");

  const parsedQuantity = Number(quantity);
  const safeQuantity = Number.isFinite(parsedQuantity) ? Math.min(99, Math.max(1, Math.floor(parsedQuantity))) : 1;
  const total = product.price * safeQuantity;

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product.available) return;
    if (!customerName.trim()) {
      const input = event.currentTarget.elements.namedItem("customerName") as HTMLInputElement;
      input.setCustomValidity("Nama pemesan wajib diisi.");
      input.reportValidity();
      return;
    }

    const message = buildOrderMessage({
      productId: product.id,
      productName: product.name,
      unitPrice: product.price,
      quantity: safeQuantity,
      color,
      occasion,
      customerName: customerName.trim(),
      recipientName: recipientName.trim(),
      cardMessage: cardMessage.trim(),
      neededDate,
      method,
      notes: notes.trim(),
    });

    window.open(waUrl(message), "_blank", "noopener,noreferrer");
  }

  if (!product.available) {
    return <div className="orderUnavailable glassSurface"><strong>Produk belum tersedia untuk dipesan.</strong><span>Silakan pilih produk lain dari katalog Biorona.</span></div>;
  }

  return (
    <>
      <form id="productOrderForm" className="productOrderForm glassSurface" aria-label={`Form pemesanan ${product.name}`} onSubmit={submitOrder}>
        <div className="orderFormHeader">
          <div><span className="kicker">Detail pesanan</span><h2>Pesan via WhatsApp</h2></div>
          <small>* Wajib diisi</small>
        </div>

        <div className="orderFormGrid">
          <label>Jumlah *
            <input type="number" inputMode="numeric" min={1} max={99} required value={quantity} onChange={(event) => setQuantity(event.target.value)} />
          </label>
          <label>Warna/tema *
            <select required value={color} onChange={(event) => setColor(event.target.value)}>
              {product.colors.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>Occasion/acara *
            <select required value={occasion} onChange={(event) => setOccasion(event.target.value)}>
              {product.occasions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>Tanggal dibutuhkan *
            <input type="date" required value={neededDate} onChange={(event) => setNeededDate(event.target.value)} />
          </label>
          <label>Nama pemesan *
            <input name="customerName" type="text" required minLength={2} autoComplete="name" autoCapitalize="words" enterKeyHint="next" value={customerName} onChange={(event) => { event.target.setCustomValidity(""); setCustomerName(event.target.value); }} placeholder="Nama Anda" />
          </label>
          <label>Nama penerima <span className="optionalLabel">Opsional</span>
            <input type="text" autoCapitalize="words" enterKeyHint="next" value={recipientName} onChange={(event) => setRecipientName(event.target.value)} placeholder="Nama penerima" />
          </label>
        </div>

        <fieldset className="methodFieldset">
          <legend>Metode *</legend>
          <div className="methodOptions">
            {(["Pickup", "Delivery"] as const).map((item) => (
              <label key={item} className={method === item ? "selected" : ""}>
                <input type="radio" name="method" value={item} checked={method === item} onChange={() => setMethod(item)} />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label>Kartu ucapan <span className="optionalLabel">Opsional</span>
          <textarea rows={3} enterKeyHint="next" value={cardMessage} onChange={(event) => setCardMessage(event.target.value)} placeholder="Tulis pesan yang ingin disertakan..." />
        </label>
        <label>Catatan tambahan <span className="optionalLabel">Opsional</span>
          <textarea rows={3} enterKeyHint="done" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Contoh: warna wrapping, patokan alamat, atau permintaan khusus..." />
        </label>

        <div className="orderTotal" aria-live="polite">
          <span>Total</span><strong>{formatRupiah(total)}</strong><small>{formatRupiah(product.price)} × {safeQuantity}</small>
        </div>
        <button className="primaryButton fullButton orderSubmit" type="submit">
          <WhatsAppIcon size={20} /> Kirim pesanan ke WhatsApp <ArrowIcon size={18} />
        </button>
        <small className="safeNote">Tanpa akun dan tanpa checkout. Pesanan baru diproses setelah dikonfirmasi oleh Biorona.</small>
      </form>

      <div className="mobileOrderBar productOrderBar glassSurface" role="region" aria-label="Pesan produk">
        <span><small>Total</small><strong>{formatRupiah(total)}</strong></span>
        <button className="mobileWa" type="submit" form="productOrderForm"><WhatsAppIcon size={18} /> Pesan</button>
      </div>
    </>
  );
}
