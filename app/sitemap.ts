import type { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";
import { siteConfig } from "@/data/site";
import { isSearchIndexableProduct } from "@/data/products";
import { validSeoCategoryRoutes } from "@/lib/product-seo";
import { CatalogUnavailableError, getProducts } from "@/lib/products";

const getCachedSitemapProducts = unstable_cache(
  async () => getProducts(),
  ["public-sitemap-products"],
  { revalidate: 300, tags: ["public-sitemap"] },
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const corePages: MetadataRoute.Sitemap = [
    { url: `${siteConfig.siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.siteUrl}/toko-bunga-bogor/`, changeFrequency: "monthly", priority: .9 },
    { url: `${siteConfig.siteUrl}/toko-bunga-cibinong/`, changeFrequency: "monthly", priority: .9 },
    { url: `${siteConfig.siteUrl}/katalog/`, changeFrequency: "weekly", priority: .9 },
    { url: `${siteConfig.siteUrl}/artikel/buket-bunga-wisuda/`, changeFrequency: "monthly", priority: .7 },
  ];
  try {
    const products = await getCachedSitemapProducts();
    const indexableProducts = products.filter(isSearchIndexableProduct);
    const categoryPages = validSeoCategoryRoutes(indexableProducts)
      .map((route) => ({ url: `${siteConfig.siteUrl}${route.href}`, changeFrequency: "weekly" as const, priority: .9 }));
    return [...corePages, ...categoryPages, ...indexableProducts.map((product) => ({ url: `${siteConfig.siteUrl}/produk/${product.slug}/`, changeFrequency: "weekly" as const, priority: .8 }))];
  } catch (error) {
    if (!(error instanceof CatalogUnavailableError)) throw error;
    return corePages;
  }
}
