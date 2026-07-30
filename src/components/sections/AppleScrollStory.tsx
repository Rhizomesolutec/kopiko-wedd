"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Aperture, Sparkles } from "lucide-react";

export default function AppleScrollStory() {
  const [activeIdx, setActiveIdx] = useState(0);

  const slides = [
    {
      id: 0,
      image: "/showcase/Traditional Wedd/DSC09570.jpg",
      tag: "SACRED HERITAGE",
      title: <>Traditional <br /> Grandeur</>,
      layoutClass: "items-start justify-start text-left",
      tagClass: "justify-start",
      positionClass: "object-center",
    },
    {
      id: 1,
      image: "/showcase/Pre-Wedding/ASD06285.jpg",
      tag: "POETIC ROMANCE",
      title: <>Framing Love <br /> As Art</>,
      layoutClass: "items-start justify-end text-left",
      tagClass: "justify-start",
      positionClass: "object-center",
    },
    {
      id: 2,
      image: "/showcase/Pre-Wedding/AJI04083.jpg",
      tag: "CINEMATIC ESSENCE",
      title: <>Timeless <br /> Portraits</>,
      layoutClass: "items-end justify-start text-right",
      tagClass: "justify-end",
      positionClass: "object-[center_85%]",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 md:py-32 bg-[#2d2a24] text-white flex items-center justify-center px-6 md:px-12 relative border-b border-white/5">
      {/* Viewfinder Card */}
      <div className="relative w-full max-w-6xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-[#464239]">
        {/* Continuous Looping Slider Stack */}
        {slides.map((slide, idx) => {
          const isActive = idx === activeIdx;
          const isPrevious = idx === (activeIdx - 1 + slides.length) % slides.length;
          
          let xValue = "100%";
          if (isActive) {
            xValue = "0%";
          } else if (isPrevious) {
            xValue = "-100%";
          }

          let imageXValue = "-18%";
          if (isActive) {
            imageXValue = "0%";
          } else if (isPrevious) {
            imageXValue = "18%";
          }

          const isVisible = isActive || isPrevious;

          return (
            <motion.div
              key={slide.id}
              initial={false}
              animate={{
                x: xValue,
                opacity: isVisible ? 1 : 0
              }}
              transition={{
                x: { duration: 1.4, ease: [0.76, 0, 0.24, 1] },
                opacity: { duration: 0.4 }
              }}
              className="absolute inset-0 w-full h-full overflow-hidden"
              style={{
                zIndex: isActive ? 10 : 5,
                pointerEvents: isActive ? "auto" : "none",
              }}
            >
              {/* Parallax Image */}
              <motion.div
                animate={{ x: imageXValue }}
                transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1] }}
                className="absolute inset-0 w-[120%] h-full -left-[10%]"
              >
                <Image
                  src={slide.image}
                  alt={slide.tag}
                  fill
                  className={`object-cover filter brightness-[0.72] ${slide.positionClass}`}
                  priority={idx === 0}
                />
              </motion.div>

              {/* Text Content Overlay */}
              <div className={`absolute inset-0 flex flex-col px-8 py-14 md:p-20 z-20 ${slide.layoutClass}`}>
                <motion.div
                  animate={{
                    opacity: isActive ? 1 : 0,
                    y: isActive ? 0 : 25,
                  }}
                  transition={{
                    duration: 0.8,
                    delay: isActive ? 0.5 : 0,
                    ease: "easeOut",
                  }}
                  className="flex flex-col"
                >
                  <span className={`text-[10px] uppercase tracking-[0.35em] text-white mb-2 font-sans-clean flex items-center gap-1.5 ${slide.tagClass}`}>
                    <Sparkles className="w-3 h-3 text-white" /> {slide.tag}
                  </span>
                  <h2 className="font-serif-primary text-2xl sm:text-5xl md:text-6xl font-light tracking-wide text-white leading-tight">
                    {slide.title}
                  </h2>
                </motion.div>
              </div>
            </motion.div>
          );
        })}

        {/* Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2d2a24]/90 via-transparent to-[#2d2a24]/60 pointer-events-none z-10" />

        {/* Leica Viewfinder Frame HUD */}
        <div className="absolute inset-4 md:inset-10 border border-white/30 rounded-2xl pointer-events-none p-4 md:p-6 flex flex-col justify-between z-10">
          <div className="flex justify-between items-center text-[8px] md:text-[10px] uppercase tracking-[0.3em] text-white/80 font-sans-clean">
            <span className="flex items-center gap-1 sm:gap-1.5"><Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> LEICA M11 MONOCHROM</span>
            <span>KOPIKO REEL</span>
          </div>

          <div className="flex justify-between items-center text-[8px] md:text-[10px] uppercase tracking-[0.3em] text-white/80 font-sans-clean">
            <span className="flex items-center gap-1 sm:gap-1.5"><Aperture className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> 50mm f/1.2 NOCTILUX</span>
            <span>1/8000s • ISO 64</span>
          </div>
        </div>
      </div>
    </section>
  );
}
