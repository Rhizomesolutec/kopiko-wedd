"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Calendar, MapPin, Sparkles, Send } from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    weddingDate: "",
    location: "",
    services: [] as string[],
    estimatedGuestCount: "100-250",
    visionDetails: "",
  });

  const serviceOptions = [
    "Editorial Photography",
    "Cinematic Wedding Film",
    "Destination Multi-Day Coverage",
    "Handbound Leather Album",
  ];

  const handleCheckboxChange = (service: string) => {
    setFormData((prev) => {
      const exists = prev.services.includes(service);
      return {
        ...prev,
        services: exists
          ? prev.services.filter((s) => s !== service)
          : [...prev.services, service],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const nameParts = formData.name.split("&");
    const bride = nameParts[0]?.trim() || formData.name;
    const groom = nameParts[1]?.trim() || "Partner";

    const payload = {
      brideName: bride,
      groomName: groom,
      phone: formData.phone || "0000000000",
      email: formData.email,
      weddingDate: formData.weddingDate,
      venue: formData.location,
      package: formData.services.join(", ") || "Custom Package",
      budget: formData.estimatedGuestCount || "Not Specified",
      notes: formData.visionDetails,
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to submit booking inquiry.");
      }
    } catch (error) {
      console.error("Booking submission error:", error);
      alert("Failed to submit inquiry due to network error.");
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-[#2d2a24]/90 backdrop-blur-2xl flex justify-end"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-2xl h-full bg-[#464239] text-white overflow-y-auto p-8 md:p-14 border-l border-white/15 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div>
              <div className="flex justify-between items-center mb-8">
                <span className="text-xs uppercase tracking-[0.35em] text-amber-200 font-sans-clean flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Reserve Your Date
                </span>
                <button
                  onClick={onClose}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!submitted ? (
                <>
                  <h2 className="font-serif-primary text-4xl md:text-5xl font-light text-amber-100 mb-3">
                    Let's Begin Your <span className="font-serif-italic italic text-amber-200">Story</span>
                  </h2>
                  <p className="font-sans-clean text-xs md:text-sm text-zinc-200 leading-relaxed font-light mb-10">
                    We accept a limited number of commissions each year to ensure framing love as art for every couple.
                  </p>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Name & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-[11px] uppercase tracking-[0.2em] text-amber-200/80 font-sans-clean">
                          Your Full Names *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Meera & Arun"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder-zinc-400 focus:outline-none focus:border-amber-300 transition-colors text-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[11px] uppercase tracking-[0.2em] text-amber-200/80 font-sans-clean">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="hello@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder-zinc-400 focus:outline-none focus:border-amber-300 transition-colors text-sm"
                        />
                      </div>
                    </div>

                    {/* Phone Number Input */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] uppercase tracking-[0.2em] text-amber-200/80 font-sans-clean">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 95446 36566"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-[#2d2a24]/50 border border-white/15 text-white placeholder-zinc-400 focus:outline-none focus:border-amber-300 transition-colors text-sm"
                      />
                    </div>

                    {/* Wedding Date & Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-[11px] uppercase tracking-[0.2em] text-amber-200/80 font-sans-clean flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-300" /> Event Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.weddingDate}
                          onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder-zinc-400 focus:outline-none focus:border-amber-300 transition-colors text-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[11px] uppercase tracking-[0.2em] text-amber-200/80 font-sans-clean flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-300" /> Destination / Venue *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Lake Como, Italy"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder-zinc-400 focus:outline-none focus:border-amber-300 transition-colors text-sm"
                        />
                      </div>
                    </div>

                    {/* Service Selections */}
                    <div className="flex flex-col gap-3">
                      <label className="text-[11px] uppercase tracking-[0.2em] text-amber-200/80 font-sans-clean">
                        Desired Services
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {serviceOptions.map((service) => {
                          const isSelected = formData.services.includes(service);
                          return (
                            <button
                              type="button"
                              key={service}
                              onClick={() => handleCheckboxChange(service)}
                              className={`p-3.5 rounded-xl text-xs uppercase tracking-[0.15em] border text-left transition-all duration-300 flex items-center justify-between ${
                                isSelected
                                  ? "bg-amber-300 text-zinc-950 border-amber-300 font-semibold"
                                  : "bg-white/10 text-zinc-200 border-white/15 hover:border-amber-200"
                              }`}
                            >
                              <span>{service}</span>
                              {isSelected && <CheckCircle2 className="w-4 h-4 fill-zinc-950 text-amber-300" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Vision Details */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] uppercase tracking-[0.2em] text-amber-200/80 font-sans-clean">
                        Tell Us About Your Vision & Event
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Share your wedding theme, venue details, or any special requests..."
                        value={formData.visionDetails}
                        onChange={(e) => setFormData({ ...formData, visionDetails: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder-zinc-400 focus:outline-none focus:border-amber-300 transition-colors text-sm resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      data-cursor="book"
                      className="w-full py-4 rounded-2xl bg-amber-300 hover:bg-amber-200 text-zinc-950 font-semibold text-xs uppercase tracking-[0.25em] transition-colors shadow-lg flex items-center justify-center gap-2 mt-4"
                    >
                      <span>Send Confidential Inquiry</span>
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              ) : (
                /* Success Confirmation State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center py-16"
                >
                  <div className="w-20 h-20 rounded-full bg-amber-300/20 border border-amber-300 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-amber-300" />
                  </div>
                  <h3 className="font-serif-primary text-4xl font-light text-amber-100 mb-3">
                    Inquiry Received
                  </h3>
                  <p className="font-sans-clean text-xs md:text-sm text-zinc-200 leading-relaxed max-w-md mb-8 font-light">
                    Thank you for reaching out, {formData.name || "friend"}. Our creative directors will review your date ({formData.weddingDate || "upcoming"}) and contact you within 24 hours with custom investment details.
                  </p>
                  <button
                    onClick={handleReset}
                    className="px-8 py-3.5 rounded-full bg-white/10 text-white text-xs uppercase tracking-[0.2em] hover:bg-white/20"
                  >
                    Return to Experience
                  </button>
                </motion.div>
              )}
            </div>

            {/* Footer note inside drawer */}
            <div className="border-t border-white/15 pt-6 mt-8 flex justify-between items-center text-[10px] uppercase tracking-[0.2em] text-amber-200/60 font-sans-clean">
              <span>KOPIKO Studio</span>
              <span>100% Confidential</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
