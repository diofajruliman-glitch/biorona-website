import { formatRupiah } from "@/lib/format";
import { siteConfig } from "@/data/site";

export type FulfillmentMethod = "Pickup" | "Delivery";

export type WhatsAppOrder = {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  color: string;
  occasion: string;
  neededDate: string;
  method: FulfillmentMethod;
  customerName: string;
  recipientName?: string;
  cardMessage?: string;
  notes?: string;
};

export type CustomBouquetRequest = {
  budget: number;
  color: string;
  occasion: string;
  style: "Elegant" | "Romantic" | "Cute" | "Minimalist";
  size: string;
  customerName: string;
  neededDate: string;
  method: FulfillmentMethod;
  cardMessage?: string;
  notes?: string;
};

function getWhatsAppNumber() {
  const number = siteConfig.whatsapp;
  if (!/^\d{8,15}$/.test(number)) {
    throw new Error("NEXT_PUBLIC_WHATSAPP_NUMBER wajib berisi 8–15 digit nomor WhatsApp.");
  }
  return number;
}

export function waUrl(message: string) {
  return `https://wa.me/${getWhatsAppNumber()}?text=${encodeURIComponent(message)}`;
}

export function buildOrderMessage(order: WhatsAppOrder) {
  const quantity = Math.max(1, Math.floor(order.quantity));
  const total = order.unitPrice * quantity;
  const price = quantity > 1
    ? `${formatRupiah(total)} (${formatRupiah(order.unitPrice)} × ${quantity})`
    : formatRupiah(total);

  return [
    "Halo Biorona 🌷",
    "",
    "Saya ingin memesan:",
    "",
    `Kode Produk : ${order.productId}`,
    `Produk : ${order.productName}`,
    `Harga : ${price}`,
    `Jumlah : ${quantity}`,
    `Warna : ${order.color}`,
    `Acara : ${order.occasion}`,
    `Tanggal : ${formatOrderDate(order.neededDate)}`,
    `Metode : ${order.method}`,
    "",
    `Nama Pemesan : ${order.customerName}`,
    `Nama Penerima : ${order.recipientName?.trim() || "-"}`,
    "",
    "Kartu Ucapan:",
    order.cardMessage?.trim() || "-",
    "",
    "Catatan:",
    order.notes?.trim() || "-",
    "",
    "Mohon konfirmasi ketersediaan dan ongkirnya ya.",
  ].join("\n");
}

function formatOrderDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function productInquiryMessage(args: { productId: string; productName: string; price: number }) {
  return [
    "Halo Biorona 🌷",
    "",
    `Saya ingin bertanya tentang ${args.productName} (${args.productId}) dengan harga ${formatRupiah(args.price)}.`,
  ].join("\n");
}

export function buildCustomBouquetMessage(request: CustomBouquetRequest) {
  const budget = `${formatRupiah(request.budget)}${request.budget === 500000 ? "+" : ""}`;

  return [
    "Halo Biorona 🌷",
    "",
    "Saya ingin konsultasi Custom Bouquet:",
    "",
    `Budget : ${budget}`,
    `Warna utama : ${request.color}`,
    `Acara : ${request.occasion}`,
    `Style : ${request.style}`,
    `Ukuran : ${request.size}`,
    `Tanggal : ${formatOrderDate(request.neededDate)}`,
    `Metode : ${request.method}`,
    "",
    `Nama Pemesan : ${request.customerName}`,
    "",
    "Kartu Ucapan:",
    request.cardMessage?.trim() || "-",
    "",
    "Catatan/Referensi:",
    request.notes?.trim() || "-",
    "",
    "Mohon dibantu rekomendasi dan konfirmasi ketersediaannya ya.",
  ].join("\n");
}
