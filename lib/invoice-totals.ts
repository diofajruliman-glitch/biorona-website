export type InvoiceMoneyInput = number | string | null | undefined;

export type InvoiceTotalItem = { qty: InvoiceMoneyInput; unitPrice: InvoiceMoneyInput };

export type InvoiceTotals = {
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  taxAmount: number;
  adjustmentAmount: number;
  grandTotal: number;
};

export type InvoiceTotalComponents = {
  discountAmount: InvoiceMoneyInput;
  deliveryFee: InvoiceMoneyInput;
  taxAmount: InvoiceMoneyInput;
  adjustmentAmount: InvoiceMoneyInput;
};

export function normalizeInvoiceMoney(value: InvoiceMoneyInput): number {
  const numeric = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(numeric) ? Math.round(numeric) : 0;
}

export function calculateInvoiceTotals(
  items: InvoiceTotalItem[],
  components: InvoiceTotalComponents,
): InvoiceTotals {
  const subtotal = items.reduce(
    (sum, item) => sum + normalizeInvoiceMoney(item.qty) * normalizeInvoiceMoney(item.unitPrice),
    0,
  );
  const discountAmount = normalizeInvoiceMoney(components.discountAmount);
  const deliveryFee = normalizeInvoiceMoney(components.deliveryFee);
  const taxAmount = normalizeInvoiceMoney(components.taxAmount);
  const adjustmentAmount = normalizeInvoiceMoney(components.adjustmentAmount);

  return {
    subtotal,
    discountAmount,
    deliveryFee,
    taxAmount,
    adjustmentAmount,
    grandTotal: subtotal + deliveryFee + taxAmount + adjustmentAmount - discountAmount,
  };
}