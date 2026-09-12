"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { requireAdminSession } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type Product = Database["public"]["Tables"]["products"]["Row"];

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { requireAdminSession().then(async ({ supabase }) => {
    const result = await supabase.from("products").select("*");
    if (result.error) throw result.error;
    setProducts(result.data);
  }).catch((reason) => setError(reason instanceof Error ? reason.message : "Gagal memuat dashboard.")); }, []);

  if (error) return <div className="adminState adminError" role="alert">{error}</div>;
  if (!products) return <div className="adminState" role="status">Memuat ringkasan produk…</div>;

  const cards = [
    ["Total produk", products.length],
    ["Produk aktif", products.filter((p) => p.is_active).length],
    ["Unavailable", products.filter((p) => !p.available).length],
    ["Pre-order", products.filter((p) => p.preorder).length],
    ["Featured", products.filter((p) => p.featured).length],
    ["Bestseller", products.filter((p) => p.bestseller).length],
  ];

  return <><header className="adminPageHeader"><div><span className="adminEyebrow">Ringkasan</span><h1>Dashboard produk</h1></div><Link className="adminPrimary" href="/admin/products/new/">Tambah produk</Link></header><section className="adminStats" aria-label="Statistik produk">{cards.map(([label,value])=><article key={label}><span>{label}</span><strong>{value}</strong></article>)}</section></>;
}
