"use client";

import { useEffect, useState } from "react";
import { WhatsAppIcon } from "./Icons";
import { waUrl } from "@/lib/whatsapp";

export default function MobileOrderBar({ avoidHeroCtas = false }: { avoidHeroCtas?: boolean }) {
  const [heroCtasVisible, setHeroCtasVisible] = useState(avoidHeroCtas);

  useEffect(() => {
    if (!avoidHeroCtas) return;
    const heroCtas = document.querySelector(".hero .heroCtas");
    if (!heroCtas) {
      setHeroCtasVisible(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setHeroCtasVisible(entry.isIntersecting),
      { threshold: 0.01 },
    );
    observer.observe(heroCtas);
    return () => observer.disconnect();
  }, [avoidHeroCtas]);

  return <nav className={`mobileOrderBar glassSurface ${heroCtasVisible ? "isHeroCtaVisible" : ""}`} aria-label="Aksi cepat"><a href="#katalog">Lihat katalog</a><a className="mobileWa" href={waUrl("Halo Biorona 🌷 Saya ingin bertanya tentang produk.")} target="_blank" rel="noreferrer"><WhatsAppIcon size={18}/> WhatsApp</a></nav>;
}
