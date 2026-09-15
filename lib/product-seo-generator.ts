const siteUrl = "https://www.biorona.id";
const shortBrand = "Biorona";

export type SeoGeneratorInput = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  price: number;
  shortDescription: string;
  description: string;
  seoDescription: string;
  colors: string[];
  occasions: string[];
  tags: string[];
  leadTime: string | null;
  available: boolean;
  preorder: boolean;
  imageUrls: string[];
};

export type GeneratedFaq = { question: string; answer: string };
export type GeneratedSeoContent = {
  seoTitle: string;
  metaDescription: string;
  productDescription: string;
  heading: string;
  altText: string;
  keywords: string[];
  faqs: GeneratedFaq[];
  internalLink: { label: string; path: string };
  productJsonLd: Record<string, unknown>;
  whatsappCta: string;
};

type ComparableProduct = Pick<SeoGeneratorInput, "id" | "name" | "description" | "seoDescription">;

const categoryRules: Record<string, { keywords: string[]; label: string; path: string; occasion: string }> = {
  "Buket Fresh Flower": { keywords: ["buket bunga Bogor", "rangkaian bunga", "pesan bunga online"], label: "Buket bunga Bogor", path: "/buket-bunga-bogor/", occasion: "hadiah personal" },
  "Buket Artificial": { keywords: ["buket artificial Bogor", "toko bunga Cibinong"], label: "Buket artificial Bogor", path: "/buket-bunga-bogor/", occasion: "hadiah yang tahan lama" },
  "Standing Flower": { keywords: ["standing flower Bogor", "bunga ucapan"], label: "Standing flower Bogor", path: "/standing-flower-bogor/", occasion: "ucapan untuk acara penting" },
  "Bunga Papan / Ucapan": { keywords: ["papan bunga Bogor", "toko bunga terdekat"], label: "Bunga ucapan Bogor", path: "/bunga-ucapan-bogor/", occasion: "ucapan selamat atau simpati" },
  "Bloom Box": { keywords: ["bloom box Bogor", "hadiah bunga"], label: "Bloom box Bogor", path: "/katalog/", occasion: "hadiah yang berkesan" },
  "Hampers / Gift": { keywords: ["hampers bunga Bogor", "hadiah untuk orang tersayang"], label: "Hampers bunga Bogor", path: "/katalog/", occasion: "momen berbagi" },
  "Anggrek dalam Vase": { keywords: ["anggrek Bogor", "rangkaian bunga meja"], label: "Anggrek Bogor", path: "/katalog/", occasion: "dekorasi meja atau hadiah" },
  "Custom Arrangement / Vase": { keywords: ["bunga custom Bogor", "florist Bogor"], label: "Bunga custom Bogor", path: "/#custom", occasion: "kebutuhan bunga yang personal" },
};

const fallbackRule = { keywords: ["toko bunga", "florist Bogor"], label: "Toko bunga Bogor", path: "/katalog/", occasion: "momen spesial" };
const openings = [
  "Untuk menyampaikan perhatian dengan cara yang hangat, {name} menghadirkan",
  "{name} dirancang sebagai pilihan bunga yang berkesan untuk",
  "Saat sebuah momen ingin dirayakan dengan lebih personal, {name} menawarkan",
  "Dengan karakter {colors}, {name} cocok dipertimbangkan untuk",
];
const closings = [
  "Detail warna dan bentuk mengikuti data produk yang tersedia di katalog.",
  "Ketersediaan serta detail pemesanan dikonfirmasi lebih dulu melalui WhatsApp.",
  "Pilihan ini dapat menjadi referensi sebelum Anda menentukan pesan dan waktu kirim.",
  "Tim Biorona membantu memeriksa detail pesanan sesuai bahan dan jadwal yang tersedia.",
];

function hash(value: string) {
  return [...value].reduce((result, character) => (result * 31 + character.charCodeAt(0)) >>> 0, 7);
}

function pick<T>(items: T[], seed: number, offset = 0) {
  return items[(seed + offset) % items.length];
}

function clean(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function list(values: string[], fallback: string) {
  return values.map(clean).filter(Boolean).slice(0, 3).join(", ") || fallback;
}

function limit(value: string, max: number) {
  const normalized = clean(value);
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).replace(/\s+\S*$/, "").trim()}.`;
}

function ruleFor(category: string) {
  return categoryRules[category] ?? Object.entries(categoryRules).find(([key]) => category.toLowerCase().includes(key.toLowerCase()))?.[1] ?? fallbackRule;
}

export function generateProductSeoContent(input: SeoGeneratorInput): GeneratedSeoContent {
  const rule = ruleFor(input.category);
  const seed = hash(`${input.id}|${input.sku}|${input.slug}|${input.name}`);
  const colors = list(input.colors, "warna pilihan");
  const occasions = list(input.occasions, rule.occasion);
  const leadTime = input.leadTime ? ` Lead time yang tercatat: ${clean(input.leadTime)}.` : " Waktu pengerjaan dikonfirmasi saat order.";
  const title = limit(`${input.name} | ${rule.label} - Biorona`, 60);
  const description = `${pick(openings, seed).replace("{name}", input.name).replace("{colors}", colors)} ${rule.occasion}, seperti ${occasions}. ${pick(closings, seed, 1)}${leadTime}`;
  const meta = limit(`${input.name}, ${rule.keywords[0]} dengan nuansa ${colors}. Cocok untuk ${occasions}. Pesan dan cek ketersediaan melalui WhatsApp Biorona.`, 160);
  const productUrl = new URL(`/produk/${input.slug}/`, `${siteUrl}/`).toString();
  const image = input.imageUrls.map((url) => new URL(url, `${siteUrl}/`).toString());
  const availability = input.available ? (input.preorder ? "https://schema.org/PreOrder" : "https://schema.org/InStock") : "https://schema.org/OutOfStock";

  return {
    seoTitle: title,
    metaDescription: meta,
    productDescription: clean(`${description} ${input.description ? `Karakter produk: ${clean(input.description)}` : ""}`),
    heading: `${input.name}: ${rule.label} untuk ${rule.occasion}`,
    altText: limit(`${input.name}, ${colors}, ${rule.label} dari Biorona`, 125),
    keywords: [...new Set([...rule.keywords, ...input.tags.map(clean).filter(Boolean).slice(0, 2)])],
    faqs: [
      { question: `Untuk momen apa ${input.name} dapat dipilih?`, answer: `${input.name} dapat dipertimbangkan untuk ${occasions}. Detail kebutuhan dapat dikonfirmasi berdasarkan data produk yang tersedia.` },
      { question: `Bagaimana cara memesan ${input.name}?`, answer: `Kirim nama produk, tanggal kebutuhan, alamat, dan catatan melalui WhatsApp Biorona. Tim akan memeriksa harga, ketersediaan, serta lead time${input.leadTime ? ` ${clean(input.leadTime)}` : ""} sebelum pesanan diproses.` },
    ],
    internalLink: { label: `Lihat ${rule.label} lainnya`, path: rule.path },
    productJsonLd: {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${productUrl}#product`,
      name: input.name,
      sku: input.sku || input.id,
      category: input.category,
      url: productUrl,
      image,
      description: meta,
      brand: { "@type": "Brand", name: shortBrand },
      offers: { "@type": "Offer", priceCurrency: "IDR", price: String(input.price), availability, url: productUrl },
    },
    whatsappCta: `Halo Biorona, saya ingin memesan ${input.name}. Mohon cek ketersediaan, lead time, dan pengiriman untuk kebutuhan ${rule.occasion}.`,
  };
}

function tokens(value: string) {
  return new Set(clean(value).toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((token) => token.length > 2));
}

function similarity(left: string, right: string) {
  const first = tokens(left);
  const second = tokens(right);
  if (!first.size || !second.size) return 0;
  const intersection = [...first].filter((token) => second.has(token)).length;
  return intersection / new Set([...first, ...second]).size;
}

export function findSimilarSeoContent(generated: GeneratedSeoContent, products: ComparableProduct[], currentId: string) {
  const fields: Array<[string, string, (product: ComparableProduct) => string]> = [
    ["Deskripsi", generated.productDescription, (product) => product.description],
    ["Meta description", generated.metaDescription, (product) => product.seoDescription],
  ];
  return fields.flatMap(([label, value, getValue]) => products
    .filter((product) => product.id !== currentId)
    .map((product) => ({ label, productName: product.name, score: similarity(value, getValue(product)) }))
    .filter((item) => item.score >= 0.72)
    .sort((left, right) => right.score - left.score));
}