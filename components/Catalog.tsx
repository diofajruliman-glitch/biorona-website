"use client";

import { useMemo, useState } from "react";
import { categories, products, type CatalogCategory } from "@/data/products";
import ProductCard from "./ProductCard";
import { SearchIcon } from "./Icons";

export default function Catalog() {
  const [category, setCategory] = useState<CatalogCategory>("Semua");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => (category === "Semua" || p.category === category) && (!q || `${p.name} ${p.category} ${p.shortDescription} ${p.description} ${p.colors.join(" ")} ${p.occasions.join(" ")}`.toLowerCase().includes(q)));
  }, [category, query]);

  return (
    <section className="section catalogSection" id="katalog">
      <div className="container">
        <div className="sectionHeading splitHeading">
          <div><span className="kicker">Koleksi Biorona</span><h2>Pilih yang paling cocok untuk momennya.</h2></div>
          <p>Mulai dari produk siap pilih sampai custom bouquet. Harga terlihat jelas dan pemesanan selesai di WhatsApp.</p>
        </div>
        <div className="catalogToolbar glassSurface">
          <label className="searchField"><SearchIcon size={18}/><input type="search" inputMode="search" enterKeyHint="search" autoComplete="off" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari bouquet, wisuda, birthday..." aria-label="Cari produk" /></label>
          <div className="categoryScroller" role="group" aria-label="Filter kategori">
            {categories.map((item) => <button key={item} type="button" className={item === category ? "active" : ""} aria-pressed={item === category} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
        </div>
        {filtered.length ? <div className="productGrid">{filtered.map((product) => <ProductCard key={product.slug} product={product}/>)}</div> : <div className="emptyState">Belum ada produk yang cocok dengan pencarian Anda.</div>}
      </div>
    </section>
  );
}
