"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "./Icons";
import { waUrl } from "@/lib/whatsapp";
import { markNormalNavigation } from "./RouteScrollManager";

export default function MobileOrderBar({ avoidHeroCtas = false }: { avoidHeroCtas?: boolean }) {
  const pathname = usePathname();
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

  const catalogHref = pathname === "/" ? "#katalog" : "/katalog/";

  return <nav className={`mobileOrderBar glassSurface ${heroCtasVisible ? "isHeroCtaVisible" : ""}`} aria-label="Aksi cepat"><Link href={catalogHref} onClick={() => markNormalNavigation(catalogHref)}>Lihat katalog</Link><a className="mobileWa" href={waUrl("Halo Biorona 🌷 Saya ingin bertanya tentang produk.")} target="_blank" rel="noreferrer"><WhatsAppIcon size={18}/> WhatsApp</a></nav>;
}
