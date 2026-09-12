"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { requireAdminSession } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";
import { formatRupiah } from "@/lib/format";
import { adminErrorMessage, logSupabaseError } from "@/lib/supabase/error";

type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductWithCategory = Product & { categories: { name: string } | null };

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductWithCategory[] | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const { supabase } = await requireAdminSession();
      const result = await supabase.from("products").select("*, categories(name)").order("sort_order");
      if (result.error) { logSupabaseError("products.fetch-admin", result.error); throw result.error; }
      setProducts(result.data as ProductWithCategory[]);
    } catch (reason) {
      logSupabaseError("products.fetch-admin", reason);
      setError(adminErrorMessage(reason, "Gagal memuat produk."));
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function toggleActive(product: ProductWithCategory) {
    setError(""); setMessage("");
    try {
      const { supabase } = await requireAdminSession();
      const result = await supabase.from("products").update({ is_active: !product.is_active }).eq("id", product.id);
      if (result.error) { logSupabaseError("products.toggle", result.error); throw result.error; }
      setMessage(product.is_active ? "Produk dinonaktifkan." : "Produk diaktifkan.");
      await load();
    } catch (reason) {
      logSupabaseError("products.toggle", reason);
      setError(adminErrorMessage(reason, "Gagal mengubah produk."));
    }
  }

  async function remove(product: ProductWithCategory) {
    if (!window.confirm(`Hapus permanen ${product.name}? Tindakan ini tidak dapat dibatalkan.`)) return;
    setError(""); setMessage("");
    try {
      const { supabase } = await requireAdminSession();
      const images = await supabase.from("product_images").select("storage_path").eq("product_id", product.id);
      if (images.error) { logSupabaseError("products.delete.fetch-images", images.error); throw images.error; }
      const paths = images.data.map((image) => image.storage_path);

      const deactivate = await supabase.from("products").update({ is_active: false }).eq("id", product.id);
      if (deactivate.error) { logSupabaseError("products.delete.deactivate", deactivate.error); throw deactivate.error; }

      if (paths.length) {
        const storage = await supabase.storage.from("product-images").remove(paths);
        if (storage.error) {
          const restore = await supabase.from("products").update({ is_active: product.is_active }).eq("id", product.id);
          const suffix = restore.error ? " Status aktif produk juga gagal dipulihkan." : " Produk tidak dihapus dan statusnya sudah dipulihkan.";
          throw new Error(`File gambar gagal dihapus: ${storage.error.message}.${suffix}`);
        }
      }

      const result = await supabase.from("products").delete().eq("id", product.id);
      if (result.error) {
        throw new Error(`File gambar sudah dihapus dan produk dinonaktifkan, tetapi data produk gagal dihapus: ${result.error.message}. Coba hapus kembali setelah memeriksa koneksi.`);
      }
      setMessage("Produk dan seluruh file gambarnya berhasil dihapus.");
      await load();
    } catch (reason) {
      logSupabaseError("products.delete", reason);
      setError(adminErrorMessage(reason, "Gagal menghapus produk."));
    }
  }

  return <><header className="adminPageHeader"><div><span className="adminEyebrow">Katalog</span><h1>Product Management</h1></div><Link className="adminPrimary" href="/admin/products/new/">Tambah produk</Link></header>{message&&<p className="adminNotice" role="status">{message}</p>}{error&&<p className="adminNotice adminError" role="alert">{error}</p>}{!products?<div className="adminState" role="status">Memuat produk…</div>:products.length===0?<div className="adminEmpty"><h2>Belum ada produk</h2><p>Tambahkan produk pertama untuk memulai katalog.</p><Link className="adminPrimary" href="/admin/products/new/">Tambah produk</Link></div>:<div className="adminTableWrap"><table className="adminTable"><thead><tr><th>Produk</th><th>Status</th><th>Harga</th><th>Urutan</th><th>Aksi</th></tr></thead><tbody>{products.map(product=><tr key={product.id}><td><strong>{product.name}</strong><small>{product.sku} · {product.categories?.name ?? product.category ?? "Tanpa kategori"}</small></td><td><span className={`adminStatus ${product.is_active?"isActive":""}`}>{product.is_active?"Aktif":"Nonaktif"}</span>{!product.available&&<small>Unavailable</small>}{product.preorder&&<small>Pre-order</small>}</td><td>{formatRupiah(product.price)}</td><td>{product.sort_order}</td><td><div className="adminActions"><Link href={`/admin/products/${product.id}/edit/`}>Edit</Link><button type="button" onClick={()=>toggleActive(product)}>{product.is_active?"Nonaktifkan":"Aktifkan"}</button><button className="danger" type="button" onClick={()=>remove(product)}>Hapus</button></div></td></tr>)}</tbody></table></div>}</>;
}
