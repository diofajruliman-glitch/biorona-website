import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Catalog from "@/components/Catalog";
import CustomBouquet from "@/components/CustomBouquet";
import Trust from "@/components/Trust";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import MobileOrderBar from "@/components/MobileOrderBar";
import HowToOrder from "@/components/HowToOrder";
import JsonLd from "@/components/JsonLd";
import { siteConfig } from "@/data/site";
import { getProducts } from "@/lib/products";

const homeTitle = `${siteConfig.brand} | Florist ${siteConfig.location.city}, ${siteConfig.location.region}`;

export const metadata: Metadata = {
  title: { absolute: homeTitle },
  description: siteConfig.description,
  alternates: { canonical: "/" },
  keywords: [
    siteConfig.brand,
    `florist ${siteConfig.location.city}`,
    `toko bunga ${siteConfig.location.region}`,
    "bouquet bunga",
    "custom bouquet",
  ],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: siteConfig.brand,
    title: homeTitle,
    description: siteConfig.description,
    images: [{ url: siteConfig.defaultImage, alt: `Bouquet bunga dari ${siteConfig.brand}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: homeTitle,
    description: siteConfig.description,
    images: [siteConfig.defaultImage],
  },
};

export default async function Home(){const products=await getProducts();return <><JsonLd products={products}/><Navbar/><main><Hero/><Catalog products={products}/><HowToOrder/><CustomBouquet/><Trust/><FAQ/></main><Footer/><MobileOrderBar/></>}
