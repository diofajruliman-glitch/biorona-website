"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowIcon, SparkleIcon, WhatsAppIcon } from "./Icons";
import { waUrl } from "@/lib/whatsapp";
import LivingBloom from "./LivingBloom";

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const ctasRef = useRef<HTMLDivElement>(null);
  const [activeWord, setActiveWord] = useState(0);
  const [leavingWord, setLeavingWord] = useState(-1);
  const rotatingWords = ["Buket Bunga", "Standing Flower", "Bunga Ucapan", "Custom Bouquet", "Same-Day Delivery"];

  useEffect(() => {
    const ctas = ctasRef.current;
    const precisePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!precisePointer.matches || reducedMotion.matches) return;

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
    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setActiveWord((current) => {
        setLeavingWord(current);
        return (current + 1) % rotatingWords.length;
      });
    }, 2800);
    return () => window.clearInterval(timer);
  }, [rotatingWords.length]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(([entry]) => {
      hero.classList.toggle("isMotionPaused", !entry.isIntersecting);
    }, { threshold: 0.05 });
    const syncPageVisibility = () => hero.classList.toggle("isPageHidden", document.hidden);
    observer.observe(hero);
    syncPageVisibility();
    document.addEventListener("visibilitychange", syncPageVisibility);
    return () => {
      document.removeEventListener("visibilitychange", syncPageVisibility);
      observer.disconnect();
    };
  }, []);

  return (
    <section className="hero" id="beranda" ref={heroRef}>
      <div className="heroBackdrop" aria-hidden="true" />
      <div className="container heroGrid">
        <div className="heroCopy">
          <div className="sameDayBadge"><span aria-hidden="true">⚡</span> Pesan Hari Ini <span aria-hidden="true">•</span> Kirim Hari Ini</div>
          <div className="eyebrow heroEntrance heroEntranceLocation"><SparkleIcon size={17}/> Biorona Florist • Cibinong, Bogor</div>
          <h1 aria-label="Toko Bunga Bogor & Florist Cibinong — Biorona Florist">
            <span className="heroTitleLine"><span>Toko Bunga Bogor &amp; </span></span>
            <span className="heroTitleLine"><span>Florist Cibinong</span></span>
            <span className="srOnly"> — Biorona Florist</span>
          </h1>
          <p className="heroServiceLine" aria-label="Pilihan bunga untuk Buket Bunga">
            <span aria-hidden="true">Pilihan bunga untuk</span>
            <span className="heroWordWindow" aria-hidden="true">
              {rotatingWords.map((word, index) => (
                <span key={word} className={`heroWord ${index === activeWord ? "isActive" : ""} ${index === leavingWord ? "isLeaving" : ""}`}>{word}</span>
              ))}
            </span>
          </p>
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
        <div className="heroVisual">
          <LivingBloom />
        </div>
      </div>
    </section>
  );
}
