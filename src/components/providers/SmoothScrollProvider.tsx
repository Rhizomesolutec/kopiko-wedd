"use client";

import React, { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Production scroll on kopikowedd.in felt laggy vs localhost because Lenis was
 * running a long (1.2s) inertia curve + a GSAP ticker loop on every device,
 * including phones. This provider:
 *  - Uses native scroll on touch / reduced-motion (no artificial lag)
 *  - Uses a snappier Lenis config on desktop only
 *  - Avoids the old GSAP-ticker double-RAF coupling
 */
export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const isNarrowViewport = window.matchMedia("(max-width: 768px)").matches;

    // Native scroll on mobile / touch / a11y — feels identical to localhost
    // and removes the "laggy catch-up" inertia users reported on the domain.
    if (prefersReducedMotion || isCoarsePointer || isNarrowViewport) {
      document.documentElement.classList.remove("lenis", "lenis-smooth");
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      // Lerp-only (no long duration curve) = snappy catch-up, less "lag" feel
      lerp: 0.1,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.2,
      wheelMultiplier: 1.05,
      autoRaf: true,
      anchors: true,
      overscroll: false,
    });

    document.documentElement.classList.add("lenis", "lenis-smooth");

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    // Keep ScrollTrigger measurements in sync after layout/images settle
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const refreshTimer = window.setTimeout(refresh, 600);

    return () => {
      window.clearTimeout(refreshTimer);
      window.removeEventListener("load", refresh);
      lenis.off("scroll", onScroll);
      lenis.destroy();
      document.documentElement.classList.remove("lenis", "lenis-smooth");
    };
  }, []);

  return <>{children}</>;
}
