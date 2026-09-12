import { existsSync, readFileSync } from "node:fs";
import { basename, extname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { products } from "../data/products.ts";

if (existsSync(resolve(process.cwd(), ".env.local"))) process.loadEnvFile(".env.local");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env.local sebelum seed.");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const mimeTypes: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".webp": "image/webp", ".avif": "image/avif",
};

function assertUnique(values: string[], field: "SKU" | "slug") {
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
  if (duplicates.length) {
    throw new Error(`${field} duplikat pada products.ts: ${[...new Set(duplicates)].join(", ")}`);
  }
}

assertUnique(products.map((product) => product.id), "SKU");
assertUnique(products.map((product) => product.slug), "slug");

for (const [productIndex, product] of products.entries()) {
  const { data: storedProduct, error: productError } = await supabase
    .from("products")
    .upsert({
      sku: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      price: product.price,
      original_price: product.originalPrice ?? null,
      short_description: product.shortDescription,
      description: product.description,
      seo_description: product.seoDescription ?? product.shortDescription,
      colors: product.colors,
      occasions: product.occasions,
      tags: product.tags ?? [],
      available: product.available,
      preorder: product.preorder,
      featured: product.featured,
      bestseller: product.bestseller,
      lead_time: product.leadTime ?? null,
      sort_order: product.sortOrder ?? productIndex,
      is_active: true,
    }, { onConflict: "sku" })
    .select("id")
    .single();

  if (productError || !storedProduct) throw productError ?? new Error(`Gagal menyimpan ${product.id}`);

  const { error: thumbnailResetError } = await supabase
    .from("product_images")
    .update({ is_thumbnail: false })
    .eq("product_id", storedProduct.id);
  if (thumbnailResetError) throw thumbnailResetError;

  for (const [imageIndex, image] of product.images.entries()) {
    if (!image.startsWith("/")) continue;
    const localPath = resolve(process.cwd(), "public", image.replace(/^\/+/, ""));
    if (!existsSync(localPath)) {
      console.warn(`Lewati gambar yang tidak ditemukan: ${localPath}`);
      continue;
    }

    const extension = extname(localPath).toLowerCase();
    const storagePath = `${storedProduct.id}/${imageIndex + 1}-${basename(localPath)}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(storagePath, readFileSync(localPath), {
        contentType: mimeTypes[extension] ?? "application/octet-stream",
        cacheControl: "31536000",
        upsert: true,
      });
    if (uploadError) throw uploadError;

    const { data: publicUrl } = supabase.storage.from("product-images").getPublicUrl(storagePath);
    const { error: imageError } = await supabase.from("product_images").upsert({
      product_id: storedProduct.id,
      image_url: publicUrl.publicUrl,
      storage_path: storagePath,
      alt_text: imageIndex === 0 ? product.altText : `${product.altText}, foto ${imageIndex + 1}`,
      sort_order: imageIndex,
      is_thumbnail: imageIndex === 0,
    }, { onConflict: "storage_path" });
    if (imageError) throw imageError;
  }

  console.log(`Seeded ${product.id} — ${product.name}`);
}

console.log(`Selesai: ${products.length} produk diproses.`);
