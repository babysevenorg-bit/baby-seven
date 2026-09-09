"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useNav } from "@/lib/nav";
import { ArrowDown, Sparkles, Trophy } from "lucide-react";

const TAGLINES = ["Novelist", "Director", "Story Architect", "Reels Editor", "Scriptwriter"];

export function Hero() {
  const setView = useNav((s) => s.setView);
  const [taglineIndex, setTaglineIndex] = useState(0);

  // Mouse parallax — the orbs shift slightly with the cursor for 3D depth.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });

  const orb1X = useTransform(sx, [-0.5, 0.5], [-40, 40]);
  const orb1Y = useTransform(sy, [-0.5, 0.5], [-30, 30]);
  const orb2X = useTransform(sx, [-0.5, 0.5], [40, -40]);
  const orb2Y = useTransform(sy, [-0.5, 0.5], [30, -30]);
  const orb3X = useTransform(sx, [-0.5, 0.5], [-20, 20]);
  const orb3Y = useTransform(sy, [-0.5, 0.5], [20, -20]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setTaglineIndex((i) => (i + 1) % TAGLINES.length);
    }, 2500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mx.set(x);
      my.set(y);
    };
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("mousemove", handleMove);
    return () => el.removeEventListener("mousemove", handleMove);
  }, [mx, my]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden bg-void"
    >
      {/* Animated gradient orbs (parallax) */}
      <motion.div
        style={{ x: orb1X, y: orb1Y }}
        className="animate-orb-1 pointer-events-none absolute -top-20 -left-20 h-[520px] w-[520px] rounded-full bg-cyan/20 blur-[120px]"
      />
      <motion.div
        style={{ x: orb2X, y: orb2Y }}
        className="animate-orb-2 pointer-events-none absolute top-1/3 -right-32 h-[600px] w-[600px] rounded-full bg-gold/20 blur-[140px]"
      />
      <motion.div
        style={{ x: orb3X, y: orb3Y }}
        className="animate-orb-3 pointer-events-none absolute -bottom-32 left-1/3 h-[460px] w-[460px] rounded-full bg-fuchsia-500/15 blur-[120px]"
      />

      {/* Grid overlay for cinematic depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 text-center sm:px-6">
        {/* Rotating tagline */}
        <div className="mb-6 flex h-8 items-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span
              key={taglineIndex}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -24, opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="font-display text-sm tracking-[0.35em] text-cyan sm:text-base"
            >
              {TAGLINES[taglineIndex].toUpperCase()}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[3rem] font-black leading-[0.95] tracking-tight text-white sm:text-[5rem] md:text-[6.5rem] lg:text-[8rem]"
        >
          Baby <span className="text-gradient-gold">Seven</span>
        </motion.h1>

        {/* Sub-text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-2xl text-base text-ash sm:text-lg md:text-xl"
        >
          Architect of Worlds. Creator of{" "}
          <span className="font-medium text-white">
            &ldquo;Blood Disaster&rdquo;
          </span>
          .
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <button
            onClick={() => setView("portfolio")}
            className="group relative overflow-hidden rounded-full bg-gold px-8 py-3.5 font-display text-sm font-bold tracking-widest text-void transition-transform hover:scale-[1.03]"
          >
            <span className="relative z-10">EXPLORE WORK</span>
            <span className="absolute inset-0 -z-0 shimmer-bg opacity-80" />
          </button>
          <button
            onClick={() => setView("collaborate")}
            className="rounded-full border border-white/15 bg-white/5 px-8 py-3.5 font-display text-sm font-bold tracking-widest text-white backdrop-blur-sm transition-all hover:border-cyan hover:text-cyan hover:glow-cyan"
          >
            START A PROJECT
          </button>
        </motion.div>

        {/* Proof Badge */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.55, type: "spring", stiffness: 200, damping: 18 }}
          className="mt-12"
        >
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-gold/40 via-cyan/40 to-gold/40 opacity-60 blur-xl" />
            <div className="relative flex items-center gap-2 rounded-full border border-gold/40 bg-void/80 px-5 py-2.5 backdrop-blur-md">
              <Trophy className="h-4 w-4 text-gold" />
              <span className="font-display text-xs font-semibold tracking-wider text-white sm:text-sm">
                #1 Ranked Novel — <span className="text-gradient-gold">Blood Disaster</span>
              </span>
              <Sparkles className="h-3.5 w-3.5 text-cyan" />
            </div>
          </div>
        </motion.div>

        {/* Scroll cue */}
        <motion.button
          onClick={() => setView("portfolio")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{ opacity: { delay: 1.2 }, y: { duration: 1.8, repeat: Infinity } }}
          className="mt-16 flex flex-col items-center gap-1 text-stone"
          aria-label="Scroll to explore"
        >
          <span className="font-display text-[10px] tracking-[0.3em]">SCROLL</span>
          <ArrowDown className="h-4 w-4" />
        </motion.button>
      </div>
    </section>
  );
}
