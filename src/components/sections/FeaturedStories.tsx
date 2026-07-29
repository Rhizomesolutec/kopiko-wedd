import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ArrowRight, Quote, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

export interface Story {
  id: string;
  couple: string;
  location: string;
  date: string;
  heroImage: string;
  galleryPreview: string[];
  quote: string;
  storySnippet: string;
  images: string[];
}

const storiesData: Story[] = [
  {
    id: "s1",
    couple: "Aanya & Dev",
    location: "Udaipur Palace, Rajasthan",
    date: "November 2025",
    heroImage: "/showcase/North indian/YCM00083.jpg",
    images: [
      "/showcase/North indian/YCM00083.jpg",
      "/showcase/North indian/YCM00059.jpg",
      "/showcase/North indian/YCM00135.jpg",
      "/showcase/North indian/YCM00193.jpg",
    ],
    galleryPreview: [
      "/showcase/North indian/YCM00059.jpg",
      "/showcase/North indian/YCM00135.jpg",
      "/showcase/North indian/YCM09954.jpg",
    ],
    quote: "Kopiko didn't just take pictures; they framed our love as art and preserved the exact magic of our day.",
    storySnippet: "A three-day royal North Indian wedding brought together centuries-old traditions, vibrant sangeet performances, and heartfelt family heritage.",
  },
  {
    id: "s2",
    couple: "Priya & Siddharth",
    location: "Heritage Pavilion, Kerala",
    date: "January 2026",
    heroImage: "/showcase/Traditional Wedd/DSC09570.jpg",
    images: [
      "/showcase/Traditional Wedd/DSC09570.jpg",
      "/showcase/Traditional Wedd/DSC00186.jpg",
      "/showcase/Traditional Wedd/DSC09993.jpg",
      "/showcase/Traditional Wedd/DSC09586.jpg",
    ],
    galleryPreview: [
      "/showcase/Traditional Wedd/DSC00186.jpg",
      "/showcase/Traditional Wedd/DSC09993.jpg",
      "/showcase/Traditional Wedd/DSC09586.jpg",
    ],
    quote: "Looking through our gallery felt like stepping into an irreplaceable fine-art heirloom.",
    storySnippet: "A serene traditional morning ceremony amidst brass lamps, silk drapes, and unscripted emotional moments.",
  },
  {
    id: "s3",
    couple: "Rhea & Rohan",
    location: "Cliffs of Santorini, Greece",
    date: "October 2025",
    heroImage: "/showcase/Pre-Wedding/ASD05381.jpg",
    images: [
      "/showcase/Pre-Wedding/ASD05381.jpg",
      "/showcase/Pre-Wedding/ASD06852.jpg",
      "/showcase/Pre-Wedding/ASD06864.jpg",
      "/showcase/Pre-Wedding/ASD06285.jpg",
    ],
    galleryPreview: [
      "/showcase/Pre-Wedding/ASD06852.jpg",
      "/showcase/Pre-Wedding/ASD06864.jpg",
      "/showcase/Pre-Wedding/AJI03908.jpg",
    ],
    quote: "Every frame captured the quiet, romantic energy we shared at sunset.",
    storySnippet: "An intimate pre-wedding editorial shoot wandering through white-washed villages and Aegean sea vistas.",
  },
];

export default function FeaturedStories() {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [slideIndices, setSlideIndices] = useState<Record<string, number>>({
    s1: 0,
    s2: 0,
    s3: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndices((prev) => {
        const nextIndices: Record<string, number> = {};
        storiesData.forEach((story) => {
          const currentIdx = prev[story.id] ?? 0;
          nextIndices[story.id] = (currentIdx + 1) % story.images.length;
        });
        return nextIndices;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="stories" className="py-28 md:py-36 bg-[#464239] text-white relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20">
          <div>
            <span className="text-xs uppercase tracking-[0.35em] text-white font-sans-clean">
              Editorial Narratives
            </span>
            <h2 className="font-serif-primary text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-white mt-2">
              Featured Love Stories
            </h2>
          </div>
          <p className="font-sans-clean text-xs md:text-sm text-zinc-300 max-w-md mt-4 md:mt-0 leading-relaxed font-light">
            Behind every couple lies a unique journey. Here is how we frame their unscripted chapters into fine art.
          </p>
        </div>

        {/* Story Cards List */}
        <div className="flex flex-col gap-24">
          {storiesData.map((story, index) => {
            const isReversed = index % 2 !== 0;

            return (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className={`flex flex-col ${
                  isReversed ? "lg:flex-row-reverse" : "lg:flex-row"
                } items-center gap-12 lg:gap-16`}
              >
                {/* Large Hero Portrait Image Slider */}
                <div
                  className="w-full lg:w-3/5 aspect-[4/3] relative rounded-3xl overflow-hidden shadow-2xl group cursor-pointer border border-white/10"
                  onClick={() => setSelectedStory(story)}
                  data-cursor="view"
                >
                  <div className="absolute inset-0 w-full h-full">
                    <AnimatePresence initial={false}>
                      <motion.div
                        key={slideIndices[story.id]}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="absolute inset-0 w-full h-full"
                      >
                        <Image
                          src={story.images[slideIndices[story.id]]}
                          alt={story.couple}
                          fill
                          className="object-cover filter brightness-[0.9]"
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2d2a24]/80 via-transparent to-transparent pointer-events-none" />

                  {/* Left & Right Slide Controls */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const currentIdx = slideIndices[story.id];
                      const newIdx = (currentIdx - 1 + story.images.length) % story.images.length;
                      setSlideIndices({ ...slideIndices, [story.id]: newIdx });
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-[#2d2a24]/75 hover:bg-[#2d2a24] text-white transition-all opacity-0 group-hover:opacity-100 border border-white/10 z-20"
                    aria-label="Previous Slide"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const currentIdx = slideIndices[story.id];
                      const newIdx = (currentIdx + 1) % story.images.length;
                      setSlideIndices({ ...slideIndices, [story.id]: newIdx });
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-[#2d2a24]/75 hover:bg-[#2d2a24] text-white transition-all opacity-0 group-hover:opacity-100 border border-white/10 z-20"
                    aria-label="Next Slide"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Slide Indicators / Dots */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 bg-black/35 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
                    {story.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSlideIndices({ ...slideIndices, [story.id]: i });
                        }}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                          slideIndices[story.id] === i ? "bg-white w-3" : "bg-white/40"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Location Pin Badge */}
                  <div className="absolute top-6 left-6 px-4 py-2 rounded-full glass-panel-taupe-dark text-[10px] uppercase tracking-[0.2em] text-white flex items-center gap-2 border border-white/15 font-sans-clean z-20 pointer-events-none">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{story.location}</span>
                  </div>
                </div>

                {/* Narrative Details */}
                <div className="w-full lg:w-2/5 flex flex-col items-start text-left">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white font-sans-clean mb-3">
                    <Calendar className="w-3.5 h-3.5" /> {story.date}
                  </div>
                  <h3 className="font-serif-primary text-4xl md:text-5xl font-light text-white mb-6">
                    {story.couple}
                  </h3>

                  {/* Quote Block */}
                  <div className="relative border-l-2 border-white/80 pl-6 my-4">
                    <Quote className="w-6 h-6 text-white/40 absolute -top-3 left-3 -z-10" />
                    <p className="font-serif-italic text-lg md:text-xl text-zinc-100 italic leading-relaxed">
                      "{story.quote}"
                    </p>
                  </div>

                  <p className="font-sans-clean text-xs md:text-sm text-zinc-300 leading-relaxed font-light my-6">
                    {story.storySnippet}
                  </p>

                  <button
                    onClick={() => setSelectedStory(story)}
                    data-cursor="view"
                    className="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.25em] font-semibold text-white hover:text-white transition-colors"
                  >
                    <span>Read Full Story & Gallery</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Story Details Drawer / Modal */}
      <AnimatePresence>
        {selectedStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9995] bg-[#2d2a24]/95 backdrop-blur-2xl flex justify-end"
            onClick={() => setSelectedStory(null)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full max-w-3xl h-full bg-[#464239] text-white overflow-y-auto p-8 md:p-14 border-l border-white/15 flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <button
                  onClick={() => setSelectedStory(null)}
                  className="mb-8 px-4 py-2 rounded-full bg-white/10 text-xs uppercase tracking-[0.2em] text-zinc-200 hover:text-white"
                >
                  ← Back to Stories
                </button>

                <span className="text-xs uppercase tracking-[0.3em] text-white font-sans-clean block mb-2">
                  {selectedStory.location}
                </span>
                <h2 className="font-serif-primary text-5xl font-light text-white mb-6">
                  {selectedStory.couple}
                </h2>

                <p className="font-sans-clean text-sm text-zinc-200 leading-relaxed font-light mb-8">
                  {selectedStory.storySnippet} Every ritual, speech, and twilight toast framed as timeless fine art.
                </p>

                {/* Gallery Previews */}
                <h4 className="font-serif-primary text-2xl text-white mb-4">
                  Story Snapshot Highlights
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {selectedStory.galleryPreview.map((img, i) => (
                    <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#2d2a24]">
                      <Image src={img} alt="Preview" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/15 pt-6 flex justify-between items-center">
                <span className="text-xs uppercase tracking-[0.2em] text-zinc-300">KOPIKO Editorial</span>
                <button
                  onClick={() => setSelectedStory(null)}
                  className="px-6 py-2.5 rounded-full bg-amber-300 text-zinc-950 text-xs uppercase tracking-[0.2em] font-semibold"
                >
                  Close Story
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
