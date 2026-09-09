"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

type Testimonial = {
  id: string;
  clientName: string;
  text: string;
  rating: number;
};

/**
 * Testimonials — auto-scrolling marquee powered by CSS animation.
 * Fetches testimonials from /api/testimonials, duplicates the list for a
 * seamless infinite scroll, and pauses on hover so users can read.
 */
export function Testimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetch("/api/testimonials")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setItems(d.testimonials ?? []))
      .catch(() => setItems([]));
  }, []);

  if (items.length === 0) return null;

  // Duplicate the list so the marquee can loop seamlessly.
  const loop = [...items, ...items];

  return (
    <section className="py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-10 text-center px-4"
      >
        <p className="font-display text-xs tracking-[0.3em] text-cyan">PRAISE</p>
        <h2 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
          What Collaborators Say
        </h2>
        <p className="mt-2 text-sm text-ash">Auto-scrolling — hover to pause.</p>
      </motion.div>

      <div className="marquee-pause relative overflow-hidden">
        {/* Edge fade */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

        <div className="marquee-track animate-marquee">
          {loop.map((t, i) => (
            <TestimonialCard key={`${t.id}-${i}`} testimonial={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial: t }: { testimonial: Testimonial }) {
  return (
    <div className="glass-card flex w-[320px] shrink-0 flex-col gap-3 p-6 sm:w-[380px]">
      <div className="flex items-center justify-between">
        <Quote className="h-6 w-6 text-gold" />
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, s) => (
            <Star
              key={s}
              className={
                s < t.rating
                  ? "h-3.5 w-3.5 fill-gold text-gold"
                  : "h-3.5 w-3.5 text-stone"
              }
            />
          ))}
        </div>
      </div>
      <p className="line-clamp-4 text-sm leading-relaxed text-ash">“{t.text}”</p>
      <div className="mt-auto border-t border-border pt-3">
        <p className="font-display text-xs font-semibold tracking-wider text-foreground">
          {t.clientName}
        </p>
      </div>
    </div>
  );
}
