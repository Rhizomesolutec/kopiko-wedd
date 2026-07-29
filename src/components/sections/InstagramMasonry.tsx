"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Eye } from "lucide-react";

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

export interface InstaGridItem {
  id: string;
  image: string;
  caption: string;
  likes: string;
  views: string;
  location: string;
  postUrl: string;
}

const instaItems: InstaGridItem[] = [
  {
    id: "ig1",
    image: "/showcase/insta-post-1.jpg",
    caption: "Timeless luxury wedding stories framed as high art.",
    likes: "341",
    views: "",
    location: "Kerala",
    postUrl: "https://www.instagram.com/p/DRhxJuKk153/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
  },
  {
    id: "ig2",
    image: "/showcase/insta-post-2.jpg",
    caption: "Candid emotional depth captured on medium format optics.",
    likes: "874",
    views: "",
    location: "Kerala, India",
    postUrl: "https://www.instagram.com/p/DXcPq5qE6to/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
  },
  {
    id: "ig3",
    image: "/showcase/insta-post-3.jpg",
    caption: "Whispers of sacred vows and architectural beauty.",
    likes: "2,245",
    views: "",
    location: "Kunnathur Mana Heritage",
    postUrl: "https://www.instagram.com/p/DMX90muTELG/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
  },
  {
    id: "ig4",
    image: "/showcase/insta-post-4.jpg",
    caption: "Sacred heritage, rich shadows, and romantic twilights.",
    likes: "3,259",
    views: "",
    location: "Angamaly, India",
    postUrl: "https://www.instagram.com/p/DaAicT-nYcZ/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
  },
  {
    id: "ig5",
    image: "/showcase/insta-post-5.jpg",
    caption: "Anticipating unscripted embraces and genuine smiles.",
    likes: "417",
    views: "",
    location: "Kerala",
    postUrl: "https://www.instagram.com/p/DadFEtNE6ip/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
  },
  {
    id: "ig6",
    image: "/showcase/insta-post-6.jpg",
    caption: "Cinematic grandeur and editorial fine-art framing.",
    likes: "529",
    views: "",
    location: "Kerala",
    postUrl: "https://www.instagram.com/p/DUA87iFkwG8/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
  },
];

export default function InstagramMasonry() {
  const [visibleCount] = useState(6);

  return (
    <section className="py-28 md:py-36 bg-[#5e594d] text-white px-6 md:px-12 relative border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <span className="text-xs uppercase tracking-[0.35em] text-white font-sans-clean flex items-center gap-2">
              <InstagramIcon className="w-3.5 h-3.5 text-white" /> Live Journal & Feed
            </span>
            <h2 className="font-serif-primary text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-white mt-2">
              Follow Our Visual Journey
            </h2>
          </div>
          <a
            href="https://www.instagram.com/kopikowedd.in?igsh=MWxubzJoZGh4MHJsaA=="
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="hover"
            className="mt-4 md:mt-0 text-xs uppercase tracking-[0.25em] font-semibold text-white hover:text-white transition-colors flex items-center gap-2"
          >
            <span>@KopikoWeddings</span>
            <InstagramIcon className="w-4 h-4" />
          </a>
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {instaItems.slice(0, visibleCount).map((item, index) => (
            <motion.a
              href={item.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              key={item.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              className="block relative group rounded-2xl overflow-hidden bg-[#464239] shadow-md hover:shadow-2xl transition-all duration-500 break-inside-avoid border border-white/10"
              data-cursor="view"
            >
              <div className="relative w-full aspect-[4/5]">
                <Image
                  src={item.image}
                  alt={item.caption}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2d2a24]/90 via-[#2d2a24]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end text-white">
                  <div className="flex items-center gap-4 text-white text-xs font-semibold mb-2">
                    <span className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4 fill-white" /> {item.likes} Likes
                    </span>
                    {item.views && (
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4 fill-white" /> {item.views} Views
                      </span>
                    )}
                  </div>
                  <p className="font-sans-clean text-xs text-zinc-200 leading-relaxed font-light mb-2">
                    {item.caption}
                  </p>
                  <span className="text-[9px] uppercase tracking-[0.25em] text-white font-sans-clean">
                    📍 {item.location}
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
