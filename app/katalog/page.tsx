import type { Metadata } from "next";
import Catalog from "@/components/Catalog";
import Footer from "@/components/Footer";
import MobileOrderBar from "@/components/MobileOrderBar";
import Navbar from "@/components/Navbar";
import { CATALOG_UNAVAILABLE_MESSAGE, CatalogUnavailableError, getActiveCategories, getProducts } from "@/lib/products";
import type { Product } from "@/data/products";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Katalog Bunga | Biorona Florist Bogor & Cibinong", description: "Katalog buket bunga, standing flower, bunga ucapan, dan rangkaian bunga dari Biorona Florist Cibinong, Bogor.", alternates: { canonical: "/katalog/" } };

export default async function CatalogPage() {
  let products: Product[] = []; let categories: string[] = []; let unavailableMessage: string | undefined;
  try { [products, categories] = await Promise.all([getProducts(), getActiveCategories()]); } catch (error) { if (!(error instanceof CatalogUnavailableError)) throw error; unavailableMessage = CATALOG_UNAVAILABLE_MESSAGE; }
  return <><Navbar/><main><Catalog products={products} categories={categories} unavailableMessage={unavailableMessage}/></main><Footer/><MobileOrderBar/></>;
}
