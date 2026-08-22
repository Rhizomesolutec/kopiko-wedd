"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowUp, Send } from "lucide-react";
import toast from "react-hot-toast";

interface FooterProps {
  onOpenBooking: () => void;
}

export default function Footer({ onOpenBooking }: FooterProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Journal Subscriber",
          email,
          phone: "0000000000",
          message: "Subscribed to Private Journal Newsletter subscription.",
        }),
      });

      if (res.ok) {
        setSubscribed(true);
        setEmail("");
        toast.success("Subscribed successfully!");
      } else {
        toast.error("Failed to subscribe. Please try again.");
      }
    } catch (err) {
      toast.error("Failed to subscribe due to connection error.");
    }
  };

  return (
    <footer className="bg-[#2d2a24] text-white pt-14 sm:pt-20 md:pt-24 pb-10 sm:pb-12 border-t border-white/10 px-4 sm:px-6 md:px-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Layout — landscape (2-col) on mobile, 12-col on desktop */}
        <div className="py-10 sm:py-14 lg:py-20 grid grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-12 items-start">
          {/* Brand & Mission */}
          <div className="col-span-2 lg:col-span-5 flex flex-col items-start">
            <div className="flex items-center gap-3 sm:gap-3.5 mb-4 sm:mb-6">
              {/* Rounded Logo Symbol */}
              <div className="relative w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-amber-200/40 shadow-md shrink-0">
                <Image
                  src="/showcase/kopiko-logo.jpeg"
                  alt="KOPIKO Symbol"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Horizontal Logo Wordmark & Tagline Group */}
              <div className="flex flex-col items-start gap-1">
                <div className="relative w-28 sm:w-32 h-[26px] sm:h-[30px]">
                  <Image src="/showcase/kopiko.png" alt="KOPIKO" fill className="object-contain" />
                </div>
                <span className="text-[8px] sm:text-[9px] tracking-[0.25em] text-zinc-400 uppercase font-sans-clean font-light pl-1 -mt-0.5">
                  framing love as art.
                </span>
              </div>
            </div>

            <p className="font-sans-clean text-[11px] sm:text-xs md:text-sm text-zinc-300 font-light leading-relaxed max-w-sm mb-5 sm:mb-8 mt-1 sm:mt-2">
              Documenting luxury weddings worldwide with an Apple-level visual rhythm, Leica optics, and timeless fine art cinema.
            </p>

            <button
              onClick={onOpenBooking}
              data-cursor="book"
              className="px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-full bg-amber-300 text-zinc-950 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-semibold hover:bg-amber-200 transition-colors shadow-md"
            >
              Reserve Your Wedding Date
            </button>
          </div>

          {/* Quick Links & Locations */}
          <div className="col-span-1 lg:col-span-3 flex flex-col gap-2.5 sm:gap-4">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-amber-300 font-sans-clean mb-1 sm:mb-2">
              Sitemap
            </span>
            <a href="#films" className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-zinc-300 hover:text-amber-200 transition-colors">
              Cinematic Films
            </a>
            <a href="#stories" className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-zinc-300 hover:text-amber-200 transition-colors">
              Featured Narratives
            </a>
            <a href="#services" className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-zinc-300 hover:text-amber-200 transition-colors">
              Services & Pricing
            </a>
            <a href="#about" className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-zinc-300 hover:text-amber-200 transition-colors">
              Studio Philosophy
            </a>
          </div>

          {/* Newsletter Signup */}
          <div className="col-span-1 lg:col-span-4 flex flex-col items-start">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-amber-300 font-sans-clean mb-1 sm:mb-2">
              Private Journal
            </span>
            <p className="font-sans-clean text-[10px] sm:text-xs text-zinc-300 font-light leading-relaxed mb-3 sm:mb-4">
              Curated travel guides, fine art prints, and wedding insights.
            </p>
            {subscribed ? (
              <p className="font-sans-clean text-[10px] sm:text-xs text-amber-200/90 font-light mt-2 animate-pulse-slow">
                ✓ Thank you for subscribing!
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="w-full flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 rounded-full bg-white/10 border border-white/15 text-white placeholder-zinc-400 text-[10px] sm:text-xs focus:outline-none focus:border-amber-300"
                />
                <button
                  type="submit"
                  className="p-2.5 sm:p-3 rounded-full bg-amber-300 text-zinc-950 hover:bg-amber-200 transition-colors shrink-0 self-start"
                >
                  <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Rights & Scroll to Top */}
        <div className="pt-6 sm:pt-8 border-t border-white/15 flex flex-row flex-wrap justify-between items-center gap-3 sm:gap-4 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-amber-200/60 font-sans-clean">
          <div className="order-1">
            © {new Date().getFullYear()} KOPIKO Wedding Studios.
          </div>

          <div className="flex items-center gap-4 sm:gap-6 order-3 sm:order-2 w-full sm:w-auto justify-center sm:justify-start">
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
            className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors order-2 sm:order-3"
          >
            <span>Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
