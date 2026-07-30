"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface StatItem {
  id: string;
  targetValue: number;
  suffix: string;
  label: string;
  sublabel: string;
}

const statsData: StatItem[] = [
  {
    id: "st1",
    targetValue: 250,
    suffix: "+",
    label: "Weddings Documented",
    sublabel: "Across 14 Countries",
  },
  {
    id: "st2",
    targetValue: 20,
    suffix: "+",
    label: "Global Destinations",
    sublabel: "Lake Como • Paris • Udaipur",
  },
  {
    id: "st3",
    targetValue: 12,
    suffix: "+",
    label: "International Awards",
    sublabel: "Vogue & Fearless Photographers",
  },
  {
    id: "st4",
    targetValue: 10,
    suffix: " YRS",
    label: "Mastering Craft",
    sublabel: "Framing Love as Art",
  },
];

function AnimatedCounter({ targetValue, suffix }: { targetValue: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 2000;
    const increment = targetValue / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= targetValue) {
        setCount(targetValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, targetValue]);

  return (
    <span ref={ref} className="font-serif-primary text-2xl sm:text-6xl md:text-7xl font-light text-zinc-950">
      {count}
      <span className="text-[#8c826b] font-serif-italic">{suffix}</span>
    </span>
  );
}

export default function StatsSection() {
  return (
    <section className="py-10 md:py-24 bg-[#f6f4ee] border-y border-[#c7beab]/40 px-2 sm:px-6 md:px-12 relative text-zinc-900">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-4 gap-1 sm:gap-4 md:gap-12 divide-x divide-[#c7beab]/50">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={`flex flex-col items-center text-center ${
                index !== 0 ? "pl-1 sm:pl-4 md:pl-8" : ""
              }`}
            >
              <AnimatedCounter targetValue={stat.targetValue} suffix={stat.suffix} />
              <h4 className="font-sans-clean text-[8px] sm:text-xs md:text-sm uppercase tracking-[0.08em] sm:tracking-[0.2em] font-semibold text-[#3a372f] mt-2 leading-tight">
                {stat.label}
              </h4>
              <p className="font-sans-clean text-[7.5px] sm:text-[10px] md:text-[11px] tracking-normal sm:tracking-[0.1em] text-[#8c826b] mt-1 font-medium leading-tight">
                {stat.sublabel}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
