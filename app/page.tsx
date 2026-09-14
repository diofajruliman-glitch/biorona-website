import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Catalog from "@/components/Catalog";
import CustomBouquet from "@/components/CustomBouquet";
import Trust from "@/components/Trust";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import MobileOrderBar from "@/components/MobileOrderBar";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import LocalFlorist from "@/components/LocalFlorist";
import LocationSection from "@/components/LocationSection";
import InstagramSection from "@/components/InstagramSection";
import { siteConfig } from "@/data/site";
import type { Product } from "@/data/products";
import { CATALOG_UNAVAILABLE_MESSAGE, CatalogUnavailableError, getActiveCategories, getProducts } from "@/lib/products";

const homeTitle = "Toko Bunga Bogor & Florist Cibinong | Biorona";
const homeDescription = "Biorona Florist, toko bunga di Cibinong, Bogor untuk buket, fresh flower, standing flower, bunga ucapan, flower box, dan rangkaian custom.";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: homeTitle },
  description: homeDescription,
  alternates: { canonical: siteConfig.siteUrl },
  keywords: [
    siteConfig.brand,
    "toko bunga Bogor",
    "toko bunga di Cibinong",
    "florist Cibinong",
    "florist Bogor",
    "buket bunga",
    "bunga buket",
    "standing flower",
    "bunga ucapan",
    "custom bouquet",
    "flower box",
  ],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteConfig.siteUrl,
    siteName: siteConfig.brand,
    title: homeTitle,
    description: homeDescription,
    images: [{ url: siteConfig.defaultImage, alt: `Bouquet bunga dari ${siteConfig.brand}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: homeTitle,
    description: homeDescription,
    images: [siteConfig.defaultImage],
  },
};

export default async function Home() {
  let products: Product[] = [];
  let unavailableMessage: string | undefined;
  let categories: string[] = [];

  try {
    [products, categories] = await Promise.all([getProducts(), getActiveCategories()]);
  } catch (error) {
    if (!(error instanceof CatalogUnavailableError)) throw error;
    unavailableMessage = CATALOG_UNAVAILABLE_MESSAGE;
  }

  return <><JsonLd/><Navbar/><main><Hero/><Reveal><LocalFlorist/></Reveal><Reveal><Catalog variant="home" products={products} unavailableMessage={unavailableMessage} categories={categories}/></Reveal><Reveal><Trust/></Reveal><Reveal><CustomBouquet variant="cta"/></Reveal><Reveal><FAQ limit={3}/></Reveal><Reveal><LocationSection/></Reveal><Reveal><InstagramSection/></Reveal></main><MobileOrderBar avoidHeroCtas/><Footer/></>;
}
