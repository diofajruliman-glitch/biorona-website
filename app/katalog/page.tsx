import type { Metadata } from "next";
import Catalog from "@/components/Catalog";
import Footer from "@/components/Footer";
import MobileOrderBar from "@/components/MobileOrderBar";
import Navbar from "@/components/Navbar";
import LocationSection from "@/components/LocationSection";
import InstagramSection from "@/components/InstagramSection";
import Reveal from "@/components/Reveal";
import FAQ from "@/components/FAQ";
import { CATALOG_UNAVAILABLE_MESSAGE, CatalogUnavailableError, getActiveCategories, getProducts } from "@/lib/products";
import type { Product } from "@/data/products";
import { absoluteUrl, siteConfig } from "@/data/site";

export const dynamic = "force-dynamic";
const title = "Katalog Bunga | Biorona Florist Bogor & Cibinong";
const description = "Katalog buket bunga, standing flower, bunga ucapan, dan rangkaian bunga dari Biorona Florist Cibinong, Bogor.";
const canonical = absoluteUrl("/katalog/");

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const filters = await searchParams;
  const isFiltered = Object.values(filters).some((value) => value !== undefined);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    robots: isFiltered ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: { type: "website", locale: "id_ID", siteName: siteConfig.brand, title, description, url: canonical, images: [{ url: absoluteUrl(siteConfig.defaultImage), alt: "Katalog rangkaian bunga Biorona Florist" }] },
    twitter: { card: "summary_large_image", title, description, images: [absoluteUrl(siteConfig.defaultImage)] },
  };
}

export default async function CatalogPage() {
  let products: Product[] = []; let categories: string[] = []; let unavailableMessage: string | undefined;
  try { [products, categories] = await Promise.all([getProducts(), getActiveCategories()]); } catch (error) { if (!(error instanceof CatalogUnavailableError)) throw error; unavailableMessage = CATALOG_UNAVAILABLE_MESSAGE; }
  return <><Navbar/><main><Catalog products={products} categories={categories} unavailableMessage={unavailableMessage}/><Reveal><FAQ/></Reveal><Reveal><LocationSection/></Reveal><Reveal><InstagramSection/></Reveal></main><MobileOrderBar/><Footer/></>;
}
