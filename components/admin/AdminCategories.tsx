"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { requireAdminSession } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

type CategoryForm = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  sort_order: string;
  is_active: boolean;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const emptyForm = (): CategoryForm => ({
  name: "",
  slug: "",
  description: "",
  sort_order: "0",
  is_active: true,
});

export default function AdminCategories() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [form, setForm] = useState<CategoryForm>(emptyForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});

  const loadCategories = useCallback(async () => {
    setError("");
    try {
      const { supabase } = await requireAdminSession();
      const { data, error: fetchError } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (fetchError) throw fetchError;
      setCategories(data ?? []);
      const counts: Record<string, number> = {};
      for (const category of data ?? []) {
        const { count, error: countError } = await supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("category_id", category.id);
        if (countError) throw countError;
        counts[category.id] = count ?? 0;
      }
      setProductCounts(counts);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Gagal memuat kategori.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const canSubmit = useMemo(() => form.name.trim() && form.slug.trim() && Number.isFinite(Number(form.sort_order)), [form]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!form.name.trim()) {
      setError("Nama kategori wajib diisi.");
      return;
    }

    if (!form.slug.trim()) {
      setError("Slug kategori wajib diisi.");
      return;
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) {
      setError("Slug harus lowercase dan SEO friendly, hanya huruf, angka, dan tanda hubung.");
      return;
    }

    if (!Number.isFinite(Number(form.sort_order))) {
      setError("Sort order harus berupa angka.");
      return;
    }

    const duplicate = categories.find((category) =>
      category.id !== form.id &&
      (category.name.trim().toLocaleLowerCase("id-ID") === form.name.trim().toLocaleLowerCase("id-ID") || category.slug === form.slug.trim())
    );
    if (duplicate) {
      setError("Nama atau slug kategori sudah digunakan. Gunakan nilai yang unik.");
      return;
    }

    try {
      setSaving(true);
      const { supabase } = await requireAdminSession();
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || null,
        sort_order: Number(form.sort_order),
        is_active: form.is_active,
      };

      if (form.id) {
        const { error: updateError } = await supabase.from("categories").update(payload).eq("id", form.id);
        if (updateError) throw updateError;
        setMessage("Kategori berhasil diperbarui.");
      } else {
        const { error: insertError } = await supabase.from("categories").insert(payload);
        if (insertError) throw insertError;
        setMessage("Kategori berhasil ditambahkan.");
      }

      setForm(emptyForm());
      await loadCategories();
    } catch (reason) {
      const messageText = reason instanceof Error ? reason.message : "Gagal menyimpan kategori.";
      setError(messageText.includes("duplicate key") ? "Nama atau slug kategori sudah digunakan. Gunakan nilai yang unik." : messageText);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(category: CategoryRow) {
    setError("");
    setMessage("");
    try {
      const { supabase } = await requireAdminSession();
      const { error } = await supabase.from("categories").update({ is_active: !category.is_active }).eq("id", category.id);
      if (error) throw error;
      setMessage(category.is_active ? "Kategori dinonaktifkan." : "Kategori diaktifkan.");
      await loadCategories();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Gagal mengubah status kategori.");
    }
  }

  async function remove(category: CategoryRow) {
    setError("");
    setMessage("");
    const count = productCounts[category.id] ?? 0;
    if (count > 0) {
      setError(`Kategori ini masih digunakan oleh ${count} produk.`);
      return;
    }

    if (!window.confirm(`Hapus kategori ${category.name}?`)) return;

    try {
      const { supabase } = await requireAdminSession();
      const { error } = await supabase.from("categories").delete().eq("id", category.id);
      if (error) throw error;
      setMessage("Kategori berhasil dihapus.");
      await loadCategories();
    } catch (reason) {
      const errorText = reason instanceof Error ? reason.message : "Gagal menghapus kategori.";
      setError(errorText.includes("masih digunakan") ? errorText : "Kategori ini masih digunakan oleh produk. Nonaktifkan atau pindahkan produknya terlebih dahulu.");
    }
  }

  function startEdit(category: CategoryRow) {
    setError("");
    setMessage("");
    setForm({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      sort_order: String(category.sort_order),
      is_active: category.is_active,
    });
  }

  return (
    <>
      <header className="adminPageHeader">
        <div>
          <span className="adminEyebrow">Kategori</span>
          <h1>Kelola kategori produk</h1>
        </div>
      </header>
      {message && <p className="adminNotice" role="status">{message}</p>}
      {error && <p className="adminNotice adminError" role="alert">{error}</p>}

      <form className="adminForm" onSubmit={submit}>
        <section>
          <h2>{form.id ? "Edit kategori" : "Tambah kategori"}</h2>
          <div className="adminFormGrid">
            <label>
              Nama
              <input
                required
                value={form.name}
                onChange={(event) => {
                  const value = event.target.value;
                  setForm((current) => ({
                    ...current,
                    name: value,
                    slug: current.id ? current.slug : slugify(value),
                  }));
                }}
              />
            </label>
            <label>
              Slug
              <input
                required
                value={form.slug}
                onChange={(event) => setForm((current) => ({ ...current, slug: slugify(event.target.value) }))}
              />
            </label>
            <label>
              Sort order
              <input
                type="number"
                value={form.sort_order}
                onChange={(event) => setForm((current) => ({ ...current, sort_order: event.target.value }))}
              />
            </label>
            <label className="checkboxField">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
              />
              Kategori aktif
            </label>
          </div>
          <label>
            Deskripsi
            <textarea
              rows={4}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            />
          </label>
          <div className="adminActionsRow">
            <button type="submit" className="adminPrimary" disabled={saving || !canSubmit}>
              {saving ? "Menyimpan…" : form.id ? "Simpan perubahan" : "Tambah kategori"}
            </button>
            {form.id && (
              <button type="button" className="adminSecondary" onClick={() => setForm(emptyForm())}>
                Batal edit
              </button>
            )}
          </div>
        </section>
      </form>

      {loading ? (
        <div className="adminState" role="status">Memuat kategori…</div>
      ) : categories.length === 0 ? (
        <div className="adminEmpty">
          <h2>Belum ada kategori</h2>
          <p>Tambahkan kategori pertama Anda untuk menyiapkan katalog dinamis.</p>
        </div>
      ) : (
        <div className="adminTableWrap">
          <table className="adminTable">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Slug</th>
                <th>Produk</th>
                <th>Urutan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <strong>{category.name}</strong>
                    {category.description && <small>{category.description}</small>}
                  </td>
                  <td>{category.slug}</td>
                  <td>{productCounts[category.id] ?? 0}</td>
                  <td>{category.sort_order}</td>
                  <td>
                    <span className={`adminStatus ${category.is_active ? "isActive" : ""}`}>
                      {category.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td>
                    <div className="adminActions">
                      <button type="button" onClick={() => startEdit(category)}>Edit</button>
                      <button type="button" onClick={() => toggleActive(category)}>
                        {category.is_active ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                      <button type="button" className="danger" onClick={() => remove(category)}>
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
