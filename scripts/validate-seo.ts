import fs from "node:fs";
import path from "node:path";
import { siteConfig } from "../data/site.ts";
import { products as fallbackProducts, type Product } from "../data/products.ts";
import { productSeoParent, seoCategoryForDatabaseCategory, validSeoCategoryRoutes } from "../lib/product-seo.ts";

const root = process.cwd();
const seedPath = path.join(root, "supabase", "seeds", "BIORONA_CATALOG_70_SEED.sql");
const seedText = fs.readFileSync(seedPath, "utf8");
const seedRows = [...seedText.matchAll(/\('([^']+)', '([^']+)', '([^']+)', '([^']+)', (\d+),/g)].map((match) => ({
  sku: match[1],
  slug: match[2],
  name: match[3],
  category: match[4],
  price: Number(match[5]),
}));
const errors: string[] = [];
const warnings: string[] = [];

function duplicates(values: string[]) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

function checkUnique(label: string, values: string[]) {
  const duplicateValues = duplicates(values);
  if (duplicateValues.length) errors.push(`${label} duplicate: ${duplicateValues.join(", ")}`);
}

function expectedAvailability(product: Product) {
  return product.available
    ? product.preorder ? "https://schema.org/PreOrder" : "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";
}

function productSchemaSnapshot(product: Product) {
  const productUrl = new URL(`/produk/${product.slug}/`, `${siteConfig.siteUrl}/`).toString();
  return {
    name: product.name,
    url: productUrl,
    sku: product.sku || product.id,
    offers: { price: String(product.price), availability: expectedAvailability(product) },
  };
}

function checkProductSchema(product: Product) {
  const schema = productSchemaSnapshot(product);
  const expectedUrl = new URL(`/produk/${product.slug}/`, `${siteConfig.siteUrl}/`).toString();
  if (schema.name !== product.name) errors.push(`Schema name mismatch: ${product.slug}`);
  if (schema.url !== expectedUrl) errors.push(`Schema URL mismatch: ${product.slug}`);
  if (schema.sku !== (product.sku || product.id)) errors.push(`Schema SKU mismatch: ${product.slug}`);
  if (schema.offers.price !== String(product.price)) errors.push(`Schema price mismatch: ${product.slug}`);
  if (schema.offers.availability !== expectedAvailability(product)) errors.push(`Schema availability mismatch: ${product.slug}`);
}

function checkInternalLinks() {
  const sourceRoots = [path.join(root, "app"), path.join(root, "components")];
  const publicRoutePattern = /["'](\/(?:katalog|produk|toko-bunga-bogor|toko-bunga-cibinong|buket-bunga-bogor|standing-flower-bogor|bunga-ucapan-bogor)(?:[^"'`]*))["']/g;
  for (const sourceRoot of sourceRoots) {
    const files = walk(sourceRoot).filter((file) => /\.(tsx?|jsx?)$/.test(file));
    for (const file of files) {
      const text = fs.readFileSync(file, "utf8");
      for (const match of text.matchAll(publicRoutePattern)) {
        const literal = match[1];
        if (literal.includes("${")) continue;
        const pathname = literal.split(/[?#]/, 1)[0];
        if (pathname !== "/" && !pathname.endsWith("/")) {
          errors.push(`Internal link without trailing slash: ${path.relative(root, file)} -> ${literal}`);
        }
      }
    }
  }
}

function walk(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(entryPath) : [entryPath];
  });
}

checkUnique("Seed SKU", seedRows.map((row) => row.sku));
checkUnique("Seed slug", seedRows.map((row) => row.slug));
if (seedRows.length !== 70) errors.push(`Expected 70 seed products, found ${seedRows.length}`);

const seedCategories = [...new Set(seedRows.map((row) => row.category))];
for (const category of seedCategories) {
  const seoCategory = seoCategoryForDatabaseCategory(category);
  if (!seoCategory) warnings.push(`No SEO parent for database category: ${category}; parent=/katalog/`);
  const parent = productSeoParent({ category } as Product);
  if (parent.href !== "/katalog/" && !fs.existsSync(path.join(root, "app", parent.slug, "page.tsx"))) {
    errors.push(`SEO category route missing: ${category} -> ${parent.href}`);
  }
}

const validRoutes = validSeoCategoryRoutes(seedRows.map((row) => ({ category: row.category } as Product)));
for (const route of validRoutes) {
  if (!fs.existsSync(path.join(root, "app", route.slug, "page.tsx"))) {
    errors.push(`Sitemap route has no page: ${route.href}`);
  }
}

for (const product of fallbackProducts) {
  if (!product.images.some(Boolean)) errors.push(`Fallback product without image: ${product.slug}`);
  if (!product.altText.trim()) errors.push(`Fallback product without alt: ${product.slug}`);
  checkProductSchema(product);
}

checkInternalLinks();

console.log(`Seed products: ${seedRows.length}`);
console.log(`Valid sitemap category routes: ${validRoutes.map((route) => `${route.href} (${route.products.length} products)`).join(", ") || "none"}`);
console.log(`Fallback products: ${fallbackProducts.length}`);
if (warnings.length) {
  console.log("Warnings:");
  warnings.forEach((warning) => console.log(`- ${warning}`));
}
if (errors.length) {
  console.error("Errors:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log("SEO validation passed.");
}
