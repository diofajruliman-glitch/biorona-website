"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import Logo from "@/components/Logo";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function AdminShell({ children }: { children: ReactNode }) {
  async function logout() {
    await getSupabaseClient().auth.signOut();
    window.location.replace("/admin/login/");
  }

  return <div className="adminApp"><aside className="adminSidebar"><Logo/><span className="adminLabel">Admin</span><nav aria-label="Navigasi admin"><Link href="/admin/">Dashboard</Link><Link href="/admin/products/">Produk</Link><Link href="/admin/products/new/">Tambah produk</Link><Link href="/admin/categories/">Kategori</Link></nav><button type="button" onClick={logout}>Keluar</button></aside><main className="adminMain">{children}</main></div>;
}
