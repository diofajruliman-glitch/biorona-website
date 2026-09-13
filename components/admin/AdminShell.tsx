"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import Logo from "@/components/Logo";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function AdminShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  async function logout() {
    await getSupabaseClient().auth.signOut();
    window.location.replace("/admin/login/");
  }

  const closeMenu = () => setMenuOpen(false);

  return <div className="adminApp">
    <aside className={`adminSidebar ${menuOpen ? "isOpen" : ""}`}>
      <div className="adminSidebarTop"><Logo/><span className="adminLabel">Admin</span><button className="adminMenuToggle" type="button" aria-expanded={menuOpen} aria-controls="admin-navigation" onClick={() => setMenuOpen(open => !open)}>{menuOpen ? "Tutup menu" : "Menu"}</button></div>
      <nav id="admin-navigation" aria-label="Navigasi admin"><Link onClick={closeMenu} href="/admin/">Dashboard</Link><Link onClick={closeMenu} href="/admin/products/">Produk</Link><Link onClick={closeMenu} href="/admin/products/new/">Tambah produk</Link><Link onClick={closeMenu} href="/admin/categories/">Kategori</Link><Link onClick={closeMenu} href="/admin/invoices/">Invoice</Link></nav>
      <button type="button" onClick={logout}>Keluar</button>
    </aside>
    <main className="adminMain">{children}</main>
  </div>;
}
