"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ArrowIcon, SparkleIcon, WhatsAppIcon } from "./Icons";
import { waUrl } from "@/lib/whatsapp";

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const ctasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const visual = visualRef.current;
    const ctas = ctasRef.current;
    const precisePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!precisePointer.matches || reducedMotion.matches) return;

    const onVisualMove = (event: PointerEvent) => {
      if (!visual) return;
      const rect = visual.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      visual.style.setProperty("--hero-rotate-x", `${(-y * 5).toFixed(2)}deg`);
      visual.style.setProperty("--hero-rotate-y", `${(x * 5).toFixed(2)}deg`);
    };
    const resetVisual = () => {
      visual?.style.setProperty("--hero-rotate-x", "0deg");
      visual?.style.setProperty("--hero-rotate-y", "0deg");
    };
    const buttons = Array.from(ctas?.querySelectorAll<HTMLElement>("a") ?? []);
    const cleanups = buttons.map((button) => {
      const onMove = (event: PointerEvent) => {
        const rect = button.getBoundingClientRect();
        button.style.setProperty("--magnetic-x", `${((event.clientX - rect.left - rect.width / 2) * 0.08).toFixed(1)}px`);
        button.style.setProperty("--magnetic-y", `${((event.clientY - rect.top - rect.height / 2) * 0.08).toFixed(1)}px`);
      };
      const reset = () => {
        button.style.setProperty("--magnetic-x", "0px");
        button.style.setProperty("--magnetic-y", "0px");
      };
      button.addEventListener("pointermove", onMove);
      button.addEventListener("pointerleave", reset);
      return () => { button.removeEventListener("pointermove", onMove); button.removeEventListener("pointerleave", reset); };
    });
    visual?.addEventListener("pointermove", onVisualMove);
    visual?.addEventListener("pointerleave", resetVisual);
    return () => {
      visual?.removeEventListener("pointermove", onVisualMove);
      visual?.removeEventListener("pointerleave", resetVisual);
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(([entry]) => {
      hero.classList.toggle("isMotionPaused", !entry.isIntersecting);
    }, { threshold: 0.05 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="hero" id="beranda" ref={heroRef}>
      <div className="heroBackdrop" aria-hidden="true" />
      <div className="heroAurora" aria-hidden="true"><i /><i /><i /></div>
      <div className="container heroGrid">
        <div className="heroCopy">
          <div className="sameDayBadge"><span aria-hidden="true">⚡</span> Pesan Hari Ini <span aria-hidden="true">•</span> Kirim Hari Ini</div>
          <div className="eyebrow heroEntrance heroEntranceLocation"><SparkleIcon size={17}/> Biorona Florist • Cibinong, Bogor</div>
          <h1 aria-label="Toko Bunga Bogor & Florist Cibinong untuk Setiap Momen Spesial">
            <span className="heroTitleLine"><span>Toko Bunga Bogor &amp;</span></span>
            <span className="heroTitleLine"><span>Florist Cibinong untuk</span></span>
            <span className="heroTitleLine"><span>Setiap Momen Spesial</span></span>
          </h1>
          <div className="heroDescriptions">
            <p className="heroLead">Pesan buket bunga, standing flower, bunga ucapan, dan rangkaian bunga pilihan dari Biorona. Pesan hari ini dan kirim hari yang sama untuk Cibinong, Bogor, dan sekitarnya.</p>
            <p className="heroSupportingCopy">Pilih koleksi Biorona atau konsultasikan desain, warna, ukuran, ucapan, dan budget sesuai kebutuhan. Pemesanan dapat dilakukan langsung melalui WhatsApp tanpa login atau checkout.</p>
          </div>
          <div className="heroCtas" ref={ctasRef}>
            <a className="primaryButton" href="/katalog">Lihat Koleksi Bunga <ArrowIcon size={18}/></a>
            <a className="secondaryGlassButton glassSurface" href="#custom"><SparkleIcon size={18}/> Custom Bouquet</a>
            <a className="secondaryGlassButton glassSurface" href={waUrl("Halo Biorona 🌷 Saya ingin konsultasi untuk memilih bunga.")} target="_blank" rel="noreferrer"><WhatsAppIcon size={19}/> Pesan via WhatsApp</a>
          </div>
          <p className="heroKeywords">Buket Bunga <span aria-hidden="true">•</span> Standing Flower <span aria-hidden="true">•</span> Bunga Ucapan <span aria-hidden="true">•</span> Flower Box <span aria-hidden="true">•</span> Custom Bouquet</p>
          <p className="sameDayNote">Same-Day Delivery <span>•</span> Tergantung ketersediaan produk dan area pengiriman.</p>
        </div>
        <div className="heroVisual" ref={visualRef}>
          <div className="heroImageEntrance">
            <div className="heroImageFloat">
              <div className="heroImageFrame">
                <Image src="/products/hero-bouquet.jpg" fill sizes="(max-width: 860px) 100vw, 48vw" alt="Bouquet bunga bernuansa pink dari Biorona Florist" priority />
                <div className="imageVeil" />
              </div>
            </div>
          </div>
          <div className="heroGlassCard glassSurface heroNote">
            <span className="noteKicker">BIORONA NOTE</span>
            <strong>“Karena hadiah terbaik terasa dibuat khusus untuk seseorang.”</strong>
          </div>
          <div className="heroGlassCard glassSurface heroAvailability">
            <span className="statusDot" />
            <div><strong>Order lebih praktis</strong><small>Konsultasi & konfirmasi via WhatsApp</small></div>
          </div>
        </div>
      </div>
    </section>
  );
}
