"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, Star, X, Sparkles } from "lucide-react";

export interface Testimonial {
  id: string;
  quote: string;
  names: string;
  venue: string;
  publication: string;
  image: string;
}

export interface ClientReview {
  id: string;
  names: string;
  venue: string;
  quote: string;
  rating: number;
}

const testimonialsData: Testimonial[] = [
  {
    id: "t1",
    quote: "Kopiko captured our Lake Como wedding with an artist's eye. Looking through the photographs feels like stepping into a romantic movie frame.",
    names: "Meera & Arun Patel",
    venue: "Villa del Balbianello, Italy",
    publication: "Featured in Vogue Weddings",
    image: "/showcase/hero.jpeg",
  },
  {
    id: "t2",
    quote: "The quiet intimacy they brought to our ceremony was extraordinary. No intrusive cameras—just pure art and genuine emotion.",
    names: "Eleanor & Arthur Sterling",
    venue: "Château de Chantilly, France",
    publication: "Featured in Harper's Bazaar Bride",
    image: "/showcase/wed.jpeg",
  },
  {
    id: "t3",
    quote: "Our fine art album is the most treasured heirloom in our home. Every guest who visits is blown away by the print depth.",
    names: "Sophia & James Montgomery",
    venue: "The Oberoi Udaivilas, Udaipur",
    publication: "Featured in Elle International",
    image: "/showcase/album.jpeg",
  },
];

const initialClientReviews: ClientReview[] = [
  {
    id: "r1",
    names: "Anjali & Vikram",
    venue: "Bolgatty Palace, Kochi",
    quote: "The team's attention to detail was sublime. They captured the subtle glances, the teary eyes, and the grand heritage of our venue with total ease.",
    rating: 5,
  },
  {
    id: "r2",
    names: "Kavya & Rahul",
    venue: "Kumarakom Lake Resort",
    quote: "Every single photograph feels like a luxury painting. The white silk drapes and backwaters were framed perfectly. Absolutely recommended!",
    rating: 5,
  },
  {
    id: "r3",
    names: "Sneha & Amit",
    venue: "Leela Raviz, Kovalam",
    quote: "Professional, unobtrusive, and gifted with a true artistic vision. We received our teaser gallery in record time and were absolutely speechless.",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [clientReviews, setClientReviews] = useState<ClientReview[]>(initialClientReviews);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form Fields
  const [formNames, setFormNames] = useState("");
  const [formVenue, setFormVenue] = useState("");
  const [formQuote, setFormQuote] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonialsData.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonialsData.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonialsData.length) % testimonialsData.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNames || !formVenue || !formQuote) return;

    const newReview: ClientReview = {
      id: `cr-${Date.now()}`,
      names: formNames,
      venue: formVenue,
      quote: formQuote,
      rating: formRating,
    };

    setClientReviews([newReview, ...clientReviews]);
    setIsSuccess(true);

    setTimeout(() => {
      setFormNames("");
      setFormVenue("");
      setFormQuote("");
      setFormRating(5);
      setIsSuccess(false);
      setIsFormOpen(false);
    }, 1800);
  };

  const current = testimonialsData[currentIndex];

  return (
    <section id="testimonials" className="py-28 md:py-36 bg-[#2d2a24] text-white relative overflow-hidden">
      {/* Background Image Fade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={current.image}
            alt={current.names}
            fill
            className="object-cover filter grayscale blur-[3px]"
          />
        </motion.div>
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10">
        {/* Carousel Block */}
        <div className="text-center max-w-5xl mx-auto">
          {/* Top Header */}
          <span className="text-xs uppercase tracking-[0.35em] text-white font-sans-clean block mb-4">
            Praise & Press Recognition
          </span>

          {/* Vogue Feature Badge */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 text-white text-[10px] uppercase tracking-[0.2em] mb-12 border border-white/15">
            <Star className="w-3.5 h-3.5 fill-white text-white" />
            <span>{current.publication}</span>
          </div>

          {/* Quote Block */}
          <div className="min-h-[220px] flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -25 }}
                transition={{ duration: 0.7 }}
                className="flex flex-col items-center"
              >
                <Quote className="w-10 h-10 text-white/40 mb-6" />
                <p className="font-serif-primary text-3xl sm:text-4xl md:text-5xl font-light text-white leading-snug tracking-wide max-w-4xl text-balance">
                  "{current.quote}"
                </p>
                <div className="mt-8">
                  <h4 className="font-serif-primary text-2xl font-normal text-white">
                    {current.names}
                  </h4>
                  <p className="font-sans-clean text-xs uppercase tracking-[0.25em] text-white/70 mt-1">
                    {current.venue}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Carousel Navigation Controls */}
          <div className="flex items-center justify-center gap-6 mt-12 mb-28">
            <button
              onClick={handlePrev}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/15"
              aria-label="Previous Testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots Indicator */}
            <div className="flex gap-2">
              {testimonialsData.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentIndex === idx ? "w-8 bg-white" : "w-2 bg-white/30"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/15"
              aria-label="Next Testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Client Reviews Grid Section */}
        <div className="border-t border-white/10 pt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-zinc-300 font-sans-clean block mb-2">
                Timeless Diaries
              </span>
              <h3 className="font-serif-primary text-4xl md:text-5xl font-light text-white">
                Client Story Reviews
              </h3>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="mt-6 sm:mt-0 px-7 py-3 rounded-full bg-white text-zinc-950 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-zinc-200 transition-colors shadow-md flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Share Your Story
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {clientReviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-panel-taupe-dark border border-white/10 p-8 rounded-3xl flex flex-col justify-between"
              >
                <div>
                  {/* Star Rating */}
                  <div className="flex gap-1 mb-5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < review.rating
                            ? "fill-white text-white"
                            : "text-white/25"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="font-sans-clean text-xs md:text-sm text-zinc-300 leading-relaxed font-light mb-6">
                    "{review.quote}"
                  </p>
                </div>
                <div>
                  <h5 className="font-sans-clean text-xs uppercase tracking-[0.18em] font-semibold text-white">
                    {review.names}
                  </h5>
                  <p className="font-sans-clean text-[10px] uppercase tracking-wider text-zinc-400 mt-1">
                    {review.venue}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Submission Drawer Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9995] bg-[#2d2a24]/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#464239] w-full max-w-lg rounded-3xl p-8 border border-white/15 shadow-2xl relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsFormOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Close form"
              >
                <X className="w-5 h-5" />
              </button>

              <h4 className="font-serif-primary text-3xl font-light text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-white" /> Share Your Review
              </h4>
              <p className="font-sans-clean text-xs text-zinc-300 font-light mb-6">
                Your experience helps us maintain our dedication to fine art wedding storytelling.
              </p>

              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-white/10 text-white flex items-center justify-center mb-6 border border-white/25">
                    <Star className="w-8 h-8 fill-white" />
                  </div>
                  <h5 className="font-serif-primary text-2xl font-light text-white mb-2">
                    Thank You Beautifully
                  </h5>
                  <p className="font-sans-clean text-xs text-zinc-300 font-light">
                    Your story review has been added to our digital gallery journal.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* Star Rating Select */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-300 font-semibold">
                      Your Story Rating
                    </label>
                    <div className="flex gap-2 py-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 transition-all duration-200 ${
                              star <= (hoverRating ?? formRating)
                                ? "fill-white text-white scale-110"
                                : "text-white/25"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Couple Names */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-300 font-semibold">
                      Couple Names (e.g., Priya & Rahul)
                    </label>
                    <input
                      type="text"
                      required
                      value={formNames}
                      onChange={(e) => setFormNames(e.target.value)}
                      placeholder="Enter couple names"
                      className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/15 text-white placeholder-zinc-400 text-xs focus:outline-none focus:border-white"
                    />
                  </div>

                  {/* Venue / Location */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-300 font-semibold">
                      Wedding Venue & Location
                    </label>
                    <input
                      type="text"
                      required
                      value={formVenue}
                      onChange={(e) => setFormVenue(e.target.value)}
                      placeholder="e.g. Villa d'Este, Lake Como"
                      className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/15 text-white placeholder-zinc-400 text-xs focus:outline-none focus:border-white"
                    />
                  </div>

                  {/* Review Text */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-300 font-semibold">
                      Your Story Review
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formQuote}
                      onChange={(e) => setFormQuote(e.target.value)}
                      placeholder="Write your experience..."
                      className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/15 text-white placeholder-zinc-400 text-xs focus:outline-none focus:border-white resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-white text-zinc-950 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-zinc-200 transition-colors shadow-md mt-2"
                  >
                    Submit Story Review
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
