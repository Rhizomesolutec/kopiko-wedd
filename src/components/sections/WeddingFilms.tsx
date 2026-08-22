"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, Film, Volume2, VolumeX, Sparkles } from "lucide-react";

export interface FilmItem {
  _id?: string;
  id: string;
  couple: string;
  location: string;
  duration: string;
  thumbnail: string;
  description: string;
  videoUrl?: string;
  youtubeId?: string;
  hidden?: boolean;
}

const filmsData: FilmItem[] = [
  {
    id: "f1",
    couple: "Aishwarya & Gokul",
    location: "Lake Como, Italy",
    duration: "3:56 MINS",
    youtubeId: "5cDyHeP8HfA",
    videoUrl: "https://youtu.be/5cDyHeP8HfA?si=MjrflC0TIjxskyQc",
    thumbnail: "https://img.youtube.com/vi/5cDyHeP8HfA/maxresdefault.jpg",
    description:
      "An intimate weekend celebration along Lake Como featuring hand-curated acoustic scoring and 8K anamorphic cinematography.",
  },
  {
    id: "f2",
    couple: "Sona & Harishanker",
    location: "Château de Chantilly, France",
    duration: "5:03 MINS",
    youtubeId: "O8ySRo6MOZk",
    videoUrl: "https://youtu.be/O8ySRo6MOZk?si=INyBx7z3sOHPEDaY",
    thumbnail: "https://img.youtube.com/vi/O8ySRo6MOZk/maxresdefault.jpg",
    description:
      "Grand French palace wedding wrapped in golden hour romance, vintage 35mm film cuts, and emotional vows.",
  },
];

function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  try {
    if (url.includes("youtu.be/")) {
      return url.split("youtu.be/")[1]?.split(/[?&]/)[0] || null;
    }
    if (url.includes("v=")) {
      return url.split("v=")[1]?.split("&")[0] || null;
    }
    if (url.includes("/embed/")) {
      return url.split("/embed/")[1]?.split(/[?&]/)[0] || null;
    }
  } catch {
    return null;
  }
  return null;
}

function youtubeThumbnail(id: string) {
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

function isExternalVideoUrl(url?: string) {
  if (!url) return false;
  return url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com");
}

function FilmCardThumbnail({
  thumbnail,
  couple,
  duration,
}: {
  thumbnail: string;
  couple: string;
  duration: string;
}) {
  return (
    <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#464239]">
      <Image
        src={thumbnail}
        alt={couple}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover filter brightness-[0.85] group-hover:brightness-100 group-hover:scale-105 transition-all duration-700 ease-out"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#2d2a24] via-transparent to-transparent opacity-80 pointer-events-none" />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-amber-300 text-zinc-950 flex items-center justify-center shadow-[0_0_40px_rgba(203,182,142,0.6)] transition-transform duration-500 group-hover:scale-110">
          <Play className="w-7 h-7 fill-zinc-950 ml-1" />
        </div>
      </div>

      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] uppercase tracking-[0.2em] text-white border border-white/10 font-sans-clean z-10">
        {duration}
      </div>
    </div>
  );
}

export default function WeddingFilms() {
  const [activeFilm, setActiveFilm] = useState<FilmItem | null>(null);
  const [films, setFilms] = useState<FilmItem[]>(filmsData);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    async function loadFilms() {
      try {
        const res = await fetch("/api/films");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            // Keep display order as curated defaults (first / second cards),
            // while merging any extra API metadata when couple names match.
            const merged = filmsData.map((fallback, index) => {
              const fromApi =
                data.find((f: FilmItem) => f.couple === fallback.couple) || data[index];
              const youtubeId =
                fallback.youtubeId ||
                extractYouTubeId(fallback.videoUrl) ||
                extractYouTubeId(fromApi?.videoUrl) ||
                undefined;
              return {
                ...fromApi,
                ...fallback,
                _id: fromApi?._id,
                youtubeId,
                videoUrl: fallback.videoUrl || fromApi?.videoUrl,
                thumbnail: youtubeId
                  ? youtubeThumbnail(youtubeId)
                  : fallback.thumbnail || fromApi?.thumbnail,
              } as FilmItem;
            });
            setFilms(merged);
          }
        }
      } catch (error) {
        console.error("Failed to load films:", error);
      }
    }
    loadFilms();
  }, []);

  const handleFilmClick = (film: FilmItem) => {
    if (film.videoUrl && isExternalVideoUrl(film.videoUrl)) {
      window.open(film.videoUrl, "_blank", "noopener,noreferrer");
      return;
    }
    setActiveFilm(film);
  };

  return (
    <section id="films" className="py-28 md:py-36 bg-[#2d2a24] text-white relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-300/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs uppercase tracking-[0.35em] text-white font-sans-clean inline-flex items-center gap-2 mb-3">
            <Film className="w-4 h-4" /> Cinema & Movement
          </span>
          <h2 className="font-serif-primary text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-white">
            Cinematic Wedding Films
          </h2>
          <p className="font-sans-clean text-xs md:text-sm tracking-[0.1em] text-zinc-300 mt-4 leading-relaxed font-light">
            Framing love as art with anamorphic optics, custom sound design, and emotional narrative editing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {films
            .filter((f) => !f.hidden)
            .map((film, idx) => {
              const youtubeId = film.youtubeId || extractYouTubeId(film.videoUrl);
              const thumbnail = youtubeId
                ? youtubeThumbnail(youtubeId)
                : film.thumbnail;

              return (
                <motion.div
                  key={film._id ?? film.id ?? idx}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  onClick={() => handleFilmClick(film)}
                  data-cursor="play"
                  className="group cursor-pointer rounded-3xl overflow-hidden glass-panel-taupe-dark border border-white/15 p-4 transition-all duration-500 hover:border-white/50"
                >
                  <FilmCardThumbnail
                    thumbnail={thumbnail}
                    couple={film.couple}
                    duration={film.duration}
                  />

                  <div className="p-6">
                    <div className="mb-2">
                      <h3 className="font-serif-primary text-2xl md:text-3xl font-light text-white group-hover:text-white transition-colors">
                        {film.couple}
                      </h3>
                    </div>
                    <p className="font-sans-clean text-xs text-zinc-300 leading-relaxed font-light">
                      {film.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>

      <AnimatePresence>
        {activeFilm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9995] bg-[#2d2a24]/95 backdrop-blur-3xl flex items-center justify-center p-4 md:p-12"
            onClick={() => setActiveFilm(null)}
          >
            <button
              onClick={() => setActiveFilm(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
            >
              <X className="w-6 h-6" />
            </button>

            <div
              className="relative max-w-5xl w-full aspect-[16/9] bg-[#464239] rounded-3xl overflow-hidden border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {activeFilm.videoUrl ? (
                activeFilm.videoUrl.includes("youtube.com") ||
                activeFilm.videoUrl.includes("youtu.be") ||
                activeFilm.videoUrl.includes("vimeo.com") ? (
                  <iframe
                    src={
                      activeFilm.videoUrl.includes("youtube.com") ||
                      activeFilm.videoUrl.includes("youtu.be")
                        ? `https://www.youtube.com/embed/${
                            extractYouTubeId(activeFilm.videoUrl) || ""
                          }?autoplay=1&mute=${isMuted ? 1 : 0}`
                        : `https://player.vimeo.com/video/${activeFilm.videoUrl
                            .split("/")
                            .pop()}?autoplay=1&muted=${isMuted ? 1 : 0}`
                    }
                    className="w-full h-full border-none"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={activeFilm.videoUrl}
                    className="w-full h-full object-cover"
                    autoPlay
                    controls
                    muted={isMuted}
                  />
                )
              ) : (
                <>
                  <Image
                    src={activeFilm.thumbnail}
                    alt={activeFilm.couple}
                    fill
                    className="object-cover filter brightness-90 animate-pulse-slow"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2d2a24]/90 via-transparent to-black/40 flex flex-col justify-between p-8 text-white">
                    <div className="flex justify-between items-center">
                      <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white font-sans-clean">
                        <Sparkles className="w-4 h-4" /> Premiering Film Showcase
                      </span>
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white"
                      >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="max-w-2xl">
                      <span className="text-xs uppercase tracking-[0.3em] text-white/80 font-sans-clean">
                        {activeFilm.location}
                      </span>
                      <h3 className="font-serif-primary text-4xl md:text-5xl font-light text-white mt-1 mb-3">
                        {activeFilm.couple}
                      </h3>
                      <p className="font-sans-clean text-xs md:text-sm text-zinc-200 leading-relaxed font-light">
                        {activeFilm.description}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
