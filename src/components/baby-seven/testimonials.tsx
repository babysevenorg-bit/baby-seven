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

export function Testimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetch("/api/testimonials")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setItems(d.testimonials ?? []))
      .catch(() => setItems([]));
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <p className="font-display text-xs tracking-[0.3em] text-cyan">PRAISE</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl md:text-4xl">
            What Collaborators Say
          </h2>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="glass-card flex flex-col gap-3 p-6"
            >
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
              <p className="text-sm leading-relaxed text-ash">“{t.text}”</p>
              <div className="mt-auto border-t border-white/10 pt-3">
                <p className="font-display text-xs font-semibold tracking-wider text-white">
                  {t.clientName}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
