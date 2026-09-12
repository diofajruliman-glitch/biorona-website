type SupabaseErrorLike = {
  message?: string;
  code?: string;
  details?: string | null;
  hint?: string | null;
};

export function logSupabaseError(context: string, error: unknown) {
  const value = (error && typeof error === "object" ? error : {}) as SupabaseErrorLike;
  console.error({
    context,
    message: value.message,
    code: value.code,
    details: value.details,
    hint: value.hint,
  });
}

export function adminErrorMessage(error: unknown, fallback: string) {
  if (!error || typeof error !== "object") return fallback;
  const value = error as SupabaseErrorLike;
  if (value.code === "42501") return "Akses ditolak. Pastikan akun Anda memiliki role admin lalu login ulang.";
  if (value.code === "23505") return "Nama atau slug sudah digunakan. Gunakan nilai yang unik.";
  if (value.code === "23503" || value.message?.includes("masih digunakan")) {
    return "Kategori masih digunakan oleh produk. Pindahkan produknya terlebih dahulu.";
  }
  if (value.code === "42703" || value.code === "PGRST204") {
    return "Schema database belum lengkap. Jalankan repair migration Dynamic Category.";
  }
  return value.message || fallback;
}
