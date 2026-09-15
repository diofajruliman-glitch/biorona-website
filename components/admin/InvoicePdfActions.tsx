"use client";

import { createElement, useEffect, useRef, useState, type ReactElement } from "react";
import { invoiceWhatsAppUrl, normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { normalizePdfInvoice, normalizePdfItems, normalizePdfSettings, type PdfInvoiceData as InvoicePdfData, type PdfInvoiceItem as InvoicePdfItem, type PdfInvoiceSettings as InvoicePdfSettings } from "@/lib/invoice-pdf";
import styles from "./InvoicePdfActions.module.css";

type Props = { invoice: InvoicePdfData; items: InvoicePdfItem[] | null | undefined; settings?: InvoicePdfSettings | null };

function sanitizeFilename(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "invoice";
}

async function logoDataUri() {
  try {
    const response = await fetch("/brand/biorona-logo.png");
    if (!response.ok) throw new Error(`Logo request failed with ${response.status}.`);
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error ?? new Error("Logo could not be read."));
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    logPdfError(error);
    return null;
  }
}

function normalizePdfInput(invoice: InvoicePdfData, items: InvoicePdfItem[], settings: InvoicePdfSettings | null) {
  return {
    invoice: normalizePdfInvoice(invoice as unknown as Record<string, unknown>),
    items: normalizePdfItems(items),
    settings: normalizePdfSettings(settings as unknown as Record<string, unknown> | null),
  };
}

function logPdfError(error: unknown) {
  console.error(error);
  console.error("Invoice PDF error stack:", error instanceof Error ? error.stack : undefined);
  console.error({
    name: error instanceof Error ? error.name : undefined,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
}

export default function InvoicePdfActions({ invoice, items, settings = null }: Props) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const previewUrlRef = useRef<string | null>(null);

  function clearPreviewUrl() {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setPreviewUrl(null);
  }
  useEffect(() => () => { if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current); }, []);

  async function generateBlob() {
    if (typeof window === "undefined") throw new Error("Generator PDF hanya dapat dijalankan di browser.");
    const normalized = normalizePdfInput(invoice, items ?? [], settings);
    console.info("Invoice PDF normalized invoice", normalized.invoice);
    console.info("Invoice PDF normalized items", normalized.items);
    console.info("Invoice PDF input", {
      invoiceId: normalized.invoice.id,
      invoiceNumber: normalized.invoice.invoiceNumber,
      itemCount: normalized.items.length,
      hasSettings: Boolean(normalized.settings),
      status: normalized.invoice.status,
    });
    const [renderer, documentModule] = await Promise.all([
      import("@react-pdf/renderer"),
      import("./InvoicePdfDocument"),
    ]);
    const PdfDocument = documentModule.default as unknown as (props: { invoice: InvoicePdfData; items: InvoicePdfItem[]; settings: InvoicePdfSettings | null; logoSrc: string | null }) => ReactElement;
    const SimpleDocument = () => createElement(renderer.Document, null,
      createElement(renderer.Page, { size: "A4" }, createElement(renderer.Text, null, "PDF runtime check")),
    );
    const simpleBlob = await renderer.pdf(createElement(SimpleDocument)).toBlob();
    console.info("Invoice PDF simple generateBlob() result", { type: simpleBlob.type, size: simpleBlob.size });
    const render = (logoSrc: string | null) => {
      const documentElement = createElement(PdfDocument, { ...normalized, logoSrc });
      return renderer.pdf(documentElement as Parameters<typeof renderer.pdf>[0]).toBlob();
    };

    // Render the text-only document first. A PNG decoder failure must never block
    // an invoice download, and this makes the logo failure independently visible.
    const fallbackBlob = await render(null);
    console.info("Invoice PDF generateBlob() result", { type: fallbackBlob.type, size: fallbackBlob.size });
    const logoSrc = await logoDataUri();
    if (!logoSrc) return fallbackBlob;
    try {
      const blob = await render(logoSrc);
      console.info("Invoice PDF generateBlob() result with logo", { type: blob.type, size: blob.size });
      return blob;
    } catch (error) {
      console.error("Invoice PDF logo failed; using text header instead.");
      logPdfError(error);
      return fallbackBlob;
    }
  }

  async function preview() {
    clearPreviewUrl(); setPreviewOpen(true); setPreviewLoading(true); setPdfError("");
    try {
      const blob = await generateBlob();
      const url = URL.createObjectURL(blob);
      previewUrlRef.current = url;
      setPreviewUrl(url);
    } catch (error) {
      logPdfError(error);
      setPdfError(error instanceof Error ? `${error.name}: ${error.message}` : String(error));
    } finally { setPreviewLoading(false); }
  }

  async function download() {
    setDownloadLoading(true); setPdfError("");
    try {
      const blob = await generateBlob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `Biorona-${sanitizeFilename(invoice.invoiceNumber)}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      logPdfError(error);
      setPdfError(error instanceof Error ? `${error.name}: ${error.message}` : String(error));
    } finally { setDownloadLoading(false); }
  }

  const whatsAppUrl = invoiceWhatsAppUrl({ customerWhatsapp: invoice.customerWhatsapp, customerName: invoice.customerName, invoiceNumber: invoice.invoiceNumber, grandTotal: invoice.grand_total, paymentStatus: invoice.paymentStatus });
  const hasCustomerWhatsApp = Boolean(invoice.customerWhatsapp.trim());
  const invalidWhatsApp = hasCustomerWhatsApp && !normalizeWhatsAppNumber(invoice.customerWhatsapp);
  return <section className={styles.actions} aria-label="PDF invoice">
    <button type="button" onClick={preview} disabled={previewLoading || downloadLoading}>{previewLoading ? "Menyiapkan Preview…" : "Preview Invoice"}</button>
    <button type="button" className={styles.download} onClick={download} disabled={previewLoading || downloadLoading}>{downloadLoading ? "Menyiapkan PDF…" : "Download PDF"}</button>
    {whatsAppUrl && <a className={styles.whatsApp} href={whatsAppUrl} target="_blank" rel="noopener noreferrer">Kirim via WhatsApp</a>}
    {invalidWhatsApp && <button type="button" disabled title="Nomor WhatsApp pelanggan tidak dapat digunakan">Kirim via WhatsApp</button>}
    {hasCustomerWhatsApp && <small className={styles.hint}>{invalidWhatsApp ? "Nomor WhatsApp pelanggan tidak valid. Periksa kembali sebelum mengirim." : "Download PDF terlebih dahulu, lalu lampirkan file saat chat WhatsApp terbuka."}</small>}
    {pdfError && !previewOpen && <p className={styles.error} role="alert">{pdfError}</p>}
    {previewOpen && <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Preview invoice PDF"><div className={styles.preview}><div className={styles.previewHeader}><strong>Preview {invoice.invoiceNumber}</strong><button type="button" onClick={() => { clearPreviewUrl(); setPreviewOpen(false); }}>Tutup</button></div>{previewLoading && <div className={styles.previewState}>Menyiapkan PDF…</div>}{pdfError && <div className={styles.previewState} role="alert">{pdfError}</div>}{previewUrl && !previewLoading && !pdfError && <iframe className={styles.viewer} src={previewUrl} title={`Preview ${invoice.invoiceNumber}`}/>}</div></div>}
  </section>;
}
