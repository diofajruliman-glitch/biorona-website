# Supabase setup untuk Biorona

Fondasi ini belum digunakan oleh katalog customer. `data/products.ts` tetap menjadi sumber data aktif sampai fase migrasi katalog.

## 1. Buat project dan jalankan migration

1. Buat project di Supabase.
2. Buka **SQL Editor**.
3. Jalankan seluruh isi `supabase/migrations/202609120001_product_foundation.sql` satu kali.
4. Pastikan tabel `products`, `product_images`, dan bucket `product-images` tersedia.

Migration mengaktifkan RLS. Pengunjung hanya bisa membaca produk aktif beserta metadata gambarnya. Operasi tulis hanya diizinkan kepada user terautentikasi dengan `app_metadata.role` bernilai `admin`.

## 2. Konfigurasi environment

Salin `.env.example` menjadi `.env.local`, lalu isi:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

Publishable key memang aman digunakan di browser karena akses tetap dibatasi RLS. Jangan pernah menambahkan `service_role` key ke variable `NEXT_PUBLIC_*`, repository, atau client bundle.

## 3. Buat admin pertama

1. Di **Authentication > Users**, buat atau undang user admin.
2. Salin UUID user tersebut.
3. Jalankan SQL berikut dengan UUID yang benar:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where id = 'UUID-ADMIN-DI-SINI';
```

Gunakan `app_metadata`, bukan `user_metadata`: pelanggan tidak dapat mengubah `app_metadata` miliknya sendiri. User perlu login ulang atau refresh token setelah role diperbarui.

## 4. Konvensi gambar

- Bucket: `product-images`
- Batas file: 5 MB
- Format: JPEG, PNG, WebP, atau AVIF
- Path yang disarankan: `{product_id}/{uuid-file}.{ext}`
- Simpan path objek pada `product_images.storage_path` dan public URL pada `image_url`.
- Hanya admin yang dapat upload, mengganti, atau menghapus file.

Bucket dibuat public agar gambar produk aktif dapat digunakan langsung oleh storefront dan static export. Metadata produk/image tetap mengikuti RLS. Saat produk dinonaktifkan, hapus atau pindahkan objek jika file juga tidak boleh lagi dapat diakses melalui URL lama.

## 5. Verifikasi koneksi dan RLS

Jalankan aplikasi dengan `npm run dev`, lalu gunakan `getSupabaseClient()` dari `lib/supabase/client.ts` pada halaman admin fase berikutnya. Tes cepat dari browser console pada halaman yang mengimpor helper:

```ts
const { data, error } = await getSupabaseClient()
  .from("products")
  .select("id,sku,slug,name,is_active")
  .order("sort_order");
```

Checklist keamanan:

- Tanpa login, `select` hanya mengembalikan baris `is_active = true`.
- Tanpa login, `insert`, `update`, dan `delete` ditolak.
- User authenticated tanpa role admin tetap ditolak menulis.
- Admin dapat CRUD produk dan gambar.
- Upload non-admin ke bucket `product-images` ditolak.
- Setelah environment diisi ulang, restart development server.

Untuk validasi SQL lokal dengan Supabase CLI (opsional), jalankan `supabase db reset` pada project yang sudah diinisialisasi. CLI tidak ditambahkan sebagai dependency project ini.
