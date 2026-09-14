"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { MenuIcon, SearchIcon, WhatsAppIcon, XIcon } from "./Icons";
import { waUrl } from "@/lib/whatsapp";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    let attempts = 0;
    let timer = 0;
    const scrollToHash = () => {
      const target = document.getElementById(hash.slice(1));
      if (target || attempts >= 20) {
        if (target) {
          window.scrollTo(0, Math.max(0, target.getBoundingClientRect().top + window.scrollY - 108));
          if (attempts < 20) {
            attempts += 1;
            timer = window.setTimeout(scrollToHash, 50);
          }
        }
        return;
      }
      attempts += 1;
      timer = window.setTimeout(scrollToHash, 50);
    };
    scrollToHash();
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    let animationFrame = 0;
    const updateCompactState = () => {
      animationFrame = 0;
      const nextCompact = window.scrollY > 50;
      setCompact((current) => current === nextCompact ? current : nextCompact);
    };
    const onScroll = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateCompactState);
    };

    updateCompactState();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const nav = [
    ["Katalog", "/katalog"],
    ["Bogor", "/toko-bunga-bogor/"],
    ["Cibinong", "/toko-bunga-cibinong/"],
    ["Custom", "/#custom"],
    ["Kenapa Biorona", "/#tentang"],
    ["FAQ", "/#faq"],
  ];

  return (
    <header className={`siteHeader ${compact ? "isCompact" : ""}`}>
      <div className="navGlass glassSurface">
        <Logo />
        <nav className="desktopNav" aria-label="Navigasi utama">
          {nav.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>
        <div className="navActions">
          <Link className="iconButton desktopOnly" href="/katalog/" aria-label="Cari produk"><SearchIcon /></Link>
          <a className="waButton waButtonSmall" href={waUrl("Halo Biorona 🌷 Saya ingin bertanya tentang produk Biorona.")} target="_blank" rel="noreferrer"><WhatsAppIcon size={18}/><span>Pesan via WhatsApp</span></a>
          <button className="iconButton mobileOnly" type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Tutup menu" : "Buka menu"}>{open ? <XIcon/> : <MenuIcon/>}</button>
        </div>
      </div>
      {open && (
        <nav id="mobile-navigation" className="mobileMenu glassSurface" aria-label="Navigasi mobile">
          {nav.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
        </nav>
      )}
    </header>
  );
}
