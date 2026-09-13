"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    element.classList.add("motionReady");
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        element.classList.add("isVisible");
        observer.disconnect();
      }
    }, { threshold: 0.08 });
    observer.observe(element);
    return () => {
      element.classList.remove("motionReady");
      observer.disconnect();
    };
  }, []);

  return <div ref={ref} className="sectionReveal">{children}</div>;
}
