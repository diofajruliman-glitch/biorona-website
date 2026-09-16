import type { Metadata } from "next";
import Footer from "@/components/Footer";
import LocalLandingPage from "@/components/LocalLandingPage";
import MobileOrderBar from "@/components/MobileOrderBar";
import Navbar from "@/components/Navbar";
import { absoluteUrl, siteConfig } from "@/data/site";
import type { Product } from "@/data/products";
import { CatalogUnavailableError, getProducts } from "@/lib/products";

const title = "Toko Bunga Bogor untuk Buket & Rangkaian | Biorona";
const description = "Pesan buket, standing flower, bunga ucapan, flower box, dan custom bouquet dari Biorona untuk area Bogor. Konsultasi via WhatsApp.";
const url = absoluteUrl("/toko-bunga-bogor/");
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: title }, description, alternates: { canonical: url }, openGraph: { type: "website", locale: "id_ID", siteName: siteConfig.brand, title, description, url, images: [{ url: absoluteUrl(siteConfig.defaultImage), alt: "Rangkaian bunga Biorona Florist Bogor" }] }, twitter: { card: "summary_large_image", title, description, images: [absoluteUrl(siteConfig.defaultImage)] } };

export default async function BogorPage() { let products: Product[] = []; try { products = await getProducts(); } catch (error) { if (!(error instanceof CatalogUnavailableError)) throw error; } return <><Navbar/><LocalLandingPage area="Bogor" products={products}/><MobileOrderBar/><Footer/></>; }
