"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";
import { MenuIcon, SearchIcon, WhatsAppIcon, XIcon } from "./Icons";
import { waUrl } from "@/lib/whatsapp";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);

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
          {nav.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
        </nav>
        <div className="navActions">
          <a className="iconButton desktopOnly" href="/katalog" aria-label="Cari produk"><SearchIcon /></a>
          <a className="waButton waButtonSmall" href={waUrl("Halo Biorona 🌷 Saya ingin bertanya tentang produk Biorona.")} target="_blank" rel="noreferrer"><WhatsAppIcon size={18}/><span>Pesan via WhatsApp</span></a>
          <button className="iconButton mobileOnly" type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Tutup menu" : "Buka menu"}>{open ? <XIcon/> : <MenuIcon/>}</button>
        </div>
      </div>
      {open && (
        <nav id="mobile-navigation" className="mobileMenu glassSurface" aria-label="Navigasi mobile">
          {nav.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
        </nav>
      )}
    </header>
  );
}
