import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  products as fallbackProducts,
  type Product,
  type ProductCategory,
} from "@/data/products";
import type { Database } from "@/lib/supabase/database.types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductImageRow = Database["public"]["Tables"]["product_images"]["Row"];
type ProductWithImages = ProductRow & { product_images: ProductImageRow[] | null };

function toProduct(row: ProductWithImages): Product {
  const images = [...(row.product_images ?? [])].sort((a, b) => {
    if (a.is_thumbnail !== b.is_thumbnail) return a.is_thumbnail ? -1 : 1;
    return a.sort_order - b.sort_order;
  });

  return {
    id: row.sku,
    databaseId: row.id,
    sku: row.sku,
    slug: row.slug,
    name: row.name,
    category: row.category as ProductCategory,
    price: row.price,
    originalPrice: row.original_price,
    shortDescription: row.short_description,
    description: row.description,
    seoDescription: row.seo_description,
    images: images.map((image) => image.image_url),
    colors: row.colors,
    occasions: row.occasions,
    tags: row.tags,
    bestseller: row.bestseller,
    featured: row.featured,
    available: row.available,
    preorder: row.preorder,
    leadTime: row.lead_time,
    sortOrder: row.sort_order,
    altText: images[0]?.alt_text || row.name,
  };
}

const loadProducts = cache(async (): Promise<Product[]> => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    console.warn("Supabase belum dikonfigurasi; fallback catalog lokal digunakan.");
    return fallbackProducts;
  }

  try {
    const supabase = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase
      .from("products")
      .select("*, product_images(*)")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data as ProductWithImages[]).map(toProduct);
  } catch (error) {
    console.warn("Supabase tidak tersedia; fallback catalog lokal digunakan.", error);
    return fallbackProducts;
  }
});

export async function getProducts() {
  return loadProducts();
}

export async function getFeaturedProducts() {
  return (await loadProducts()).filter((product) => product.featured);
}

export async function getProductBySlug(slug: string) {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return undefined;

  return (await loadProducts()).find((product) => product.slug.toLowerCase() === normalized);
}

export async function getProductsByCategory(category: ProductCategory) {
  return (await loadProducts()).filter((product) => product.category === category);
}
