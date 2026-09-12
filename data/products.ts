export const productCategories = [
  "Bouquet",
  "Artificial",
  "Wisuda",
  "Birthday",
  "Anniversary",
  "Flower Box",
  "Custom Bouquet",
] as const;

export type ProductCategory = (typeof productCategories)[number];

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  shortDescription: string;
  description: string;
  images: string[];
  colors: string[];
  occasions: string[];
  bestseller: boolean;
  featured: boolean;
  available: boolean;
  preorder: boolean;
  altText: string;
};

export const FALLBACK_PRODUCT_IMAGE = "/products/hero-bouquet.jpg";

export const products: Product[] = [
  {
    id: "BRN-001",
    slug: "pink-rona-bouquet",
    name: "Pink Rona Bouquet",
    category: "Bouquet",
    price: 250000,
    shortDescription: "Bouquet pink lembut untuk hadiah ulang tahun, wisuda, dan momen personal.",
    description: "Rangkaian bunga bernuansa pink lembut dengan karakter romantis, hangat, dan elegan. Cocok untuk hadiah personal yang berkesan tanpa terasa berlebihan.",
    images: ["/products/pink-rona.jpg"],
    colors: ["Pink", "Putih", "Ungu"],
    occasions: ["Ulang Tahun", "Wisuda", "Anniversary", "Hadiah"],
    bestseller: true,
    featured: true,
    available: true,
    preorder: false,
    altText: "Pink Rona Bouquet bernuansa pink lembut dari Biorona Florist",
  },
  {
    id: "BRN-002",
    slug: "lavender-bloom-flower-box",
    name: "Lavender Bloom Flower Box",
    category: "Flower Box",
    price: 320000,
    shortDescription: "Flower box lavender modern untuk ulang tahun dan anniversary.",
    description: "Flower box bernuansa lavender dengan tampilan modern dan lembut, dirancang untuk momen yang ingin terasa lebih dekat dan personal.",
    images: ["/products/lavender-bloom.jpg"],
    colors: ["Ungu", "Pink", "Putih"],
    occasions: ["Ulang Tahun", "Anniversary", "Thank You"],
    bestseller: false,
    featured: true,
    available: true,
    preorder: true,
    altText: "Lavender Bloom Flower Box ungu dan pink dari Biorona Florist",
  },
  {
    id: "BRN-003",
    slug: "white-grace-bouquet-wisuda",
    name: "White Grace Bouquet",
    category: "Wisuda",
    price: 280000,
    shortDescription: "Bouquet putih elegan untuk wisuda, ucapan selamat, dan hadiah formal.",
    description: "Bouquet putih bersih dengan kesan tenang dan premium. Pilihan aman untuk wisuda, ucapan selamat, maupun hadiah formal.",
    images: ["/products/white-grace.jpg"],
    colors: ["Putih", "Cream", "Pink"],
    occasions: ["Wisuda", "Congratulations", "Hadiah"],
    bestseller: true,
    featured: true,
    available: true,
    preorder: true,
    altText: "White Grace Bouquet putih elegan untuk wisuda dari Biorona Florist",
  },
  {
    id: "BRN-004",
    slug: "sweet-rona-artificial-bouquet",
    name: "Sweet Rona Artificial Bouquet",
    category: "Artificial",
    price: 225000,
    shortDescription: "Bouquet artificial pastel yang tahan lama untuk hadiah manis.",
    description: "Rangkaian artificial bernuansa pastel yang tahan lama, mudah dirawat, dan dapat dilengkapi kartu ucapan personal.",
    images: ["/products/pink-rona.jpg"],
    colors: ["Pink", "Peach", "Putih"],
    occasions: ["Ulang Tahun", "Hadiah", "Dekorasi"],
    bestseller: false,
    featured: false,
    available: true,
    preorder: false,
    altText: "Sweet Rona Artificial Bouquet pastel dari Biorona Florist",
  },
  {
    id: "BRN-005",
    slug: "purple-story-anniversary-box",
    name: "Purple Story Anniversary Box",
    category: "Anniversary",
    price: 295000,
    shortDescription: "Flower box ungu-pink romantis untuk anniversary dan hadiah pasangan.",
    description: "Flower box ungu dan pink dengan nuansa romantis untuk anniversary, ucapan sayang, atau momen personal bersama pasangan.",
    images: ["/products/lavender-bloom.jpg"],
    colors: ["Ungu", "Pink"],
    occasions: ["Anniversary", "Romantic", "Hadiah"],
    bestseller: false,
    featured: false,
    available: true,
    preorder: true,
    altText: "Purple Story Anniversary Box ungu dan pink dari Biorona Florist",
  },
  {
    id: "BRN-006",
    slug: "custom-bouquet-biorona",
    name: "Custom Bouquet Biorona",
    category: "Custom Bouquet",
    price: 150000,
    shortDescription: "Bouquet custom berdasarkan budget, warna, gaya, dan momen pilihan Anda.",
    description: "Ceritakan budget, warna, gaya, dan momen Anda. Tim Biorona akan membantu menyusun pilihan yang sesuai sebelum rangkaian diproduksi.",
    images: ["/products/hero-bouquet.jpg"],
    colors: ["Custom"],
    occasions: ["Semua Momen"],
    bestseller: false,
    featured: true,
    available: true,
    preorder: true,
    altText: "Contoh Custom Bouquet Biorona yang dapat disesuaikan",
  },
];

export const categories = ["Semua", ...productCategories] as const;
export type CatalogCategory = (typeof categories)[number];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductStatus(product: Product) {
  if (!product.available) return "Tidak tersedia";
  return product.preorder ? "Pre-order" : "Tersedia";
}

export function getPrimaryProductImage(product: Product) {
  return getProductImages(product)[0];
}

export function getProductImages(product: Product) {
  const images = product.images.filter(Boolean);
  return images.length ? images : [FALLBACK_PRODUCT_IMAGE];
}
