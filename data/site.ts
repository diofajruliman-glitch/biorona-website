const location = {
  city: "Cibinong",
  region: "Bogor",
  province: "Jawa Barat",
  country: "Indonesia",
  countryCode: "ID",
} as const;

export const siteConfig = {
  brand: "Biorona Florist",
  shortBrand: "Biorona",
  tagline: "Bunga untuk setiap cerita indah.",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "https://biorona.id").replace(/\/+$/, ""),
  whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, ""),
  instagram: (process.env.NEXT_PUBLIC_INSTAGRAM_URL || "").trim(),
  googleMapsUrl: (process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL || "").trim(),
  location,
  description: `Biorona Florist menyediakan bouquet, flower box, bunga wisuda, dan custom bouquet untuk pelanggan di ${location.city}, ${location.region}. Pesan dan konsultasi langsung melalui WhatsApp.`,
  defaultImage: "/products/hero-bouquet.jpg",
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, `${siteConfig.siteUrl}/`).toString();
}
