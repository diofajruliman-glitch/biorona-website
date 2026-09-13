"use client";

import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

export type InvoicePdfData = {
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
  discount: number;
  deliveryFee: number;
  otherFee: number;
  grandTotal: number;
};

export type InvoicePdfItem = { id: string; productName: string; description: string | null; qty: number; unitPrice: number; lineTotal: number; };
export type InvoicePdfSettings = { businessName: string; businessAddress: string | null; businessWhatsapp: string | null; businessEmail: string | null; bankName: string | null; bankAccountNumber: string | null; bankAccountName: string | null; paymentNote: string | null; footerNote: string | null; };

const styles = StyleSheet.create({
  page: { paddingTop: 42, paddingHorizontal: 42, paddingBottom: 54, fontFamily: "Helvetica", fontSize: 9, color: "#30262a" },
  header: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#e7dfe2", paddingBottom: 18, marginBottom: 22 },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 }, logo: { width: 84, height: 30, objectFit: "contain" },
  brandName: { fontSize: 13, fontFamily: "Helvetica-Bold", letterSpacing: 1.4, color: "#ad315d" },
  brandSub: { marginTop: 3, fontSize: 7, color: "#76676d", letterSpacing: .7 },
  invoiceTitle: { textAlign: "right", fontSize: 22, fontFamily: "Helvetica-Bold", color: "#30262a" },
  invoiceNumber: { textAlign: "right", marginTop: 5, fontSize: 9, color: "#76676d" },
  dateBlock: { flexDirection: "row", justifyContent: "space-between", marginBottom: 22 },
  sectionLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", letterSpacing: 1, color: "#ad315d", marginBottom: 6 },
  customer: { width: "58%" }, details: { width: "38%", alignItems: "flex-end" },
  customerName: { fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 4 }, muted: { color: "#76676d", lineHeight: 1.45 },
  table: { borderWidth: 1, borderColor: "#e7dfe2", borderRadius: 4, overflow: "hidden" },
  tableHead: { flexDirection: "row", backgroundColor: "#f8f4f5", paddingVertical: 8, paddingHorizontal: 9, fontFamily: "Helvetica-Bold", fontSize: 7, color: "#76676d", letterSpacing: .5 },
  row: { flexDirection: "row", paddingVertical: 10, paddingHorizontal: 9, borderTopWidth: 1, borderTopColor: "#eee7e9" },
  itemName: { fontFamily: "Helvetica-Bold", marginBottom: 3 }, itemDescription: { color: "#76676d", fontSize: 8, lineHeight: 1.35 },
  itemCol: { width: "52%" }, qtyCol: { width: "12%", textAlign: "center" }, priceCol: { width: "18%", textAlign: "right" }, totalCol: { width: "18%", textAlign: "right" },
  summaryArea: { flexDirection: "row", justifyContent: "flex-end", marginTop: 18 }, summary: { width: "47%" },
  summaryLine: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, color: "#76676d" },
  grand: { marginTop: 6, paddingTop: 9, borderTopWidth: 1, borderTopColor: "#30262a", fontFamily: "Helvetica-Bold", fontSize: 12, color: "#30262a" },
  notes: { marginTop: 24, padding: 12, backgroundColor: "#f8f4f5", borderRadius: 4, lineHeight: 1.5 },
  payment: { marginTop: 24, padding: 12, borderWidth: 1, borderColor: "#e7dfe2", borderRadius: 4 }, paymentTitle: { fontFamily: "Helvetica-Bold", color: "#ad315d", marginBottom: 4 },
  footer: { position: "absolute", bottom: 24, left: 42, right: 42, borderTopWidth: 1, borderTopColor: "#e7dfe2", paddingTop: 9, flexDirection: "row", justifyContent: "space-between", color: "#76676d", fontSize: 7 },
  watermark: { position: "absolute", top: 340, left: 0, right: 0, textAlign: "center", fontSize: 58, fontFamily: "Helvetica-Bold", color: "#ad315d", opacity: .09, transform: "rotate(-26deg)" },
});

const rupiah = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
const dateText = (value: string) => new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(`${value}T00:00:00`));
const dateTimeText = (value: string) => new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(new Date(value));

export default function InvoicePdfDocument({ invoice, items, settings, logoSrc }: { invoice: InvoicePdfData; items: InvoicePdfItem[]; settings?: InvoicePdfSettings | null; logoSrc?: string | null }) {
  const stamp = invoice.status === "draft" ? "DRAFT" : invoice.status === "cancelled" ? "BATAL" : invoice.paymentStatus === "paid" ? "LUNAS" : "";
  const hasPaymentInfo = Boolean(settings?.bankName || settings?.bankAccountNumber || settings?.bankAccountName || settings?.paymentNote);
  const footerNote = settings?.footerNote || "Terima kasih telah memilih Biorona Florist.";
  const businessName = settings?.businessName || "Biorona Florist";
  return <Document title={`Biorona ${invoice.invoiceNumber}`} author="Biorona Florist" subject="Invoice Biorona Florist">
    <Page size="A4" style={styles.page}>
      {stamp && <Text style={styles.watermark}>{stamp}</Text>}
      <View style={styles.header} fixed><View style={styles.brand}>{logoSrc && <Image src={logoSrc} style={styles.logo}/>}<View><Text style={styles.brandName}>{businessName}</Text>{settings?.businessAddress && <Text style={styles.brandSub}>{settings.businessAddress}</Text>}{settings?.businessWhatsapp && <Text style={styles.brandSub}>{settings.businessWhatsapp}</Text>}{settings?.businessEmail && <Text style={styles.brandSub}>{settings.businessEmail}</Text>}</View></View><View><Text style={styles.invoiceTitle}>INVOICE</Text><Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text></View></View>
      <View style={styles.dateBlock}><View style={styles.customer}><Text style={styles.sectionLabel}>DITAGIHKAN KEPADA</Text><Text style={styles.customerName}>{invoice.customerName}</Text><Text style={styles.muted}>{invoice.customerWhatsapp}</Text>{invoice.customerAddress && <Text style={styles.muted}>{invoice.customerAddress}</Text>}</View><View style={styles.details}><Text style={styles.sectionLabel}>TANGGAL INVOICE</Text><Text>{dateText(invoice.invoiceDate)}</Text>{invoice.dueDate && <><Text style={[styles.sectionLabel, { marginTop: 10 }]}>JATUH TEMPO</Text><Text>{dateText(invoice.dueDate)}</Text></>}</View></View>
      <View style={styles.table}><View style={styles.tableHead}><Text style={styles.itemCol}>ITEM</Text><Text style={styles.qtyCol}>QTY</Text><Text style={styles.priceCol}>HARGA</Text><Text style={styles.totalCol}>TOTAL</Text></View>{items.map((item) => <View key={item.id} style={styles.row}><View style={styles.itemCol}><Text style={styles.itemName}>{item.productName}</Text>{item.description && <Text style={styles.itemDescription}>{item.description}</Text>}</View><Text style={styles.qtyCol}>{item.qty}</Text><Text style={styles.priceCol}>{rupiah(item.unitPrice)}</Text><Text style={styles.totalCol}>{rupiah(item.lineTotal)}</Text></View>)}</View>
      <View style={styles.summaryArea}><View style={styles.summary}><View style={styles.summaryLine}><Text>Subtotal</Text><Text>{rupiah(invoice.subtotal)}</Text></View><View style={styles.summaryLine}><Text>Diskon</Text><Text>- {rupiah(invoice.discount)}</Text></View><View style={styles.summaryLine}><Text>Ongkir</Text><Text>{rupiah(invoice.deliveryFee)}</Text></View><View style={styles.summaryLine}><Text>Biaya Lain</Text><Text>{rupiah(invoice.otherFee)}</Text></View><View style={[styles.summaryLine, styles.grand]}><Text>GRAND TOTAL</Text><Text>{rupiah(invoice.grandTotal)}</Text></View></View></View>
      <View style={styles.payment}><Text style={styles.paymentTitle}>{invoice.paymentStatus === "paid" ? "LUNAS" : "BELUM DIBAYAR"}</Text>{invoice.paymentStatus === "paid" && <Text style={styles.muted}>{invoice.paymentMethod || "Metode pembayaran tidak dicatat"}{invoice.paidAt ? ` · ${dateTimeText(invoice.paidAt)}` : ""}</Text>}</View>
      {hasPaymentInfo && <View style={styles.payment}><Text style={styles.paymentTitle}>INFORMASI PEMBAYARAN</Text>{settings?.bankName && <Text style={styles.muted}>{settings.bankName}</Text>}{settings?.bankAccountNumber && <Text style={styles.muted}>{settings.bankAccountNumber}</Text>}{settings?.bankAccountName && <Text style={styles.muted}>a.n. {settings.bankAccountName}</Text>}{settings?.paymentNote && <Text style={[styles.muted, { marginTop: 5 }]}>{settings.paymentNote}</Text>}</View>}
      {invoice.notes && <View style={styles.notes}><Text style={styles.sectionLabel}>CATATAN</Text><Text>{invoice.notes}</Text></View>}
      <View style={styles.footer} fixed><Text>{footerNote}</Text><Text>Invoice ini dibuat secara elektronik.</Text></View>
    </Page>
  </Document>;
}
