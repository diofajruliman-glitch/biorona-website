"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/data/products";
import ProductCard from "./ProductCard";
import { SearchIcon } from "./Icons";

const PAGE_SIZE = 12;
const HOME_CATEGORY_CHIPS = [
  ["Fresh", "Buket Fresh Flower"],
  ["Artificial", "Buket Artificial"],
  ["Standing", "Standing Flower"],
  ["Ucapan", "Bunga Papan / Ucapan"],
  ["Bloom Box", "Bloom Box"],
  ["Anggrek", "Anggrek dalam Vase"],
  ["Custom", "Custom Arrangement / Vase"],
  ["Hampers", "Hampers & Gift"],
] as const;
type Props = { products: Product[]; unavailableMessage?: string; categories?: string[]; variant?: "home" | "catalog" };
function catalogHref(page: number, category: string, query: string) { const params = new URLSearchParams(); if (page > 1) params.set("page", String(page)); if (category !== "Semua") params.set("category", category); if (query.trim()) params.set("q", query.trim()); const value = params.toString(); return value ? `/katalog?${value}` : "/katalog"; }

export default function Catalog({ products, unavailableMessage, categories = [], variant = "catalog" }: Props) {
  const searchParams = useSearchParams();
  const categoryOptions = ["Semua", ...new Set(categories.filter((item) => item && item !== "Semua"))];
  const initialCategory = searchParams.get("category");
  const [category, setCategory] = useState(categoryOptions.includes(initialCategory ?? "") ? initialCategory! : "Semua");
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const requestedPage = Math.max(1, Number(searchParams.get("page")) || 1);
  const filtered = useMemo(() => { const q = query.trim().toLowerCase(); return products.filter((p) => (category === "Semua" || p.category === category) && (!q || `${p.name} ${p.category} ${p.shortDescription} ${p.description} ${p.colors.join(" ")} ${p.occasions.join(" ")}`.toLowerCase().includes(q))); }, [category, products, query]);
  const featured = useMemo(() => {
    const selection: Product[] = [];
    const selectedIds = new Set<string>();
    const selectedCategories = new Set<string>();
    const add = (product: Product) => {
      if (selection.length >= 6 || selectedIds.has(product.id)) return;
      selection.push(product);
      selectedIds.add(product.id);
      selectedCategories.add(product.category);
    };

    products.filter((product) => product.bestseller).forEach(add);
    products.filter((product) => product.featured).forEach(add);
    products.filter((product) => !selectedCategories.has(product.category)).forEach(add);
    products.forEach(add);
    return selection;
  }, [products]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const visibleProducts = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (variant === "home") return <section className="section catalogSection homeCatalog" id="katalog" aria-labelledby="featured-products-title"><div className="container"><div className="sectionHeading splitHeading"><div><span className="kicker">Kategori utama</span><h2 id="featured-products-title">Pilihan bunga untuk momen istimewa.</h2></div><p>Temukan buket bunga, standing flower, bunga ucapan, dan custom bouquet pilihan dari florist Biorona di Cibinong, Bogor.</p></div><nav className="homeCategories" aria-label="Kategori bunga">{HOME_CATEGORY_CHIPS.map(([label, value]) => <a key={value} href={`/katalog?category=${encodeURIComponent(value)}`}>{label}</a>)}</nav>{unavailableMessage ? <div className="emptyState" role="alert"><strong>{unavailableMessage}</strong><p>Anda tetap dapat menghubungi Biorona melalui WhatsApp untuk bantuan.</p></div> : <><div className="productGrid">{featured.map((product) => <ProductCard key={product.slug} product={product}/>)}</div><div className="catalogAllCta"><a className="secondaryGlassButton glassSurface" href="/katalog">Lihat Semua Koleksi <span aria-hidden="true">→</span></a></div></>}</div></section>;

  return <section className="section catalogSection catalogPageSection" aria-labelledby="catalog-title"><div className="container"><div className="sectionHeading splitHeading"><div><span className="kicker">Katalog Biorona</span><h1 id="catalog-title">Koleksi bunga untuk setiap momen.</h1></div><p>Cari buket bunga, standing flower, atau bunga ucapan. Pilih produk lalu lanjutkan pesanan melalui WhatsApp.</p></div>{!unavailableMessage && <div className="catalogToolbar glassSurface"><label className="searchField"><SearchIcon size={18}/><input type="search" inputMode="search" enterKeyHint="search" autoComplete="off" value={query} onChange={(event) => { const nextQuery = event.target.value; setQuery(nextQuery); window.history.replaceState(null, "", catalogHref(1, category, nextQuery)); }} placeholder="Cari bouquet, wisuda, birthday..." aria-label="Cari produk" /></label><div className="categoryScroller" role="group" aria-label="Filter kategori">{categoryOptions.map((item) => <button key={item} type="button" className={item === category ? "active" : ""} aria-pressed={item === category} onClick={() => { setCategory(item); window.history.replaceState(null, "", catalogHref(1, item, query)); }}>{item}</button>)}</div></div>}{unavailableMessage ? <div className="emptyState" role="alert"><strong>{unavailableMessage}</strong><p>Anda tetap dapat menghubungi Biorona melalui WhatsApp untuk bantuan.</p></div> : filtered.length ? <><div className="catalogResults" key={`${category}-${query}-${currentPage}`}><div className="productGrid">{visibleProducts.map((product) => <ProductCard key={product.slug} product={product}/>)}</div></div>{totalPages > 1 && <nav className="pagination glassSurface" aria-label="Halaman katalog"><a className={currentPage === 1 ? "isDisabled" : ""} aria-disabled={currentPage === 1} href={catalogHref(Math.max(1, currentPage - 1), category, query)}>‹</a>{Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => <a key={page} className={page === currentPage ? "active" : ""} aria-current={page === currentPage ? "page" : undefined} href={catalogHref(page, category, query)}>{page}</a>)}<a className={currentPage === totalPages ? "isDisabled" : ""} aria-disabled={currentPage === totalPages} href={catalogHref(Math.min(totalPages, currentPage + 1), category, query)}>›</a></nav>}</> : <div className="emptyState">Belum ada produk yang cocok dengan pencarian Anda.</div>}</div></section>;
}
