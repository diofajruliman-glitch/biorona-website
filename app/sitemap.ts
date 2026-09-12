import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";
import { CatalogUnavailableError, getProducts } from "@/lib/products";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const root = { url: siteConfig.siteUrl, changeFrequency: "weekly" as const, priority: 1 };
  try {
    const products = await getProducts();
    return [root, ...products.map((product) => ({ url: `${siteConfig.siteUrl}/produk/${product.slug}/`, changeFrequency: "weekly" as const, priority: .8 }))];
  } catch (error) {
    if (!(error instanceof CatalogUnavailableError)) throw error;
    return [root];
  }
}
