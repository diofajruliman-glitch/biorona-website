import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategorySeoPage from "@/components/CategorySeoPage";
import Footer from "@/components/Footer";
import MobileOrderBar from "@/components/MobileOrderBar";
import Navbar from "@/components/Navbar";
import { absoluteUrl, siteConfig } from "@/data/site";
import { productsForSeoCategory } from "@/lib/product-seo";
import { getProducts } from "@/lib/products";

const title = "Standing Flower Bogor | Biorona Florist";
const description = "Pesan standing flower Bogor dari Biorona Florist Cibinong untuk grand opening, pernikahan, ucapan selamat, dan duka cita. Konsultasi via WhatsApp.";
const url = absoluteUrl("/standing-flower-bogor/");
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: title }, description, alternates: { canonical: url }, robots: { index: true, follow: true }, openGraph: { type: "website", locale: "id_ID", siteName: siteConfig.brand, title, description, url, images: [{ url: absoluteUrl(siteConfig.defaultImage), alt: "Standing flower dari Biorona Florist Bogor" }] }, twitter: { card: "summary_large_image", title, description, images: [absoluteUrl(siteConfig.defaultImage)] } };

export default async function StandingFlowerBogorPage() {
  const products = productsForSeoCategory(await getProducts(), "standing");
  if (!products.length) notFound();
  return <><Navbar/><CategorySeoPage categoryKey="standing" products={products}/><Footer/><MobileOrderBar/></>;
}
