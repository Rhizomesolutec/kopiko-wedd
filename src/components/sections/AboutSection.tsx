"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Camera, Sparkles, Award, ArrowUpRight } from "lucide-react";

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function AboutSection() {
  return (
    <section id="about" className="py-28 md:py-36 bg-[#f6f4ee] text-zinc-950 px-6 md:px-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Portrait Image Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden shadow-2xl bg-[#edeadf] border border-[#c7beab]/40">
              <Image
                src="/showcase/prewed.jpeg"
                alt="Lead Photographer & Creative Director"
                fill
                className="object-cover filter contrast-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2d2a24]/60 via-transparent to-transparent" />

              {/* Leica Badge */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl glass-panel-cream flex items-center justify-between text-zinc-900 border border-[#c7beab]/50 shadow-md">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#8c826b] font-sans-clean block font-semibold">
                    Optics & Aesthetic
                  </span>
                  <span className="font-serif-primary text-lg font-medium text-[#3a372f]">
                    Leica M & Hasselblad Medium Format
                  </span>
                </div>
                <div className="p-2.5 rounded-full bg-[#5e594d] text-amber-200">
                  <Camera className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Decorative Offset Gold Frame */}
            <div className="absolute -bottom-4 -right-4 w-full h-full border border-[#8c826b]/40 rounded-3xl -z-10 hidden sm:block" />
          </motion.div>

          {/* Bio & Brand Philosophy */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <span className="text-xs uppercase tracking-[0.35em] text-[#8c826b] font-sans-clean flex items-center gap-2 mb-3 font-semibold">
              <Sparkles className="w-4 h-4 text-[#8c826b]" /> Framing Love As Art
            </span>

            <h2 className="font-serif-primary text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-zinc-900 leading-tight mb-8">
              Documenting Love & Growing Families
            </h2>

            <p className="font-sans-clean text-xs md:text-sm text-zinc-700 leading-relaxed tracking-wide font-light mb-6">
              Founded on the belief that a wedding is not a photo shoot, but a sacred gathering of emotion, heritage, and quiet romance. We observe rather than direct, anticipating authentic laughter, tearful embraces, and cinematic light.
            </p>

            <p className="font-sans-clean text-xs md:text-sm text-zinc-700 leading-relaxed tracking-wide font-light mb-8">
              Our work has been featured across premier luxury wedding publications worldwide. Beyond wedding narratives, we capture maternity, family, and childhood milestones through our sister brand, <a href="https://www.instagram.com/p/DZ7BvV1E6aG/?igsh=MTlmNWtkaWF1ZmFsMw==" target="_blank" rel="noopener noreferrer" className="text-[#8c826b] hover:text-[#5e594d] underline font-semibold transition-colors">kopikokidd</a>, framing every new chapter with the same artistic depth.
            </p>

            {/* Accolade Badges */}
            <div className="grid grid-cols-2 gap-6 w-full border-t border-[#c7beab]/40 pt-8 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-[#edeadf] text-[#5e594d]">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-serif-primary text-lg text-zinc-950 font-medium">Vogue Weddings</h5>
                  <p className="text-[10px] uppercase tracking-widest text-[#8c826b] font-sans-clean">
                    Featured Studio
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-[#edeadf] text-[#5e594d]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-serif-primary text-lg text-zinc-950 font-medium">Leica Ambassador</h5>
                  <p className="text-[10px] uppercase tracking-widest text-[#8c826b] font-sans-clean">
                    Fine Art Optics
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Row: Signature & Instagram Card */}
            <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pt-6 border-t border-[#c7beab]/30 mt-6">
              {/* Signature Graphic Mockup */}
              <div className="flex flex-col items-start">
                <span className="font-serif-italic text-3xl text-[#3a372f] tracking-wider">
                  Kopiko Wedding Studio
                </span>
              </div>

              {/* Instagram Card for kopikokidd */}
              <a
                href="https://www.instagram.com/p/DZ7BvV1E6aG/?igsh=MTlmNWtkaWF1ZmFsMw=="
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-2.5 pr-4 rounded-xl bg-[#edeadf]/80 hover:bg-[#e4e1d5] border border-[#c7beab]/50 transition-all duration-300 shadow-sm max-w-[240px] hover:-translate-y-0.5"
              >
                <div className="w-8 h-8 rounded-lg bg-[#5e594d] flex items-center justify-center text-amber-100 group-hover:bg-[#8c826b] transition-colors duration-300">
                  <InstagramIcon className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-sans-clean uppercase tracking-wider text-[#8c826b] font-semibold">
                    Sister Studio
                  </span>
                  <span className="text-xs font-sans-clean font-bold text-zinc-950 flex items-center gap-1">
                    @kopikokidd
                    <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
