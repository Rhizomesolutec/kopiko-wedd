"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";

interface HeroProps {
  onOpenBooking: () => void;
}

const heroImages = [
  "/showcase/North indian/YCM00354.jpg",
  "/showcase/Pre-Wedding/ASD07384.jpg",
  "/showcase/Traditional Wedd/KOPIKO WEDD.IN-117.jpg",
  "/showcase/DSC03000.jpg",
  "/showcase/DSC02586.jpg",
];

export default function Hero({ onOpenBooking }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [settings, setSettings] = useState({
    heroTitle: "Framing Love\nAs Art",
    heroSubtitle: "Editorial Photography & Cinematic Stories Worldwide",
  });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const opacityContent = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.heroTitle) {
            setSettings({
              heroTitle: data.heroTitle,
              heroSubtitle: data.heroSubtitle || "",
            });
          }
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }
    loadSettings();
  }, []);

  // 3-Second Automatic Image Slide Interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen min-h-[750px] overflow-hidden bg-[#2d2a24] text-white flex flex-col justify-between p-6 md:p-12 lg:p-16"
    >
      {/* Background Image Crossfade Carousel (Top-Focused Subject Positioning) */}
      <motion.div
        style={{ y: yBg }}
        className="absolute inset-0 w-full h-full z-0 overflow-hidden"
      >
        {heroImages.map((img, idx) => (
          <motion.div
            key={img}
            initial={false}
            animate={{
              opacity: currentSlide === idx ? 1 : 0,
            }}
            transition={{
              opacity: { duration: 1.1, ease: "easeInOut" },
            }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={img}
              alt={`KOPIKO Hero Slide ${idx + 1}`}
              fill
              priority={idx === 0}
              quality={idx === 0 ? 85 : 70}
              sizes="100vw"
              className={`object-cover filter brightness-[0.82] contrast-[1.03] ${
                idx === 2 || idx === 4
                  ? "object-[center_18%] md:object-[center_50%]"
                  : idx === 3
                  ? "object-[center_18%] md:object-[center_75%]"
                  : "object-[center_18%]"
              }`}
            />
          </motion.div>
        ))}

        {/* Subtle Dark Taupe Vignette Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2d2a24] via-[#2d2a24]/20 to-black/35 z-10 pointer-events-none" />
      </motion.div>

      {/* Top Spacer for Header */}
      <div className="relative z-20 pt-16" />

      {/* Main Refined Minimal Content Overlay */}
      <motion.div
        style={{ opacity: opacityContent }}
        className="relative z-20 max-w-4xl mx-auto text-center flex flex-col items-center my-auto px-4"
      >
        <motion.span
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xs sm:text-sm uppercase tracking-[0.4em] text-white/90 font-sans-clean mb-4 font-light"
        >
          FINE ART WEDDING STUDIO
        </motion.span>

        {/* Reduced Headline Size for Ultra-Elegant Framing */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif-primary text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.02em] font-light leading-[1.08] text-white max-w-3xl"
        >
          {settings.heroTitle.split("\n").map((line, lIdx) => (
            <React.Fragment key={lIdx}>
              {line}
              {lIdx < settings.heroTitle.split("\n").length - 1 && <br className="hidden sm:block" />}
            </React.Fragment>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="font-sans-clean text-xs sm:text-sm tracking-[0.18em] text-zinc-200 max-w-md mt-6 leading-relaxed font-light uppercase"
        >
          {settings.heroSubtitle}
        </motion.p>

        {/* Minimal Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex items-center gap-5 mt-8"
        >
          <a
            href="#films"
            data-cursor="view"
            className="px-8 py-3.5 rounded-full bg-amber-200 text-zinc-950 text-xs uppercase tracking-[0.22em] font-semibold transition-all duration-300 hover:bg-white hover:scale-105 shadow-lg"
          >
            Explore Films
          </a>

          <button
            onClick={onOpenBooking}
            data-cursor="book"
            className="px-8 py-3.5 rounded-full glass-panel-taupe-dark text-white border border-white/20 text-xs uppercase tracking-[0.22em] font-medium transition-all duration-300 hover:border-white hover:text-white"
          >
            Inquire Date
          </button>
        </motion.div>

        {/* 3-Second Slide Progress Indicator Bars */}
        <div className="flex items-center gap-2.5 mt-8">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className="group relative h-1 rounded-full overflow-hidden transition-all duration-500"
              style={{ width: currentSlide === idx ? "40px" : "16px" }}
              aria-label={`Go to slide ${idx + 1}`}
            >
              <div
                className={`absolute inset-0 rounded-full transition-colors duration-500 ${
                  currentSlide === idx ? "bg-amber-200" : "bg-white/30 group-hover:bg-white/60"
                }`}
              />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Bottom Minimal Bar */}
      <div className="relative z-20 flex justify-between items-end text-[10px] uppercase tracking-[0.3em] text-amber-200/70 font-sans-clean">
        <div className="hidden sm:block">
          <span>LEICA & HASSELBLAD OPTICS</span>
        </div>

        <a
          href="#portfolio"
          className="mx-auto sm:mx-0 flex items-center gap-2 text-zinc-300 hover:text-amber-200 transition-colors"
        >
          <span>SCROLL DOWN</span>
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
        </a>

        <div className="hidden sm:block text-right">
          <span>DESTINATION CINEMA</span>
        </div>
      </div>
    </section>
  );
}
