# Biorona Signature Liquid Glass 3.0

Website florist Biorona dengan UI khas Biorona, Liquid Glass iOS-inspired, mobile-first, akses cepat ke WhatsApp, dan fondasi SEO yang lebih kuat.

## Fokus versi 3.0
- Bukan meniru mockup lama; identitas visual baru khusus Biorona.
- Liquid Glass dipakai pada navigasi, kontrol, toolbar, dan elemen interaktif — bukan menutupi seluruh konten.
- Tanpa login pelanggan, tanpa cart, tanpa checkout.
- Katalog searchable dan filterable.
- Halaman produk terpisah `/produk/[slug]/` agar lebih SEO-friendly.
- Metadata, canonical, OpenGraph, sitemap, robots, JSON-LD Florist/ItemList/Product.
- Custom Bouquet langsung membuat pesan WhatsApp.
- Static export: cocok untuk Vercel atau cPanel.

## Menjalankan
1. Copy `.env.local.example` menjadi `.env.local`.
2. Isi nomor WA dengan format 62xxxxxxxxxx.
3. Jalankan:
   ```powershell
   npm.cmd install
   npm.cmd run dev
   ```
4. Buka http://localhost:3000

## Build untuk cPanel
```powershell
npm.cmd run build
```
Hasil ada di folder `out/`. Upload **isi** folder `out` ke `public_html`.

## GitHub/Vercel
Push source ke GitHub, import repo ke Vercel, lalu isi Environment Variables yang sama.

## Catatan
Nama produk/foto/harga masih contoh. Ganti melalui `data/products.ts` dan `public/products/`.
