"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";

interface HeaderProps {
  onOpenBooking: () => void;
}

export default function Header({ onOpenBooking }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Films", href: "#films" },
    { label: "Stories", href: "#stories" },
    { label: "Services", href: "#services" },
    { label: "About", href: "#about" },
    { label: "Press & Praise", href: "#testimonials" },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "py-3 glass-panel-taupe-dark shadow-[0_4px_30px_rgba(0,0,0,0.15)] border-b border-white/10"
            : "py-6 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3.5 group relative z-10">
            <div className="relative w-11 h-11 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-amber-200/40 shadow-md transition-transform duration-500 group-hover:scale-105">
              <Image
                src="/showcase/kopiko-logo.jpeg"
                alt="KOPIKO Weddings Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif-primary text-xl md:text-2xl tracking-[0.18em] font-semibold text-white uppercase">
                KOPIKO
              </span>
              <span className="text-[9px] tracking-[0.3em] text-amber-200/80 uppercase font-sans-clean -mt-1 font-light">
                Framing love as art
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs uppercase tracking-[0.2em] font-medium text-zinc-200 hover:text-amber-200 transition-colors relative py-1 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-amber-300 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-4">
            <button
              onClick={onOpenBooking}
              data-cursor="book"
              className="relative group overflow-hidden rounded-full border border-amber-200/60 px-6 py-2.5 text-xs tracking-[0.2em] uppercase font-semibold text-white transition-all duration-500 hover:text-zinc-950"
            >
              <span className="absolute inset-0 w-full h-full bg-amber-300 transition-transform duration-500 ease-out translate-y-full group-hover:translate-y-0" />
              <span className="relative z-10 flex items-center gap-2">
                Inquire & Book
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white focus:outline-none z-50"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Editorial Overlay Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-[#2d2a24] text-white flex flex-col justify-between p-8 md:p-16"
          >
            <div className="pt-20">
              <p className="text-xs uppercase tracking-[0.3em] text-amber-300/90 mb-8 font-sans-clean">
                Framing Love As Art
              </p>
              <div className="flex flex-col gap-6">
                {navLinks.map((link, idx) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx, duration: 0.5 }}
                    className="font-serif-primary text-4xl md:text-5xl font-light hover:text-amber-200 transition-colors flex items-center justify-between group"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.a>
                ))}
              </div>
            </div>

            <div className="border-t border-white/15 pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-300 mb-1">Direct Inquiries</p>
                <p className="font-serif-primary text-xl text-amber-200">hello@kopiko-weddings.com</p>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="w-full sm:w-auto bg-amber-300 text-zinc-950 px-8 py-4 rounded-full font-semibold uppercase tracking-[0.2em] text-xs"
              >
                Reserve Your Date
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
