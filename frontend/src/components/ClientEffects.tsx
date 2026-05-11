"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ClientEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));

    if ("IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) entry.target.classList.add("visible");
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
      );

      revealElements.forEach((element) => revealObserver.observe(element));

      return () => revealObserver.disconnect();
    }

    revealElements.forEach((element) => element.classList.add("visible"));
  }, [pathname]);

  useEffect(() => {
    const timers: number[] = [];

    document.querySelectorAll<HTMLElement>(".hero-stat-num").forEach((counter) => {
      const text = counter.textContent?.trim() ?? "";
      const num = parseFloat(text);
      if (text.includes("+") || text.includes("/") || Number.isNaN(num)) return;

      let current = 0;
      const increment = num / 60;
      const isDecimal = text.includes(".");

      const timer = window.setInterval(() => {
        current += increment;
        if (current >= num) {
          counter.textContent = text;
          window.clearInterval(timer);
          return;
        }

        counter.textContent = isDecimal ? current.toFixed(2) : String(Math.floor(current));
      }, 20);

      timers.push(timer);
    });

    return () => {
      timers.forEach((timer) => window.clearInterval(timer));
    };
  }, [pathname]);

  return null;
}
