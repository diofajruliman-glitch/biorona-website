export type PdfInvoiceMoney = number | string | bigint | null | undefined;

export type PdfInvoiceData = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  customerName: string;
  customerWhatsapp: string;
  customerAddress: string | null;
  status: "draft" | "issued" | "cancelled";
  paymentStatus: "unpaid" | "paid";
  paymentMethod: string | null;
  paidAt: string | null;
  notes: string | null;
  subtotal: number;
  discount_amount: number;
  delivery_fee: number;
  tax_amount: number;
  adjustment_amount: number;
  grand_total: number;
};

export type PdfInvoiceItem = {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export type PdfInvoiceSettings = {
  businessName: string;
  businessAddress: string | null;
  businessWhatsapp: string | null;
  businessEmail: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  paymentNote: string | null;
  footerNote: string | null;
};

const text = (value: unknown) => value == null ? "" : String(value);

export function normalizePdfMoney(value: unknown): number {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) throw new Error(`Nilai uang PDF tidak valid: ${text(value)}`);
  return Math.round(numeric);
}

function nullableText(value: unknown): string | null {
  const result = text(value).trim();
  return result || null;
}

function validDateText(value: unknown, field: string, required: boolean): string | null {
  const result = text(value).trim();
  if (!result) {
    if (required) throw new Error(`${field} invoice tidak tersedia.`);
    return null;
  }
  const parsed = new Date(result.includes("T") ? result : `${result}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) throw new Error(`${field} invoice tidak valid.`);
  return result;
}

export function normalizePdfInvoice(raw: Record<string, unknown>): PdfInvoiceData {
  const id = text(raw.id).trim();
  const invoiceNumber = text(raw.invoiceNumber ?? raw.invoice_number).trim();
  const customerName = text(raw.customerName ?? raw.customer_name).trim();
  if (!id || !invoiceNumber || !customerName) throw new Error("Data invoice belum lengkap untuk dibuatkan PDF.");
  const status = raw.status;
  const paymentStatus = raw.paymentStatus ?? raw.payment_status;
  if (status !== "draft" && status !== "issued" && status !== "cancelled") throw new Error("Status invoice tidak valid.");
  if (paymentStatus !== "unpaid" && paymentStatus !== "paid") throw new Error("Status pembayaran invoice tidak valid.");

  return {
    id,
    invoiceNumber,
    invoiceDate: validDateText(raw.invoiceDate ?? raw.invoice_date, "Tanggal", true) as string,
    dueDate: validDateText(raw.dueDate ?? raw.due_date, "Jatuh tempo", false),
    customerName,
    customerWhatsapp: text(raw.customerWhatsapp ?? raw.customer_whatsapp).trim(),
    customerAddress: nullableText(raw.customerAddress ?? raw.customer_address),
    status,
    paymentStatus,
    paymentMethod: nullableText(raw.paymentMethod ?? raw.payment_method),
    paidAt: raw.paidAt ?? raw.paid_at ? validDateText(raw.paidAt ?? raw.paid_at, "Waktu pembayaran", false) : null,
    notes: nullableText(raw.notes),
    subtotal: normalizePdfMoney(raw.subtotal),
    discount_amount: normalizePdfMoney(raw.discount_amount ?? raw.discount),
    delivery_fee: normalizePdfMoney(raw.delivery_fee ?? raw.deliveryFee),
    tax_amount: normalizePdfMoney(raw.tax_amount ?? raw.taxAmount),
    adjustment_amount: normalizePdfMoney(raw.adjustment_amount ?? raw.adjustmentAmount ?? raw.other_fee),
    grand_total: normalizePdfMoney(raw.grand_total ?? raw.grandTotal),
  };
}

export function normalizePdfItems(rawItems: unknown): PdfInvoiceItem[] {
  if (!Array.isArray(rawItems) || rawItems.length === 0) throw new Error("Item invoice belum selesai dimuat.");
  return rawItems.map((raw, index) => {
    if (!raw || typeof raw !== "object") throw new Error(`Item invoice ke-${index + 1} tidak valid.`);
    const value = raw as Record<string, unknown>;
    const name = text(value.name ?? value.productName ?? value.product_name).trim();
    const quantity = normalizePdfMoney(value.quantity ?? value.qty);
    const unit_price = normalizePdfMoney(value.unit_price ?? value.unitPrice);
    if (!name || !Number.isSafeInteger(quantity) || quantity <= 0 || !Number.isSafeInteger(unit_price) || unit_price < 0) {
      throw new Error(`Item invoice ke-${index + 1} memiliki data harga atau jumlah yang tidak valid.`);
    }
    return {
      id: text(value.id).trim() || `item-${index + 1}`,
      name,
      description: nullableText(value.description),
      quantity,
      unit_price,
      total_price: normalizePdfMoney(value.total_price ?? value.lineTotal ?? value.line_total ?? quantity * unit_price),
    };
  });
}

export function normalizePdfSettings(raw: Record<string, unknown> | null | undefined): PdfInvoiceSettings | null {
  if (!raw) return null;
  return {
    businessName: text(raw.businessName ?? raw.business_name).trim() || "Biorona Florist",
    businessAddress: nullableText(raw.businessAddress ?? raw.business_address),
    businessWhatsapp: nullableText(raw.businessWhatsapp ?? raw.business_whatsapp),
    businessEmail: nullableText(raw.businessEmail ?? raw.business_email),
    bankName: nullableText(raw.bankName ?? raw.bank_name),
    bankAccountNumber: nullableText(raw.bankAccountNumber ?? raw.bank_account_number),
    bankAccountName: nullableText(raw.bankAccountName ?? raw.bank_account_name),
    paymentNote: nullableText(raw.paymentNote ?? raw.payment_note),
    footerNote: nullableText(raw.footerNote ?? raw.footer_note),
  };
}