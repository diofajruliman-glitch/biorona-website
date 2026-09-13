"use client";

import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { useMemo, useState } from "react";
import { invoiceWhatsAppUrl, normalizeWhatsAppNumber } from "@/lib/whatsapp";
import InvoicePdfDocument, { type InvoicePdfData, type InvoicePdfItem, type InvoicePdfSettings } from "./InvoicePdfDocument";
import styles from "./InvoicePdfActions.module.css";

export default function InvoicePdfActions({ invoice, items, settings }: { invoice: InvoicePdfData; items: InvoicePdfItem[]; settings: InvoicePdfSettings }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const logoSrc = useMemo(() => `${window.location.origin}/brand/biorona-logo.png`, []);
  const document = <InvoicePdfDocument invoice={invoice} items={items} settings={settings} logoSrc={logoSrc}/>;
  const filename = `Biorona-${invoice.invoiceNumber}.pdf`;
  const whatsAppUrl = invoiceWhatsAppUrl({ customerWhatsapp: invoice.customerWhatsapp, customerName: invoice.customerName, invoiceNumber: invoice.invoiceNumber, grandTotal: invoice.grandTotal, paymentStatus: invoice.paymentStatus });
  const hasCustomerWhatsApp = Boolean(invoice.customerWhatsapp.trim());
  const invalidWhatsApp = hasCustomerWhatsApp && !normalizeWhatsAppNumber(invoice.customerWhatsapp);
  return <section className={styles.actions} aria-label="PDF invoice">
    <button type="button" onClick={() => setPreviewOpen(true)}>Preview Invoice</button>
    <PDFDownloadLink document={document} fileName={filename} className={styles.download}>{({ loading }) => loading ? "Menyiapkan PDF…" : "Download PDF"}</PDFDownloadLink>
    {whatsAppUrl && <a className={styles.whatsApp} href={whatsAppUrl} target="_blank" rel="noopener noreferrer">Kirim via WhatsApp</a>}
    {invalidWhatsApp && <button type="button" disabled title="Nomor WhatsApp pelanggan tidak dapat digunakan">Kirim via WhatsApp</button>}
    {hasCustomerWhatsApp && <small className={styles.hint}>{invalidWhatsApp ? "Nomor WhatsApp pelanggan tidak valid. Periksa kembali sebelum mengirim." : "Download PDF terlebih dahulu, lalu lampirkan file saat chat WhatsApp terbuka."}</small>}
    {previewOpen && <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Preview invoice PDF"><div className={styles.preview}><div className={styles.previewHeader}><strong>Preview {invoice.invoiceNumber}</strong><button type="button" onClick={() => setPreviewOpen(false)}>Tutup</button></div><PDFViewer className={styles.viewer}>{document}</PDFViewer></div></div>}
  </section>;
}
