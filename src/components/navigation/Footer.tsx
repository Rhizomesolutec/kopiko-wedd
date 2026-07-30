"use client";

import React from "react";
import Image from "next/image";
import { ArrowUp, Send } from "lucide-react";

interface FooterProps {
  onOpenBooking: () => void;
}

export default function Footer({ onOpenBooking }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#2d2a24] text-white pt-24 pb-12 border-t border-white/10 px-6 md:px-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Layout */}
        <div className="py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Brand & Mission */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <div className="flex items-center gap-3.5 mb-6">
              {/* Rounded Logo Symbol */}
              <div className="relative w-11 h-11 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-amber-200/40 shadow-md shrink-0">
                <Image
                  src="/showcase/kopiko-logo.jpeg"
                  alt="KOPIKO Symbol"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Horizontal Logo Wordmark & Tagline Group */}
              <div className="flex flex-col items-start gap-1">
                <div className="relative w-32 h-[30px]">
                  <Image src="/showcase/kopiko.png" alt="KOPIKO" fill className="object-contain" />
                </div>
                <span className="text-[9px] tracking-[0.25em] text-zinc-400 uppercase font-sans-clean font-light pl-1 -mt-0.5">
                  framing love as art.
                </span>
              </div>
            </div>

            <p className="font-sans-clean text-xs md:text-sm text-zinc-300 font-light leading-relaxed max-w-sm mb-8 mt-2">
              Documenting luxury weddings worldwide with an Apple-level visual rhythm, Leica optics, and timeless fine art cinema.
            </p>

            <button
              onClick={onOpenBooking}
              data-cursor="book"
              className="px-8 py-3.5 rounded-full bg-amber-300 text-zinc-950 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-amber-200 transition-colors shadow-md"
            >
              Reserve Your Wedding Date
            </button>
          </div>

          {/* Quick Links & Locations */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <span className="text-xs uppercase tracking-[0.3em] text-amber-300 font-sans-clean mb-2">
              Sitemap
            </span>
            <a href="#films" className="text-xs uppercase tracking-[0.2em] text-zinc-300 hover:text-amber-200 transition-colors">
              Cinematic Films
            </a>
            <a href="#stories" className="text-xs uppercase tracking-[0.2em] text-zinc-300 hover:text-amber-200 transition-colors">
              Featured Narratives
            </a>
            <a href="#services" className="text-xs uppercase tracking-[0.2em] text-zinc-300 hover:text-amber-200 transition-colors">
              Services & Pricing
            </a>
            <a href="#about" className="text-xs uppercase tracking-[0.2em] text-zinc-300 hover:text-amber-200 transition-colors">
              Studio Philosophy
            </a>
          </div>

          {/* Newsletter Signup */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <span className="text-xs uppercase tracking-[0.3em] text-amber-300 font-sans-clean mb-2">
              Private Journal Subscription
            </span>
            <p className="font-sans-clean text-xs text-zinc-300 font-light leading-relaxed mb-4">
              Receive curated travel guides, fine art print releases, and exclusive wedding insights.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="w-full flex gap-2">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full px-4 py-3 rounded-full bg-white/10 border border-white/15 text-white placeholder-zinc-400 text-xs focus:outline-none focus:border-amber-300"
              />
              <button
                type="submit"
                className="p-3 rounded-full bg-amber-300 text-zinc-950 hover:bg-amber-200 transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Rights & Scroll to Top */}
        <div className="pt-8 border-t border-white/15 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.25em] text-amber-200/60 font-sans-clean">
          <div>
            © {new Date().getFullYear()} KOPIKO Wedding Studios. Framing love as art.
          </div>

          <div className="flex items-center gap-6">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-amber-200 transition-colors">
              Instagram
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-amber-200 transition-colors">
              YouTube
            </a>
            <a href="https://vimeo.com" target="_blank" rel="noopener noreferrer" className="hover:text-amber-200 transition-colors">
              Vimeo
            </a>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
          >
            <span>Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
