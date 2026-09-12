# Biorona Admin Guide

Area admin digunakan hanya oleh tim Biorona. Customer tetap memesan tanpa login, cart, atau checkout.

## Persiapan

1. Selesaikan migration dan seed dalam `SUPABASE_SETUP.md`.
2. Isi environment berikut pada `.env.local` dan platform deployment:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

3. Buat user di Supabase Authentication.
4. Tetapkan `app_metadata.role = "admin"` sesuai langkah pada `SUPABASE_SETUP.md`.
5. Restart aplikasi setelah environment berubah.

Jangan pernah memasukkan service-role key ke source code, browser, atau variable `NEXT_PUBLIC_*`. Area admin memakai publishable key dan sesi user; RLS tetap menjadi pengaman utama setiap mutation.

## Routes

- `/admin/login/` — login email/password.
- `/admin/` — ringkasan status produk.
- `/admin/products/` — daftar, nonaktifkan, dan hapus produk.
- `/admin/products/new/` — tambah produk.
- `/admin/products/UUID/edit/` — edit produk berdasarkan UUID database.

Area admin dan katalog production memerlukan deployment Next.js runtime agar perubahan database, produk baru, slug, dan metadata tampil tanpa rebuild. Static HTML hosting saja tidak mendukung kebutuhan ini.

## Mengelola produk

- SKU dan slug harus unik; slug hanya menerima huruf kecil, angka, dan tanda hubung.
- Array warna, occasions, dan tags ditulis sebagai daftar dipisahkan koma.
- `Available` mengontrol apakah barang dapat dipesan.
- `Pre-order`, `Featured`, dan `Bestseller` mengontrol status katalog.
- `Produk aktif` menentukan apakah row dapat dibaca publik berdasarkan RLS.
- Nonaktifkan produk bila data perlu disimpan tetapi disembunyikan dari customer.
- Hapus hanya bila record memang tidak lagi diperlukan; dialog confirmation selalu ditampilkan.

## Gambar

- Format: JPEG, PNG, WebP, atau AVIF.
- Maksimal 5 MB per file.
- Beberapa gambar dapat dipilih sekaligus dan dipreview sebelum upload.
- Isi alt text yang menjelaskan produk pada setiap gambar.
- Gunakan tombol naik/turun untuk menentukan urutan.
- Pilih satu thumbnail. Bila tidak dipilih, gambar pertama digunakan.
- Nama file Storage memakai UUID sehingga tidak bertabrakan.

Jika penghapusan file Storage gagal setelah metadata/database berhasil dihapus, admin menampilkan peringatan. Bersihkan file orphan melalui Supabase Storage Dashboard.

## Verifikasi keamanan

1. Buka `/admin/` tanpa login: aplikasi harus mengarahkan ke login.
2. Login dengan user tanpa role admin: akses harus ditolak dan sesi dikeluarkan.
3. Login sebagai admin: dashboard dan CRUD harus berfungsi.
4. Coba mutation menggunakan anon key dari REST client: RLS harus menolaknya.
5. Nonaktifkan produk dan pastikan produk tidak lagi terlihat pada query publik.

Proteksi route client mencegah penggunaan UI tanpa sesi. Perlindungan data yang menentukan tetap policy RLS pada Database dan Storage.
