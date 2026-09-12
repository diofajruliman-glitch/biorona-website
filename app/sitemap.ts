import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { siteConfig } from "@/data/site";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap { return [{url:siteConfig.siteUrl, changeFrequency:"weekly", priority:1}, ...products.map(p=>({url:`${siteConfig.siteUrl}/produk/${p.slug}/`, changeFrequency:"weekly" as const, priority:.8}))]; }
