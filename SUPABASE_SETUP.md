# Supabase setup untuk Biorona

Katalog membaca Supabase melalui `lib/products.ts`. Jika environment belum diisi atau koneksi gagal, data existing dari `data/products.ts` otomatis menjadi fallback sehingga development dan static build tetap dapat berjalan.

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
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Publishable key memang aman digunakan di browser karena akses tetap dibatasi RLS. Jangan pernah menambahkan `service_role` key ke variable `NEXT_PUBLIC_*`, repository, atau client bundle.

`SUPABASE_SERVICE_ROLE_KEY` hanya dipakai oleh script seed lokal, tidak diimpor ke aplikasi, dan tidak boleh memiliki prefix `NEXT_PUBLIC_`. Jangan pasang variable ini pada environment frontend/deployment jika tidak diperlukan.

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

## 5. Seed katalog existing

Setelah migration dan environment selesai, jalankan:

```bash
npm run seed:products
```

Script akan:

1. Membaca enam produk dari `data/products.ts`.
2. Melakukan upsert berdasarkan `sku`, sehingga aman dijalankan ulang.
3. Mengunggah gambar lokal dari folder `public` ke bucket `product-images`.
4. Menyimpan URL, storage path, alt text, urutan, dan thumbnail ke `product_images`.

Script tidak menghapus record atau file lama secara otomatis. Jika daftar gambar berubah, bersihkan objek lama secara sadar dari dashboard setelah memastikan file tidak lagi dipakai.

## 6. Verifikasi koneksi dan RLS

Jalankan `npm run seed:products`, lalu `npm run dev`. Katalog harus menampilkan data hasil seed. Untuk pengecekan langsung pada kode admin fase berikutnya, gunakan:

```ts
const { data, error } = await getSupabaseClient()
  .from("products")
  .select("id,sku,slug,name,is_active")
  .order("sort_order");
```

Untuk menguji fallback, hentikan Supabase sementara atau kosongkan dua variable publik Supabase, restart dev server, lalu pastikan enam produk lokal tetap tampil.

Checklist keamanan:

- Tanpa login, `select` hanya mengembalikan baris `is_active = true`.
- Tanpa login, `insert`, `update`, dan `delete` ditolak.
- User authenticated tanpa role admin tetap ditolak menulis.
- Admin dapat CRUD produk dan gambar.
- Upload non-admin ke bucket `product-images` ditolak.
- Setelah environment diisi ulang, restart development server.

Untuk validasi SQL lokal dengan Supabase CLI (opsional), jalankan `supabase db reset` pada project yang sudah diinisialisasi. CLI tidak ditambahkan sebagai dependency project ini.
