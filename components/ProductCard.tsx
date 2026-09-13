import Link from "next/link";
import { getProductImageAlt, getProductStatus, type Product } from "@/data/products";
import { formatRupiah } from "@/lib/format";
import { ArrowIcon, WhatsAppIcon } from "./Icons";
import { productInquiryMessage, waUrl } from "@/lib/whatsapp";
import ProductImage from "./ProductImage";

export default function ProductCard({ product }: { product: Product }) {
  const message = productInquiryMessage({ productId: product.id, productName: product.name, price: product.price });
  const status = getProductStatus(product);
  const badge = product.bestseller ? "Best Seller" : product.featured ? "Pilihan Biorona" : null;
  return (
    <article className="productCard">
      <Link className="productImageLink" href={`/produk/${product.slug}/`} aria-label={`Lihat ${product.name}`}>
        <div className="productImageWrap">
          <ProductImage images={product.images} sizes="(max-width: 560px) calc(100vw - 40px), (max-width: 900px) 50vw, 28vw" alt={getProductImageAlt(product)} />
          {badge && <span className="productBadge glassSurface">{badge}</span>}
        </div>
      </Link>
      <div className="productInfo">
        <div>
          <div className="productLabelRow"><span className="productCategory">{product.category}</span><span className={`productStatus ${product.preorder ? "isPreorder" : ""} ${!product.available ? "isUnavailable" : ""}`}>{status}</span></div>
          <h3><Link href={`/produk/${product.slug}/`}>{product.name}</Link></h3>
          <strong className="price">{formatRupiah(product.price)}</strong>
        </div>
        <p>{product.shortDescription}</p>
        <div className="productActions">
          <Link className="textButton" href={`/produk/${product.slug}/`}>Detail <ArrowIcon size={16}/></Link>
          {product.available ? <a className="quickWa" href={waUrl(message)} target="_blank" rel="noreferrer"><WhatsAppIcon size={17}/> Pesan</a> : <span className="quickWa isDisabled" aria-disabled="true">Belum tersedia</span>}
        </div>
      </div>
    </article>
  );
}
