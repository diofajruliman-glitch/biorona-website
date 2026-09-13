import type { Product } from "@/data/products";

export const categorySeoRoutes = {
  buket: {
    slug: "buket-bunga-bogor",
    label: "Buket Bunga Bogor",
    categories: ["Buket Fresh Flower", "Buket Artificial"],
  },
  standing: {
    slug: "standing-flower-bogor",
    label: "Standing Flower Bogor",
    categories: ["Standing Flower"],
  },
  ucapan: {
    slug: "bunga-ucapan-bogor",
    label: "Bunga Ucapan Bogor",
    categories: ["Bunga Papan / Ucapan"],
  },
} as const;

export type CategorySeoKey = keyof typeof categorySeoRoutes;

export function productsForSeoCategory(products: Product[], key: CategorySeoKey) {
  const categories: readonly string[] = categorySeoRoutes[key].categories;
  return products.filter((product) => categories.includes(product.category));
}

export function primarySeoCategory(product: Product) {
  return Object.values(categorySeoRoutes).find((route) =>
    (route.categories as readonly string[]).includes(product.category),
  );
}

export function relatedProducts(product: Product, products: Product[], limit = 4) {
  const occasions = new Set(product.occasions.map((item) => item.toLowerCase()));
  return products
    .filter((candidate) => candidate.slug !== product.slug)
    .map((candidate) => ({
      candidate,
      categoryScore: candidate.category === product.category ? 1 : 0,
      occasionScore: candidate.occasions.reduce(
        (score, occasion) => score + (occasions.has(occasion.toLowerCase()) ? 1 : 0),
        0,
      ),
      priceDistance: Math.abs(candidate.price - product.price),
    }))
    .sort((a, b) =>
      b.categoryScore - a.categoryScore ||
      b.occasionScore - a.occasionScore ||
      a.priceDistance - b.priceDistance ||
      (a.candidate.sortOrder ?? 0) - (b.candidate.sortOrder ?? 0),
    )
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

const genericDescriptionPattern = /^(rangkaian|bunga)\s+(pilihan\s+)?untuk\s+momen\s+istimewa\.?$/i;

export function productSeoDescription(product: Product) {
  const custom = product.seoDescription?.trim();
  if (custom) return custom;

  const short = product.shortDescription.trim();
  if (short && !genericDescriptionPattern.test(short)) return short;

  const details = [
    product.category,
    product.colors.length ? `warna ${product.colors.slice(0, 3).join(", ")}` : "",
    product.occasions.length ? `untuk ${product.occasions.slice(0, 3).join(", ")}` : "",
  ].filter(Boolean);

  return `${product.name}, ${details.join("; ")}. Lihat harga dan status ketersediaan aktual sebelum memesan.`;
}
