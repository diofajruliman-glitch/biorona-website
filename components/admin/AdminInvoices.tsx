"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatRupiah } from "@/lib/format";
import { requireAdminSession } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];

function labelStatus(status: Invoice["status"]) { return status === "draft" ? "Draft" : status === "issued" ? "Terbit" : "Batal"; }
function labelPayment(status: Invoice["payment_status"]) { return status === "paid" ? "Dibayar" : "Belum Dibayar"; }

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"" | Invoice["status"]>("");
  const [paymentStatus, setPaymentStatus] = useState<"" | Invoice["payment_status"]>("");

  async function removeInvoice(invoice: Invoice) {
    if (!window.confirm(`Hapus invoice ${invoice.invoice_number}? Data item invoice juga akan dihapus.`)) return;
    try {
      const { supabase } = await requireAdminSession();
      const result = await supabase.rpc("delete_invoice", { p_invoice_id: invoice.id });
      if (result.error) throw result.error;
      await load();
    } catch (reason) {
      const value = reason && typeof reason === "object" ? reason as { code?: string; message?: string } : {};
      console.error("Invoice delete failed", reason);
      setError(value.code === "42501" ? "Akses ditolak. Login ulang dengan akun admin." : value.message || "Gagal menghapus invoice.");
    }
  }

  const load = useCallback(async () => {
    setError("");
    try {
      const { supabase } = await requireAdminSession();
      const result = await supabase.from("invoices").select("*").order("invoice_date", { ascending: false }).order("created_at", { ascending: false });
      if (result.error) throw result.error;
      setInvoices(result.data);
    } catch (reason) {
      const value = reason && typeof reason === "object" ? reason as { code?: string; message?: string; details?: string | null; hint?: string | null } : {};
      console.error("Invoice operation failed", { code: value.code, message: value.message, details: value.details, hint: value.hint });
      setError(value.code === "42501" ? "Akses ditolak. Login ulang dengan akun admin." : value.message || "Gagal memuat invoice.");
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return (invoices ?? []).filter((invoice) => {
      const matchesQuery = !normalized || [invoice.invoice_number, invoice.customer_name, invoice.customer_whatsapp]
        .some((value) => value.toLowerCase().includes(normalized));
      return matchesQuery && (!status || invoice.status === status) && (!paymentStatus || invoice.payment_status === paymentStatus);
    });
  }, [invoices, paymentStatus, query, status]);

  return <>
    <header className="adminPageHeader"><div><span className="adminEyebrow">Penjualan WhatsApp</span><h1>Invoice</h1></div><Link className="adminPrimary" href="/admin/invoices/new/">Buat invoice</Link></header>
    {error && <p className="adminNotice adminError" role="alert">{error}</p>}
    {!invoices ? <div className="adminState" role="status">Memuat invoice…</div> : <>
      <section className="adminFilters" aria-label="Filter invoice">
        <input aria-label="Cari invoice" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nomor, pelanggan, atau WhatsApp" />
        <select aria-label="Filter status invoice" value={status} onChange={(event) => setStatus(event.target.value as "" | Invoice["status"])}><option value="">Semua status</option><option value="draft">Draft</option><option value="issued">Terbit</option><option value="cancelled">Batal</option></select>
        <select aria-label="Filter status pembayaran" value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value as "" | Invoice["payment_status"])}><option value="">Semua pembayaran</option><option value="unpaid">Belum Dibayar</option><option value="paid">Dibayar</option></select>
      </section>
      {visible.length === 0 ? <div className="adminEmpty compact"><h2>{invoices.length ? "Tidak ada invoice yang cocok" : "Belum ada invoice"}</h2><p>{invoices.length ? "Ubah pencarian atau filter untuk melihat invoice lain." : "Buat invoice dari pesanan WhatsApp pertama Anda."}</p></div> : <div className="adminTableWrap"><table className="adminTable"><thead><tr><th>Invoice</th><th>Tanggal</th><th>Pelanggan</th><th>WhatsApp</th><th>Total</th><th>Status</th><th>Pembayaran</th><th>Aksi</th></tr></thead><tbody>{visible.map((invoice) => <tr key={invoice.id}><td><strong>{invoice.invoice_number}</strong></td><td>{invoice.invoice_date}</td><td>{invoice.customer_name}</td><td>{invoice.customer_whatsapp}</td><td>{formatRupiah(invoice.grand_total)}</td><td><span className={`adminStatus invoiceStatus ${invoice.status}`}>{labelStatus(invoice.status)}</span></td><td><span className={`adminStatus paymentStatus ${invoice.payment_status}`}>{labelPayment(invoice.payment_status)}</span></td><td><div className="adminActions"><Link href={`/admin/invoices/${invoice.id}/edit/`}>Lihat</Link><Link href={`/admin/invoices/${invoice.id}/edit/`}>Edit</Link><button type="button" className="danger" onClick={() => removeInvoice(invoice)}>Hapus</button></div></td></tr>)}</tbody></table></div>}
    </>}
  </>;
}
