"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

let normalNavigationPending = false;

export function markNormalNavigation(href: string) {
  const target = new URL(href, window.location.href);
  if (!target.hash && target.pathname !== window.location.pathname) {
    normalNavigationPending = true;
  }
}

export default function RouteScrollManager() {
  const pathname = usePathname();

  useEffect(() => {
    if (!normalNavigationPending) return;
    normalNavigationPending = false;

    let frame = window.requestAnimationFrame(() => {
      frame = window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
