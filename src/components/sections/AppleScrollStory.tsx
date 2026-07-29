"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Camera, Aperture, Sparkles } from "lucide-react";

export default function AppleScrollStory() {
  const targetRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const scaleCard = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 0.96]);
  const imageOpacity1 = useTransform(scrollYProgress, [0, 0.35, 0.45], [1, 1, 0]);
  const imageOpacity2 = useTransform(scrollYProgress, [0.45, 0.5, 0.8], [0, 1, 0]);
  const imageOpacity3 = useTransform(scrollYProgress, [0.8, 0.85, 1], [0, 1, 1]);

  const textOpacity1 = useTransform(scrollYProgress, [0, 0.25, 0.35], [1, 1, 0]);
  const textOpacity2 = useTransform(scrollYProgress, [0.35, 0.5, 0.75], [0, 1, 0]);
  const textOpacity3 = useTransform(scrollYProgress, [0.75, 0.85, 1], [0, 1, 1]);

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-[#2d2a24] text-white">
      {/* Sticky Container */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden p-6 md:p-12">
        {/* Viewfinder Card */}
        <motion.div
          style={{ scale: scaleCard }}
          className="relative w-full max-w-6xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-[#464239]"
        >
          {/* Layer 1 Image */}
          <motion.div style={{ opacity: imageOpacity1 }} className="absolute inset-0">
            <Image
              src="/showcase/Traditional Wedd/KOPIKO WEDD.IN-117.jpg"
              alt="Traditional Royal Wedding Ceremony"
              fill
              priority
              className="object-cover filter brightness-[0.72]"
            />
          </motion.div>

          {/* Layer 2 Image */}
          <motion.div style={{ opacity: imageOpacity2 }} className="absolute inset-0">
            <Image
              src="/showcase/North indian/YCM00193.jpg"
              alt="North Indian Grand Wedding"
              fill
              className="object-cover filter brightness-[0.72]"
            />
          </motion.div>

          {/* Layer 3 Image */}
          <motion.div style={{ opacity: imageOpacity3 }} className="absolute inset-0">
            <Image
              src="/showcase/Pre-Wedding/ASD06285.jpg"
              alt="Editorial Pre-Wedding Vignette"
              fill
              className="object-cover filter brightness-[0.72]"
            />
          </motion.div>

          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2d2a24]/90 via-transparent to-[#2d2a24]/60 pointer-events-none" />

          {/* Leica Viewfinder Frame HUD */}
          <div className="absolute inset-6 md:inset-10 border border-white/30 rounded-2xl pointer-events-none p-6 flex flex-col justify-between z-10">
            <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.3em] text-white/80 font-sans-clean">
              <span className="flex items-center gap-1.5"><Camera className="w-3.5 h-3.5" /> LEICA M11 MONOCHROM</span>
              <span>KOPIKO REEL</span>
            </div>

            <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.3em] text-white/80 font-sans-clean">
              <span className="flex items-center gap-1.5"><Aperture className="w-3.5 h-3.5" /> 50mm f/1.2 NOCTILUX</span>
              <span>1/8000s • ISO 64</span>
            </div>
          </div>

          {/* Story Slide 1 Content - TOP LEFT ALIGNED */}
          <motion.div
            style={{ opacity: textOpacity1 }}
            className="absolute inset-0 flex flex-col items-start justify-start p-10 md:p-20 text-left z-20"
          >
            <span className="text-[10px] uppercase tracking-[0.35em] text-white mb-2 font-sans-clean flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-white" /> SACRED HERITAGE
            </span>
            <h2 className="font-serif-primary text-4xl sm:text-5xl md:text-6xl font-light tracking-wide text-white">
              Traditional <br />
              Grandeur
            </h2>
          </motion.div>

          {/* Story Slide 2 Content - BOTTOM RIGHT ALIGNED */}
          <motion.div
            style={{ opacity: textOpacity2 }}
            className="absolute inset-0 flex flex-col items-end justify-end p-10 md:p-20 text-right z-20"
          >
            <span className="text-[10px] uppercase tracking-[0.35em] text-white mb-2 font-sans-clean flex items-center gap-1.5 justify-end">
              <Sparkles className="w-3 h-3 text-white" /> VIBRANT CELEBRATIONS
            </span>
            <h2 className="font-serif-primary text-4xl sm:text-5xl md:text-6xl font-light tracking-wide text-white">
              Unscripted <br />
              Royalty
            </h2>
          </motion.div>

          {/* Story Slide 3 Content - BOTTOM LEFT ALIGNED */}
          <motion.div
            style={{ opacity: textOpacity3 }}
            className="absolute inset-0 flex flex-col items-start justify-end p-10 md:p-20 text-left z-20"
          >
            <span className="text-[10px] uppercase tracking-[0.35em] text-white mb-2 font-sans-clean flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-white" /> POETIC ROMANCE
            </span>
            <h2 className="font-serif-primary text-4xl sm:text-5xl md:text-6xl font-light tracking-wide text-white">
              Framing Love <br />
              As Art
            </h2>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
