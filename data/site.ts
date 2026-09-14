const location = {
  city: "Cibinong",
  region: "Bogor",
  province: "Jawa Barat",
  country: "Indonesia",
  countryCode: "ID",
  coordinates: {
    latitude: -6.4923739,
    longitude: 106.8575448,
  },
} as const;

const googleMapsEmbedUrl = `https://www.google.com/maps?q=${location.coordinates.latitude},${location.coordinates.longitude}&z=17&output=embed`;
const streetAddress = (process.env.NEXT_PUBLIC_BUSINESS_STREET_ADDRESS || "").trim();
const postalCode = (process.env.NEXT_PUBLIC_BUSINESS_POSTAL_CODE || "").trim();

export const siteConfig = {
  brand: "Biorona Florist",
  shortBrand: "Biorona",
  tagline: "Bunga untuk setiap cerita indah.",
  siteUrl: "https://www.biorona.id",
  whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, ""),
  streetAddress,
  postalCode,
  instagram: (process.env.NEXT_PUBLIC_INSTAGRAM_URL || "").trim(),
  googleMapsUrl: (process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL || "").trim(),
  googleMapsEmbedUrl,
  location,
  description: `Biorona Florist menyediakan bouquet, flower box, bunga wisuda, dan custom bouquet untuk pelanggan di ${location.city}, ${location.region}. Pesan dan konsultasi langsung melalui WhatsApp.`,
  defaultImage: "/products/hero-bouquet.jpg",
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, `${siteConfig.siteUrl}/`).toString();
}
