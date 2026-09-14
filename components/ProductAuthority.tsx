import Link from "next/link";
import type { Product } from "@/data/products";
import { formatRupiah } from "@/lib/format";
import { formatProductAttribute } from "@/lib/product-seo";

type Props = {
  product: Product;
  categoryHref: string;
  categoryName: string;
  status: string;
};

export default function ProductAuthority({ product, categoryHref, categoryName, status }: Props) {
  const colors = product.colors.map(formatProductAttribute).filter(Boolean);
  const occasions = product.occasions.map(formatProductAttribute).filter(Boolean);

  return (
    <section className="container productAuthority glassSurface" aria-labelledby="product-information-title">
      <div>
        <span className="kicker">Detail aktual</span>
        <h2 id="product-information-title">Informasi produk</h2>
      </div>
      <dl>
        <div><dt>Kategori</dt><dd><Link href={categoryHref}>{categoryName}</Link></dd></div>
        <div><dt>Harga</dt><dd>{formatRupiah(product.price)}</dd></div>
        <div><dt>Ketersediaan</dt><dd>{status}</dd></div>
        {product.sku && <div><dt>SKU</dt><dd>{product.sku}</dd></div>}
        {product.leadTime && <div><dt>Lead time</dt><dd>{product.leadTime}</dd></div>}
        {colors.length > 0 && <div><dt>Pilihan warna</dt><dd>{colors.join(" · ")}</dd></div>}
        {occasions.length > 0 && <div><dt>Cocok untuk</dt><dd>{occasions.join(" · ")}</dd></div>}
      </dl>
      <p className="productLocalContext">
        Pemesanan dari Biorona Florist Cibinong tersedia untuk area Bogor dan sekitarnya.{" "}
        <Link href="/toko-bunga-cibinong/">Lihat lokasi Cibinong</Link>{" · "}
        <Link href="/toko-bunga-bogor/">Layanan area Bogor</Link>{" · "}
        <Link href="/katalog/">Buka katalog</Link>
      </p>
    </section>
  );
}
