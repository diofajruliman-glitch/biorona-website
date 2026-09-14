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

const productCategoryLabels: Record<string, string> = {
  "Buket Fresh Flower": "Buket Bunga Bogor",
  "Buket Artificial": "Buket Bunga Bogor",
  "Standing Flower": "Standing Flower Bogor",
  "Bunga Papan / Ucapan": "Bunga Ucapan Bogor",
  "Anggrek dalam Vase": "Rangkaian Anggrek Bogor",
  "Bloom Box": "Bloom Box Bogor",
  "Custom Arrangement / Vase": "Custom Flower Arrangement Bogor",
};

export function productCategoryLabel(product: Product) {
  return productCategoryLabels[product.category];
}

export function productSeoTitle(product: Product) {
  const category = productCategoryLabel(product);
  return category
    ? `${product.name} | ${category} - Biorona`
    : `${product.name} | Biorona Florist`;
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

const genericDescriptionPattern = /(?:^|,\s*)rangkaian(?:\s+\w+)?\s+pilihan\s+untuk\s+momen\s+istimewa\.?$/i;
const genericSeoDescriptionPattern = /^Pesan .+ untuk hadiah dan ucapan berkesan dengan layanan florist Biorona\.?$/i;
const META_DESCRIPTION_LIMIT = 160;

function limitMetaDescription(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= META_DESCRIPTION_LIMIT) return normalized;

  const shortened = normalized.slice(0, META_DESCRIPTION_LIMIT - 1).replace(/\s+\S*$/, "").trim();
  return `${shortened}.`;
}

function productAttributeDetails(product: Product) {
  const colors = product.colors.map(formatProductAttribute).filter(Boolean).slice(0, 3);
  const occasions = product.occasions.map(formatProductAttribute).filter(Boolean).slice(0, 3);
  const details = [product.category];
  if (colors.length) details.push(`warna ${colors.join(", ")}`);
  if (occasions.length) details.push(`untuk ${occasions.join(", ")}`);
  return details.join("; ");
}

function deterministicProductDescription(product: Product) {
  return `${product.name}: ${productAttributeDetails(product)}. Lihat harga dan status pemesanan di Biorona Florist.`;
}

function referencesAnotherProduct(product: Product, value: string) {
  const match = value.match(/^(.+?)\s+(?:dirancang|adalah|merupakan|menghadirkan)\b/i);
  return Boolean(match && match[1].trim().toLowerCase() !== product.name.trim().toLowerCase());
}

export function formatProductAttribute(value: string) {
  return value.replace(/[-_]+/g, " ").trim();
}

export function productSeoDescription(product: Product) {
  const custom = product.seoDescription?.trim();
  if (custom && !genericSeoDescriptionPattern.test(custom) && !referencesAnotherProduct(product, custom)) return custom;

  const short = product.shortDescription.trim();
  if (short && !genericDescriptionPattern.test(short) && !referencesAnotherProduct(product, short)) return short;

  return deterministicProductDescription(product);
}

export function productDisplayDescription(product: Product) {
  const description = product.description.trim();
  if (description && !genericDescriptionPattern.test(description) && !referencesAnotherProduct(product, description)) return description;

  const short = product.shortDescription.trim();
  if (short && !genericDescriptionPattern.test(short) && !referencesAnotherProduct(product, short)) return short;

  return deterministicProductDescription(product);
}

export function productMetadataDescription(product: Product) {
  const custom = product.seoDescription?.trim();
  if (custom && !genericSeoDescriptionPattern.test(custom) && !referencesAnotherProduct(product, custom)) return limitMetaDescription(custom);

  const colors = product.colors.map(formatProductAttribute).filter(Boolean).slice(0, 2);
  const occasions = product.occasions.map(formatProductAttribute).filter(Boolean).slice(0, 2);
  const attributes = [
    colors.length ? `warna ${colors.join(", ")}` : "",
    occasions.length ? `untuk ${occasions.join(", ")}` : "",
  ].filter(Boolean).join("; ");

  return limitMetaDescription(`${product.name}, ${product.category}${attributes ? `; ${attributes}` : ""}. Cek harga dan ketersediaan di Biorona Florist.`);
}
