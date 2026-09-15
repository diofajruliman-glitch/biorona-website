import assert from "node:assert/strict";
import test from "node:test";
import { calculateInvoiceTotals } from "../lib/invoice-totals.ts";

test("menghitung subtotal dari seluruh item tanpa diskon", () => {
  assert.deepEqual(calculateInvoiceTotals(
    [{ qty: 2, unitPrice: 12500 }, { qty: 1, unitPrice: 5000 }],
    { discountAmount: null, deliveryFee: null, taxAmount: null, adjustmentAmount: null },
  ), { subtotal: 30000, discountAmount: 0, deliveryFee: 0, taxAmount: 0, adjustmentAmount: 0, grandTotal: 30000 });
});

test("menghitung diskon, ongkir, pajak, dan penyesuaian dengan rumus database", () => {
  assert.deepEqual(calculateInvoiceTotals(
    [{ qty: 2, unitPrice: 12500 }, { qty: 1, unitPrice: 5000 }],
    { discountAmount: 2500, deliveryFee: 10000, taxAmount: 1500, adjustmentAmount: 500 },
  ), { subtotal: 30000, discountAmount: 2500, deliveryFee: 10000, taxAmount: 1500, adjustmentAmount: 500, grandTotal: 39500 });
});

test("membulatkan uang dan mengubah null menjadi nol", () => {
  assert.deepEqual(calculateInvoiceTotals(
    [{ qty: "2.4", unitPrice: "1000.6" }],
    { discountAmount: "10.5", deliveryFee: null, taxAmount: undefined, adjustmentAmount: "bad" },
  ), { subtotal: 2002, discountAmount: 11, deliveryFee: 0, taxAmount: 0, adjustmentAmount: 0, grandTotal: 1991 });
});