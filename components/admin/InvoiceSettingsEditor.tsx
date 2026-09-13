"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { requireAdminSession } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type Settings = Database["public"]["Tables"]["invoice_settings"]["Row"];
type SettingsForm = { businessName: string; businessAddress: string; businessWhatsapp: string; businessEmail: string; bankName: string; bankAccountNumber: string; bankAccountName: string; paymentNote: string; footerNote: string; };
const blank = (): SettingsForm => ({ businessName: "", businessAddress: "", businessWhatsapp: "", businessEmail: "", bankName: "", bankAccountNumber: "", bankAccountName: "", paymentNote: "", footerNote: "" });

function logSettingsError(error: unknown) {
  const value = error && typeof error === "object" ? error as { code?: string; message?: string; details?: string | null; hint?: string | null } : {};
  console.error("Invoice settings operation failed", { code: value.code, message: value.message, details: value.details, hint: value.hint });
}

export default function InvoiceSettingsEditor() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [form, setForm] = useState<SettingsForm>(blank);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { supabase } = await requireAdminSession();
      const result = await supabase.from("invoice_settings").select("*").maybeSingle();
      if (result.error) throw result.error;
      if (!result.data) throw new Error("Pengaturan invoice belum tersedia. Jalankan migration Invoice Settings terlebih dahulu.");
      setSettings(result.data);
      setForm({ businessName: result.data.business_name, businessAddress: result.data.business_address ?? "", businessWhatsapp: result.data.business_whatsapp ?? "", businessEmail: result.data.business_email ?? "", bankName: result.data.bank_name ?? "", bankAccountNumber: result.data.bank_account_number ?? "", bankAccountName: result.data.bank_account_name ?? "", paymentNote: result.data.payment_note ?? "", footerNote: result.data.footer_note ?? "" });
    } catch (reason) {
      logSettingsError(reason);
      setError(reason instanceof Error ? reason.message : "Gagal memuat pengaturan invoice.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);
  function field<K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) { setForm((current) => ({ ...current, [key]: value })); }
  async function save(event: FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    if (!settings || !form.businessName.trim()) { setError("Nama usaha wajib diisi."); return; }
    setSaving(true);
    try {
      const { supabase } = await requireAdminSession();
      const result = await supabase.from("invoice_settings").update({ business_name: form.businessName.trim(), business_address: form.businessAddress.trim() || null, business_whatsapp: form.businessWhatsapp.trim() || null, business_email: form.businessEmail.trim() || null, bank_name: form.bankName.trim() || null, bank_account_number: form.bankAccountNumber.trim() || null, bank_account_name: form.bankAccountName.trim() || null, payment_note: form.paymentNote.trim() || null, footer_note: form.footerNote.trim() || null }).eq("id", settings.id).select("*").single();
      if (result.error) throw result.error;
      setSettings(result.data);
      setMessage("Pengaturan invoice berhasil disimpan.");
    } catch (reason) {
      logSettingsError(reason);
      setError(reason instanceof Error ? reason.message : "Gagal menyimpan pengaturan invoice.");
    } finally { setSaving(false); }
  }

  if (loading) return <div className="adminState" role="status">Memuat pengaturan invoice…</div>;
  if (!settings) return <div className="adminState adminError" role="alert">{error || "Pengaturan invoice tidak tersedia."}</div>;
  return <><header className="adminPageHeader"><div><span className="adminEyebrow">Invoice</span><h1>Pengaturan Invoice</h1></div></header>{message && <p className="adminNotice" role="status">{message}</p>}{error && <p className="adminNotice adminError" role="alert">{error}</p>}<form className="adminForm" onSubmit={save}><section><h2>Identitas usaha</h2><div className="adminFormGrid"><label>Nama Usaha *<input required value={form.businessName} onChange={(event) => field("businessName", event.target.value)} /></label><label>WhatsApp<input value={form.businessWhatsapp} onChange={(event) => field("businessWhatsapp", event.target.value)} /></label><label>Email<input type="email" value={form.businessEmail} onChange={(event) => field("businessEmail", event.target.value)} /></label></div><label>Alamat<textarea rows={3} value={form.businessAddress} onChange={(event) => field("businessAddress", event.target.value)} /></label></section><section><h2>Informasi pembayaran</h2><div className="adminFormGrid"><label>Nama Bank<input value={form.bankName} onChange={(event) => field("bankName", event.target.value)} /></label><label>Nomor Rekening<input value={form.bankAccountNumber} onChange={(event) => field("bankAccountNumber", event.target.value)} /></label><label>Nama Pemilik Rekening<input value={form.bankAccountName} onChange={(event) => field("bankAccountName", event.target.value)} /></label></div><label>Catatan Pembayaran<textarea rows={3} value={form.paymentNote} onChange={(event) => field("paymentNote", event.target.value)} /></label></section><section><h2>Footer PDF</h2><label>Footer Invoice<textarea rows={3} value={form.footerNote} onChange={(event) => field("footerNote", event.target.value)} /><small>Kosongkan untuk memakai ucapan terima kasih default Biorona Florist.</small></label></section><button className="adminPrimary adminSubmit" type="submit" disabled={saving}>{saving ? "Menyimpan…" : "Simpan Pengaturan"}</button></form></>;
}
