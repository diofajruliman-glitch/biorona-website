import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategorySeoPage from "@/components/CategorySeoPage";
import Footer from "@/components/Footer";
import MobileOrderBar from "@/components/MobileOrderBar";
import Navbar from "@/components/Navbar";
import { absoluteUrl, siteConfig } from "@/data/site";
import { productsForSeoCategory } from "@/lib/product-seo";
import { getProducts } from "@/lib/products";

const title = "Buket Bunga Bogor | Fresh & Artificial Bouquet - Biorona";
const description = "Pesan buket bunga Bogor dari Biorona Florist Cibinong. Pilihan fresh flower, artificial bouquet dan custom bouquet untuk ulang tahun, wisuda, anniversary dan hadiah.";
const url = absoluteUrl("/buket-bunga-bogor/");
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: title }, description, alternates: { canonical: url }, robots: { index: true, follow: true }, openGraph: { type: "website", locale: "id_ID", siteName: siteConfig.brand, title, description, url, images: [{ url: absoluteUrl(siteConfig.defaultImage), alt: "Buket bunga dari Biorona Florist Bogor" }] }, twitter: { card: "summary_large_image", title, description, images: [absoluteUrl(siteConfig.defaultImage)] } };

export default async function BuketBungaBogorPage() {
  const products = productsForSeoCategory(await getProducts(), "buket");
  if (!products.length) notFound();
  return <><Navbar/><CategorySeoPage categoryKey="buket" products={products}/><MobileOrderBar/><Footer/></>;
}
