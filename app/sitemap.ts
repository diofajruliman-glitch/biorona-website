import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";
import { isSearchIndexableProduct } from "@/data/products";
import { CatalogUnavailableError, getProducts } from "@/lib/products";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publicPages: MetadataRoute.Sitemap = [
    { url: `${siteConfig.siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.siteUrl}/toko-bunga-bogor/`, changeFrequency: "monthly", priority: .9 },
    { url: `${siteConfig.siteUrl}/toko-bunga-cibinong/`, changeFrequency: "monthly", priority: .9 },
    { url: `${siteConfig.siteUrl}/buket-bunga-bogor/`, changeFrequency: "weekly", priority: .9 },
    { url: `${siteConfig.siteUrl}/standing-flower-bogor/`, changeFrequency: "weekly", priority: .9 },
    { url: `${siteConfig.siteUrl}/bunga-ucapan-bogor/`, changeFrequency: "weekly", priority: .9 },
    { url: `${siteConfig.siteUrl}/katalog/`, changeFrequency: "weekly", priority: .9 },
  ];
  try {
    const products = await getProducts();
    return [...publicPages, ...products.filter(isSearchIndexableProduct).map((product) => ({ url: `${siteConfig.siteUrl}/produk/${product.slug}/`, changeFrequency: "weekly" as const, priority: .8 }))];
  } catch (error) {
    if (!(error instanceof CatalogUnavailableError)) throw error;
    return publicPages;
  }
}
