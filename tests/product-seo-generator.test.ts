import assert from "node:assert/strict";
import test from "node:test";
import { findSimilarSeoContent, generateProductSeoContent, type SeoGeneratorInput } from "../lib/product-seo-generator.ts";

const input = (overrides: Partial<SeoGeneratorInput> = {}): SeoGeneratorInput => ({
  id: "product-1", name: "Pink Rona Bouquet", slug: "pink-rona-bouquet", sku: "BRN-001", category: "Buket Fresh Flower",
  price: 250000, shortDescription: "Bouquet pink", description: "Rangkaian bernuansa pink untuk hadiah.", seoDescription: "",
  colors: ["Pink", "Putih"], occasions: ["Ulang Tahun", "Wisuda"], tags: ["romantis"], leadTime: "H-1", available: true, preorder: false, imageUrls: ["/products/pink-rona.jpg"], ...overrides,
});

test("generator memilih keyword berdasarkan kategori dan membuat JSON-LD aktual", () => {
  const generated = generateProductSeoContent(input());
  assert.deepEqual(generated.keywords.slice(0, 3), ["buket bunga Bogor", "rangkaian bunga", "pesan bunga online"]);
  assert.match(generated.productDescription, /Pink Rona Bouquet/);
  assert.equal(generated.productJsonLd.price, undefined);
  assert.equal((generated.productJsonLd.offers as { price: string }).price, "250000");
});

test("produk berbeda mendapatkan struktur konten yang tidak identik", () => {
  const first = generateProductSeoContent(input());
  const second = generateProductSeoContent(input({ id: "product-2", sku: "BRN-002", name: "White Grace Bouquet", slug: "white-grace-bouquet", colors: ["Putih"], category: "Standing Flower" }));
  assert.notEqual(first.productDescription, second.productDescription);
  assert.notEqual(first.whatsappCta, second.whatsappCta);
  assert.notEqual(first.faqs[0].question, second.faqs[0].question);
});

test("kemiripan tinggi ditandai sebelum konten disimpan", () => {
  const generated = generateProductSeoContent(input());
  const matches = findSimilarSeoContent(generated, [{ id: "product-2", name: "Produk lama", description: generated.productDescription, seoDescription: generated.metaDescription }], input().id);
  assert.equal(matches.length, 2);
  assert.ok(matches.every((match) => match.score >= 0.72));
});