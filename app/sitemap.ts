import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";
import { getProducts } from "@/lib/products";
export const dynamic = "force-static";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> { const products=await getProducts();return [{url:siteConfig.siteUrl, changeFrequency:"weekly", priority:1}, ...products.map(p=>({url:`${siteConfig.siteUrl}/produk/${p.slug}/`, changeFrequency:"weekly" as const, priority:.8}))]; }
