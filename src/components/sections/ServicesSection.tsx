"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Camera, Film, Globe, Sparkles, BookOpen } from "lucide-react";

interface ServicesSectionProps {
  onOpenBooking: () => void;
}

export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  highlights: string[];
  image: string;
}

const servicesData: ServiceItem[] = [
  {
    id: "s1",
    title: "Editorial Wedding Photography",
    category: "Full Day & Multi-Day Coverage",
    description: "Complete documentation of your wedding story, framing love as art by combining candid moments with editorial portraits.",
    icon: <Camera className="w-5 h-5 text-white" />,
    highlights: ["2 Principal Photographers", "High-Resolution Edited Digital Master", "35mm Analog Film Roll Highlights", "Online Private Client Gallery"],
    image: "/showcase/hero.jpeg",
  },
  {
    id: "s2",
    title: "Cinematic Wedding Films",
    category: "Anamorphic Cinema & Sound Design",
    description: "Heartwarming short films and feature-length cinema edit, mixed with custom sound engineering and aerial cinematography.",
    icon: <Film className="w-5 h-5 text-white" />,
    highlights: ["8K Anamorphic Cinema Cameras", "Licensed Soundtrack Scoring", "Speeches & Ceremony Audio Master", "Teaser Reel within 72 Hours"],
    image: "/showcase/video.jpeg",
  },
  {
    id: "s3",
    title: "Global Destination Weddings",
    category: "Worldwide Travel Logistics",
    description: "Specialized in multi-day destination celebrations across Europe, Asia, Americas, and exotic luxury resorts.",
    icon: <Globe className="w-5 h-5 text-white" />,
    highlights: ["Welcome Dinner & Farewell Brunch", "All Travel & Accommodation Managed", "Location & Sunset Scouting", "Multilingual Crew"],
    image: "/showcase/prewed.jpeg",
  },
  {
    id: "s4",
    title: "Handbound Heirloom Albums",
    category: "Tuscan Leather Fine Art Printmaking",
    description: "Bespoke physical albums printed on museum-grade archival paper and bound in genuine Italian leather or fine linen.",
    icon: <BookOpen className="w-5 h-5 text-white" />,
    highlights: ["Italian Tuscan Nappa Leather", "Archival Matte Fine Art Paper", "Custom Foil Embossing", "Lifetime Craft Guarantee"],
    image: "/showcase/album.jpeg",
  },
];

export default function ServicesSection({ onOpenBooking }: ServicesSectionProps) {
  return (
    <section id="services" className="py-28 md:py-36 bg-[#5e594d] text-white px-6 md:px-12 relative border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20">
          <div>
            <span className="text-xs uppercase tracking-[0.35em] text-white font-sans-clean flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Curated Offerings
            </span>
            <h2 className="font-serif-primary text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-white mt-2">
              Services & Collections
            </h2>
          </div>
          <button
            onClick={onOpenBooking}
            data-cursor="book"
            className="mt-6 md:mt-0 px-8 py-3.5 rounded-full glass-panel-taupe-dark text-white border border-white/20 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-white hover:text-zinc-950 transition-all duration-300"
          >
            Inquire For Details
          </button>
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {servicesData.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onClick={onOpenBooking}
              className="group relative rounded-3xl overflow-hidden glass-panel-taupe-dark border border-white/10 p-8 md:p-10 flex flex-col justify-between hover:border-white/30 transition-all duration-500 cursor-pointer"
            >
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-300 font-sans-clean block mb-4">
                  {service.category}
                </span>
                <h3 className="font-serif-primary text-3xl md:text-4xl font-light text-white group-hover:text-amber-200 transition-colors mb-4">
                  {service.title}
                </h3>
                <p className="font-sans-clean text-xs md:text-sm text-zinc-300 leading-relaxed font-light">
                  {service.description}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-white/60 group-hover:text-white transition-colors mt-8">
                <span>Learn More</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
