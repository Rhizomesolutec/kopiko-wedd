"use client";

import React, { useState } from "react";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import Header from "@/components/navigation/Header";
import Hero from "@/components/sections/Hero";
import AppleScrollStory from "@/components/sections/AppleScrollStory";
import WeddingFilms from "@/components/sections/WeddingFilms";
import FeaturedStories from "@/components/sections/FeaturedStories";
import StatsSection from "@/components/sections/StatsSection";
import AboutSection from "@/components/sections/AboutSection";
import ServicesSection from "@/components/sections/ServicesSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import InstagramMasonry from "@/components/sections/InstagramMasonry";
import BookingModal from "@/components/modals/BookingModal";
import Footer from "@/components/navigation/Footer";

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <SmoothScrollProvider>
      <div className="relative min-h-screen bg-white text-zinc-900 font-sans">
        <Header onOpenBooking={() => setIsBookingOpen(true)} />
        <main>
          <Hero onOpenBooking={() => setIsBookingOpen(true)} />
          <AppleScrollStory />
          <FeaturedStories />
          <WeddingFilms />
          <StatsSection />
          <AboutSection />
          <ServicesSection onOpenBooking={() => setIsBookingOpen(true)} />
          <TestimonialsSection />
          <InstagramMasonry />
        </main>
        <Footer onOpenBooking={() => setIsBookingOpen(true)} />
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
        />
      </div>
    </SmoothScrollProvider>
  );
}
