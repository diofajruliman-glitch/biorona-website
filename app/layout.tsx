import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteConfig } from "@/data/site";
import RouteScrollManager from "@/components/RouteScrollManager";
import { absoluteUrl } from "@/data/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  alternates: { canonical: absoluteUrl("/") },
  title: {
    default: `${siteConfig.brand} | Florist ${siteConfig.location.city}, ${siteConfig.location.region}`,
    template: `%s | ${siteConfig.brand}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.brand,
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: absoluteUrl("/"),
    siteName: siteConfig.brand,
    title: `${siteConfig.brand} | Florist Cibinong, Bogor`,
    description: siteConfig.description,
    images: [{ url: siteConfig.defaultImage, alt: `Rangkaian bunga ${siteConfig.brand}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.brand} | Florist Cibinong, Bogor`,
    description: siteConfig.description,
    images: [siteConfig.defaultImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fffafc",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="id"><body><RouteScrollManager/>{children}</body></html>;
}
