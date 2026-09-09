"use client";

import { Hero } from "./hero";
import { LiveStatusBar } from "./live-status-bar";
import { FeaturedCarousel } from "./featured-carousel";
import { Testimonials } from "./testimonials";
import { useNav } from "@/lib/nav";
import { motion } from "framer-motion";
import { ArrowRight, PenLine, Film, FileText } from "lucide-react";

/**
 * HomeView — the cinematic landing experience.
 * Composes Hero + LiveStatusBar + FeaturedCarousel + a craft strip + Testimonials.
 */
export function HomeView() {
  const setView = useNav((s) => s.setView);

  return (
    <div>
      <Hero />

      {/* Live status bar sits just below the hero fold */}
      <div className="relative z-10 -mt-4">
        <LiveStatusBar />
      </div>

      {/* Craft strip — three disciplines at a glance */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: <PenLine className="h-6 w-6 text-gold" />,
                title: "Novelist",
                desc: "Long-form fiction. Best known for the #1 ranked Blood Disaster.",
                action: () => setView("portfolio"),
                cta: "Read the work",
              },
              {
                icon: <Film className="h-6 w-6 text-cyan" />,
                title: "Director · Reels",
                desc: "Cinematic shorts, music videos, and 60-second world-building Reels.",
                action: () => setView("portfolio"),
                cta: "Watch the reel",
              },
              {
                icon: <FileText className="h-6 w-6 text-fuchsia-400" />,
                title: "Scriptwriter",
                desc: "Features, pilots, teleplays. Originals that get optioned.",
                action: () => setView("portfolio"),
                cta: "See the scripts",
              },
            ].map((card, i) => (
              <motion.button
                key={card.title}
                onClick={card.action}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="group glass-card flex flex-col gap-3 p-6 text-left transition-all hover:border-cyan/40"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground/5">
                  {card.icon}
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">{card.title}</h3>
                <p className="text-sm text-ash">{card.desc}</p>
                <span className="mt-2 inline-flex items-center gap-1.5 font-display text-xs tracking-widest text-cyan transition-transform group-hover:translate-x-1">
                  {card.cta.toUpperCase()}
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <FeaturedCarousel />

      <Testimonials />

      {/* Closing CTA */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card relative overflow-hidden p-8 text-center sm:p-12"
          >
            <div className="pointer-events-none absolute -top-20 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-gold/20 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-20 right-10 h-60 w-60 rounded-full bg-cyan/20 blur-[100px]" />
            <div className="relative">
              <p className="font-display text-xs tracking-[0.3em] text-cyan">READY?</p>
              <h2 className="mx-auto mt-3 max-w-2xl font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
                Let&apos;s build the next world together.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm text-ash">
                Whether it&apos;s a novel, a film, or a 60-second Reels series — pitch the idea
                and we&apos;ll take it from script to screen.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  onClick={() => setView("collaborate")}
                  className="group relative overflow-hidden rounded-full px-8 py-3.5 font-display text-sm font-bold tracking-widest text-void"
                >
                  <span className="absolute inset-0 shimmer-bg" />
                  <span className="relative z-10 flex items-center gap-2">
                    START A PROJECT
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
                <button
                  onClick={() => setView("support")}
                  className="rounded-full border border-border bg-card/40 px-8 py-3.5 font-display text-sm font-bold tracking-widest text-foreground transition-all hover:border-cyan hover:text-cyan hover:glow-cyan"
                >
                  SUPPORT THE WORK
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
