"use client";

import { useState } from "react";
import { FALLBACK_PRODUCT_IMAGE } from "@/data/products";
import ProductImage from "./ProductImage";

type ProductGalleryProps = {
  images: readonly string[];
  alt: string;
};

export default function ProductGallery({ images, alt }: ProductGalleryProps) {
  const galleryImages = images.filter(Boolean);
  if (!galleryImages.length) galleryImages.push(FALLBACK_PRODUCT_IMAGE);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = galleryImages[activeIndex] || galleryImages[0];

  return (
    <div className="productGallery">
      <div className="productDetailImage">
        <ProductImage
          key={activeImage}
          images={[activeImage]}
          sizes="(max-width: 560px) calc(100vw - 24px), (max-width: 820px) calc(100vw - 28px), (max-width: 1040px) 54vw, 670px"
          alt={alt}
          loading={activeIndex === 0 ? "eager" : undefined}
        />
      </div>
      {galleryImages.length > 1 && (
        <div className="productThumbnailGrid" aria-label="Galeri foto produk">
          {galleryImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              className={index === activeIndex ? "isActive" : ""}
              aria-label={`Tampilkan foto ${index + 1} dari ${galleryImages.length}`}
              aria-pressed={index === activeIndex}
              onClick={() => setActiveIndex(index)}
            >
              <ProductImage images={[image]} sizes="(max-width: 560px) 54px, 66px" alt={`${alt}, foto ${index + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
