"use client";

import Image from "next/image";
import { useState } from "react";
import { FALLBACK_PRODUCT_IMAGE } from "@/data/products";

type ProductImageProps = {
  images?: readonly string[];
  alt: string;
  sizes: string;
  priority?: boolean;
};

export default function ProductImage({ images = [], alt, sizes, priority = false }: ProductImageProps) {
  const initialSource = images.find(Boolean) || FALLBACK_PRODUCT_IMAGE;
  const [source, setSource] = useState(initialSource);

  return (
    <Image
      src={source}
      fill
      sizes={sizes}
      alt={alt}
      priority={priority}
      onError={() => {
        if (source !== FALLBACK_PRODUCT_IMAGE) setSource(FALLBACK_PRODUCT_IMAGE);
      }}
    />
  );
}
