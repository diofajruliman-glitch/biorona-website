import type { Metadata } from "next";
import Footer from "@/components/Footer";
import LocalLandingPage from "@/components/LocalLandingPage";
import MobileOrderBar from "@/components/MobileOrderBar";
import Navbar from "@/components/Navbar";
import { absoluteUrl, siteConfig } from "@/data/site";
import type { Product } from "@/data/products";
import { CatalogUnavailableError, getProducts } from "@/lib/products";

const title = "Toko Bunga Cibinong untuk Berbagai Momen | Biorona";
const description = "Pesan buket, flower box, standing flower, bunga ucapan, dan custom bouquet dari Biorona di Cibinong. Konsultasi via WhatsApp.";
const url = absoluteUrl("/toko-bunga-cibinong/");
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: title }, description, alternates: { canonical: url }, openGraph: { type: "website", locale: "id_ID", siteName: siteConfig.brand, title, description, url, images: [{ url: absoluteUrl(siteConfig.defaultImage), alt: "Buket bunga Biorona Florist Cibinong" }] }, twitter: { card: "summary_large_image", title, description, images: [absoluteUrl(siteConfig.defaultImage)] } };

export default async function CibinongPage() { let products: Product[] = []; try { products = await getProducts(); } catch (error) { if (!(error instanceof CatalogUnavailableError)) throw error; } return <><Navbar/><LocalLandingPage area="Cibinong" products={products}/><MobileOrderBar/><Footer/></>; }
