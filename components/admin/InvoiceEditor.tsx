"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { formatRupiah } from "@/lib/format";
import { calculateInvoiceTotals, normalizeInvoiceMoney } from "@/lib/invoice-totals";
import { requireAdminSession } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/database.types";
import InvoicePdfActions from "./InvoicePdfActions";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
type InvoiceItem = Database["public"]["Tables"]["invoice_items"]["Row"];
type Product = Database["public"]["Tables"]["products"]["Row"];
type InvoiceSettings = Database["public"]["Tables"]["invoice_settings"]["Row"];
type DraftItem = { key: string; productId: string | null; productName: string; description: string; qty: string; unitPrice: string; };
type FormState = { invoiceDate: string; dueDate: string; customerName: string; customerWhatsapp: string; customerAddress: string; notes: string; discountAmount: string; deliveryFee: string; taxAmount: string; adjustmentAmount: string; };

const today = () => new Date().toLocaleDateString("en-CA");
const emptyForm = (): FormState => ({ invoiceDate: today(), dueDate: "", customerName: "", customerWhatsapp: "", customerAddress: "", notes: "", discountAmount: "0", deliveryFee: "0", taxAmount: "0", adjustmentAmount: "0" });
const newKey = () => crypto.randomUUID();
const customItem = (): DraftItem => ({ key: newKey(), productId: null, productName: "", description: "", qty: "1", unitPrice: "0" });
const asMoney = (value: string) => normalizeInvoiceMoney(value);
const safeMoney = (value: string) => Number.isSafeInteger(asMoney(value)) && asMoney(value) >= 0;
const invoiceError = (reason: unknown, fallback: string) => {
  const value = reason && typeof reason === "object" ? reason as { message?: string; code?: string } : undefined;
  if (value?.code === "42501") return "Akses ditolak. Login ulang dengan akun admin.";
  return value?.message || fallback;
};
function logInvoiceError(error: unknown) {
  const value = error && typeof error === "object" ? error as { code?: string; message?: string; details?: string | null; hint?: string | null } : {};
  console.error("Invoice operation failed", { code: value.code, message: value.message, details: value.details, hint: value.hint });
}

export default function InvoiceEditor({ invoiceId }: { invoiceId?: string }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [items, setItems] = useState<DraftItem[]>([customItem()]);
  const [storedItems, setStoredItems] = useState<InvoiceItem[]>([]);
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogQuery, setCatalogQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { supabase } = await requireAdminSession();
      const productRequest = supabase.from("products").select("*").eq("is_active", true).order("sort_order").order("name");
      if (!invoiceId) {
        const productResult = await productRequest;
        if (productResult.error) throw productResult.error;
        setProducts(productResult.data);
        setInvoice(null);
        setStoredItems([]);
        return;
      }
      const [productResult, invoiceResult, itemResult, settingsResult] = await Promise.all([
        productRequest,
        supabase.from("invoices").select("*").eq("id", invoiceId).single(),
        supabase.from("invoice_items").select("*").eq("invoice_id", invoiceId).order("sort_order"),
        supabase.from("invoice_settings").select("*").maybeSingle(),
      ]);
      if (productResult.error) throw productResult.error;
      if (invoiceResult.error) throw invoiceResult.error;
      if (itemResult.error) throw itemResult.error;
      if (settingsResult.error) throw settingsResult.error;
      const row = invoiceResult.data;
      setProducts(productResult.data);
      setInvoice(row);
      setForm({ invoiceDate: row.invoice_date, dueDate: row.due_date ?? "", customerName: row.customer_name, customerWhatsapp: row.customer_whatsapp, customerAddress: row.customer_address ?? "", notes: row.notes ?? "", discountAmount: String(row.discount_amount), deliveryFee: String(row.delivery_fee), taxAmount: String(row.tax_amount), adjustmentAmount: String(row.adjustment_amount) });
      setItems(itemResult.data.map((item: InvoiceItem) => ({ key: item.id, productId: item.product_id, productName: item.product_name, description: item.description ?? "", qty: String(item.qty), unitPrice: String(item.unit_price) })));
      setStoredItems(itemResult.data);
      setInvoiceSettings(settingsResult.data);
      setPaymentMethod(row.payment_method ?? "");
    } catch (reason) {
      logInvoiceError(reason);
      setError(invoiceError(reason, "Gagal memuat invoice."));
    } finally { setLoading(false); }
  }, [invoiceId]);

  useEffect(() => { void load(); }, [load]);

  const readOnly = !!invoice && invoice.status !== "draft";
  const catalogProducts = useMemo(() => {
    const needle = catalogQuery.trim().toLowerCase();
    return products.filter((product) => !needle || `${product.name} ${product.sku}`.toLowerCase().includes(needle));
  }, [catalogQuery, products]);
  const totals = useMemo(() => calculateInvoiceTotals(items, {
    discountAmount: form.discountAmount,
    deliveryFee: form.deliveryFee,
    taxAmount: form.taxAmount,
    adjustmentAmount: form.adjustmentAmount,
  }), [form.adjustmentAmount, form.discountAmount, form.deliveryFee, form.taxAmount, items]);

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) { setForm((current) => ({ ...current, [key]: value })); }
  function updateItem(key: string, patch: Partial<DraftItem>) { setItems((current) => current.map((item) => item.key === key ? { ...item, ...patch } : item)); }
  function addProduct() {
    const product = products.find((item) => item.id === selectedProductId);
    if (!product) return;
    setItems((current) => [...current, { key: newKey(), productId: product.id, productName: product.name, description: product.short_description || product.description, qty: "1", unitPrice: String(product.price) }]);
    setSelectedProductId("");
  }
  function validate() {
    if (!form.customerName.trim() || !form.customerWhatsapp.trim() || !form.invoiceDate) return "Lengkapi nama pelanggan, WhatsApp, dan tanggal invoice.";
    if (!items.length) return "Tambahkan minimal satu item.";
    if (!safeMoney(form.discountAmount) || !safeMoney(form.deliveryFee) || !safeMoney(form.taxAmount) || !safeMoney(form.adjustmentAmount)) return "Diskon, ongkir, pajak, dan penyesuaian harus berupa Rupiah bulat nol atau lebih.";
    if (totals.discountAmount > totals.subtotal) return "Diskon tidak boleh lebih besar dari subtotal.";
    for (const item of items) {
      if (!item.productName.trim() || !Number.isSafeInteger(asMoney(item.qty)) || asMoney(item.qty) <= 0 || !safeMoney(item.unitPrice)) return "Setiap item wajib memiliki nama, jumlah bulat positif, dan harga Rupiah bulat.";
    }
    const expectedGrandTotal = totals.subtotal + totals.deliveryFee + totals.taxAmount + totals.adjustmentAmount - totals.discountAmount;
    if (totals.grandTotal !== expectedGrandTotal) return `Rincian total tidak cocok: subtotal ${formatRupiah(totals.subtotal)}, diskon ${formatRupiah(totals.discountAmount)}, ongkir ${formatRupiah(totals.deliveryFee)}, pajak ${formatRupiah(totals.taxAmount)}, grand_total ${formatRupiah(totals.grandTotal)}.`;
    return "";
  }
  function rpcItems(): Json {
    return items.map((item, index) => ({ product_id: item.productId, product_name: item.productName.trim(), description: item.description.trim() || null, qty: asMoney(item.qty), unit_price: asMoney(item.unitPrice), sort_order: index }));
  }
  async function save(event: FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    const validation = validate(); if (validation) { setError(validation); return; }
    setSaving(true);
    try {
      const { supabase } = await requireAdminSession();
      const args = { p_invoice_date: form.invoiceDate, p_due_date: form.dueDate || null, p_customer_name: form.customerName.trim(), p_customer_whatsapp: form.customerWhatsapp.trim(), p_customer_address: form.customerAddress.trim() || null, p_discount_amount: totals.discountAmount, p_delivery_fee: totals.deliveryFee, p_tax_amount: totals.taxAmount, p_adjustment_amount: totals.adjustmentAmount, p_notes: form.notes.trim() || null, p_items: rpcItems() };
      const result = invoiceId && invoice?.status === "draft"
        ? await supabase.rpc("update_invoice_draft", { p_invoice_id: invoiceId, ...args })
        : await supabase.rpc("create_invoice", args);
      if (result.error) throw result.error;
      const created = result.data?.[0];
      if (!created) throw new Error("Server tidak mengembalikan invoice yang disimpan.");
      setMessage(`Invoice ${created.invoice_number} berhasil disimpan. Total final: ${formatRupiah(created.grand_total)}.`);
      if (!invoiceId) window.setTimeout(() => window.location.assign(`/admin/invoices/${created.id}/edit/`), 700);
      else await load();
    } catch (reason) { logInvoiceError(reason); setError(invoiceError(reason, "Gagal menyimpan invoice.")); }
    finally { setSaving(false); }
  }
  async function issue() {
    if (!invoiceId || !window.confirm("Terbitkan invoice ini? Setelah diterbitkan, item dan harga tidak dapat diedit.")) return;
    setSaving(true); setError(""); setMessage("");
    try { const { supabase } = await requireAdminSession(); const result = await supabase.rpc("issue_invoice", { p_invoice_id: invoiceId }); if (result.error) throw result.error; setMessage("Invoice berhasil diterbitkan."); await load(); }
    catch (reason) { logInvoiceError(reason); setError(invoiceError(reason, "Gagal menerbitkan invoice.")); } finally { setSaving(false); }
  }
  async function cancel() {
    if (!invoiceId || !window.confirm("Batalkan invoice ini? Invoice tetap tersimpan dalam histori.")) return;
    setSaving(true); setError(""); setMessage("");
    try { const { supabase } = await requireAdminSession(); const result = await supabase.rpc("cancel_invoice", { p_invoice_id: invoiceId }); if (result.error) throw result.error; setMessage("Invoice dibatalkan."); await load(); }
    catch (reason) { logInvoiceError(reason); setError(invoiceError(reason, "Gagal membatalkan invoice.")); } finally { setSaving(false); }
  }
  async function markPaid() {
    if (!invoiceId) return;
    setSaving(true); setError(""); setMessage("");
    try { const { supabase } = await requireAdminSession(); const result = await supabase.rpc("mark_invoice_paid", { p_invoice_id: invoiceId, p_payment_method: paymentMethod || null }); if (result.error) throw result.error; setMessage("Pembayaran invoice berhasil dicatat."); await load(); }
    catch (reason) { logInvoiceError(reason); setError(invoiceError(reason, "Gagal mencatat pembayaran.")); } finally { setSaving(false); }
  }

  if (loading) return <div className="adminState" role="status">Memuat invoice…</div>;
  if (error && invoiceId && !invoice) return <div className="adminState adminError" role="alert">{error}</div>;

  return <>
    <header className="adminPageHeader"><div><span className="adminEyebrow">{invoice ? invoice.invoice_number : "Pesanan WhatsApp"}</span><h1>{invoice ? "Detail Invoice" : "Buat Invoice"}</h1></div><Link className="adminActionsLink" href="/admin/invoices/">Kembali ke invoice</Link></header>
    {message && <p className="adminNotice" role="status">{message}</p>}{error && <p className="adminNotice adminError" role="alert">{error}</p>}
    {invoice && <section className="invoiceMeta"><span className={`adminStatus invoiceStatus ${invoice.status}`}>{invoice.status === "draft" ? "Draft" : invoice.status === "issued" ? "Terbit" : "Batal"}</span><span className={`adminStatus paymentStatus ${invoice.payment_status}`}>{invoice.payment_status === "paid" ? "Dibayar" : "Belum Dibayar"}</span>{invoice.paid_at && <small>Dibayar: {new Date(invoice.paid_at).toLocaleString("id-ID")}{invoice.payment_method ? ` · ${invoice.payment_method}` : ""}</small>}</section>}
    <form className="adminForm invoiceForm" onSubmit={save}>
      <section><h2>Data pelanggan</h2><div className="adminFormGrid"><label>Nama pelanggan *<input disabled={readOnly} value={form.customerName} onChange={(event) => updateForm("customerName", event.target.value)} required /></label><label>Nomor WhatsApp *<input disabled={readOnly} value={form.customerWhatsapp} onChange={(event) => updateForm("customerWhatsapp", event.target.value)} required /></label><label>Tanggal invoice *<input disabled={readOnly} type="date" value={form.invoiceDate} onChange={(event) => updateForm("invoiceDate", event.target.value)} required /></label><label>Jatuh tempo<input disabled={readOnly} type="date" value={form.dueDate} onChange={(event) => updateForm("dueDate", event.target.value)} /></label></div><label>Alamat<textarea disabled={readOnly} value={form.customerAddress} onChange={(event) => updateForm("customerAddress", event.target.value)} rows={3}/></label><label>Catatan<textarea disabled={readOnly} value={form.notes} onChange={(event) => updateForm("notes", event.target.value)} rows={3}/></label></section>
      <section><h2>Item invoice</h2>{!readOnly && <div className="invoiceCatalog"><input value={catalogQuery} onChange={(event) => setCatalogQuery(event.target.value)} placeholder="Cari produk aktif…" aria-label="Cari produk aktif"/><select value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)} aria-label="Pilih produk katalog"><option value="">Pilih produk katalog</option>{catalogProducts.map((product) => <option key={product.id} value={product.id}>{product.name} — {formatRupiah(product.price)}</option>)}</select><button type="button" onClick={addProduct} disabled={!selectedProductId}>Tambah produk</button><button type="button" onClick={() => setItems((current) => [...current, customItem()])}>+ Tambah Item Custom</button></div>}
        <div className="invoiceItems">{items.map((item, index) => <article key={item.key} className="invoiceItem"><div className="invoiceItemHeader"><strong>{item.productId ? "Produk katalog (snapshot)" : "Item custom"}</strong>{!readOnly && <button className="danger" type="button" onClick={() => setItems((current) => current.filter((entry) => entry.key !== item.key))} disabled={items.length === 1}>Hapus</button>}</div><div className="adminFormGrid"><label>Nama item *<input disabled={readOnly} value={item.productName} onChange={(event) => updateItem(item.key, { productName: event.target.value })} /></label><label>Jumlah *<input disabled={readOnly} type="number" min="1" step="1" inputMode="numeric" value={item.qty} onChange={(event) => updateItem(item.key, { qty: event.target.value })} /></label><label>Harga satuan *<input disabled={readOnly} type="number" min="0" step="1" inputMode="numeric" value={item.unitPrice} onChange={(event) => updateItem(item.key, { unitPrice: event.target.value })} /></label><label>Jumlah baris<output>{formatRupiah(Number.isInteger(asMoney(item.qty)) && asMoney(item.qty) > 0 && safeMoney(item.unitPrice) ? asMoney(item.qty) * asMoney(item.unitPrice) : 0)}</output></label></div><label>Deskripsi<textarea disabled={readOnly} value={item.description} onChange={(event) => updateItem(item.key, { description: event.target.value })} rows={2}/></label>{index > 0 && <small>Urutan item: {index + 1}</small>}</article>)}</div>
      </section>
      <section><h2>Biaya dan total</h2><div className="adminFormGrid"><label>Diskon<input disabled={readOnly} type="number" min="0" step="1" inputMode="numeric" value={form.discountAmount} onChange={(event) => updateForm("discountAmount", event.target.value)} /></label><label>Ongkir<input disabled={readOnly} type="number" min="0" step="1" inputMode="numeric" value={form.deliveryFee} onChange={(event) => updateForm("deliveryFee", event.target.value)} /></label><label>Pajak<input disabled={readOnly} type="number" min="0" step="1" inputMode="numeric" value={form.taxAmount} onChange={(event) => updateForm("taxAmount", event.target.value)} /></label><label>Penyesuaian<input disabled={readOnly} type="number" min="0" step="1" inputMode="numeric" value={form.adjustmentAmount} onChange={(event) => updateForm("adjustmentAmount", event.target.value)} /></label></div><div className="invoiceTotals"><span>Subtotal<strong>{formatRupiah(totals.subtotal)}</strong></span><span>Diskon<strong>− {formatRupiah(totals.discountAmount)}</strong></span><span>Ongkir<strong>{formatRupiah(totals.deliveryFee)}</strong></span><span>Pajak<strong>{formatRupiah(totals.taxAmount)}</strong></span><span>Penyesuaian<strong>{formatRupiah(totals.adjustmentAmount)}</strong></span><span className="grand">Grand Total<strong>{formatRupiah(totals.grandTotal)}</strong></span>{invoice && <small>Total final database: {formatRupiah(invoice.grand_total)}</small>}</div></section>
      {!readOnly && <button className="adminPrimary adminSubmit" disabled={saving} type="submit">{saving ? "Menyimpan…" : invoice ? "Simpan Draft" : "Simpan Draft"}</button>}
    </form>
    {invoice?.status === "draft" && <section className="invoiceOperations"><button className="adminPrimary" type="button" onClick={issue} disabled={saving}>Terbitkan Invoice</button><button className="danger" type="button" onClick={cancel} disabled={saving}>Batalkan Invoice</button></section>}
    {invoice?.status === "issued" && <section className="invoiceOperations">{invoice.payment_status === "unpaid" && <><label>Metode pembayaran<select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}><option value="">Pilih metode</option><option>Transfer Bank</option><option>QRIS</option><option>Cash</option><option>Lainnya</option></select></label><button className="adminPrimary" type="button" onClick={markPaid} disabled={saving}>Tandai Dibayar</button></>}<button className="danger" type="button" onClick={cancel} disabled={saving}>Batalkan Invoice</button></section>}
    {invoice && (
      <InvoicePdfActions
        invoice={{ id: invoice.id, invoiceNumber: invoice.invoice_number, invoiceDate: invoice.invoice_date, dueDate: invoice.due_date, customerName: invoice.customer_name, customerWhatsapp: invoice.customer_whatsapp, customerAddress: invoice.customer_address, status: invoice.status, paymentStatus: invoice.payment_status, paymentMethod: invoice.payment_method, paidAt: invoice.paid_at, notes: invoice.notes, subtotal: invoice.subtotal, discount_amount: invoice.discount_amount, delivery_fee: invoice.delivery_fee, tax_amount: invoice.tax_amount, adjustment_amount: invoice.adjustment_amount, grand_total: invoice.grand_total }}
        items={storedItems.map((item) => ({ id: item.id, name: item.product_name, description: item.description, quantity: item.qty, unit_price: item.unit_price, total_price: item.line_total }))}
        settings={invoiceSettings ? { businessName: invoiceSettings.business_name, businessAddress: invoiceSettings.business_address, businessWhatsapp: invoiceSettings.business_whatsapp, businessEmail: invoiceSettings.business_email, bankName: invoiceSettings.bank_name, bankAccountNumber: invoiceSettings.bank_account_number, bankAccountName: invoiceSettings.bank_account_name, paymentNote: invoiceSettings.payment_note, footerNote: invoiceSettings.footer_note } : null}
      />
    )}
  </>;
}
