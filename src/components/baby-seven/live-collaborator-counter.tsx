"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaUsers, FaFire } from "react-icons/fa";

type Stats = {
  collaborations: number;
  featuredProjects: number;
  totalProjects: number;
  reelEditors: number;
};

/**
 * LiveCollaboratorCounter — a dynamic hero counter that fetches the current
 * count of collaborators + reel-editor applicants from the DB and renders:
 *   "🔥 Join 50+ creators already collaborating with Baby Seven."
 *
 * The "50+" floor is a branding baseline; the live count is added on top so
 * the number always grows as the community grows.
 */
export function LiveCollaboratorCounter() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setStats(d))
      .catch(() => {});
  }, []);

  // Animated count-up once the live number arrives.
  useEffect(() => {
    if (!stats) return;
    const live = (stats.collaborations ?? 0) + (stats.reelEditors ?? 0);
    const target = 50 + live; // branding baseline 50 + live community
    let raf: number;
    const start = performance.now();
    const dur = 1200;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setCount(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stats]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.45 }}
      className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5"
    >
      <FaFire className="h-3.5 w-3.5 text-gold" />
      <span className="font-display text-xs font-semibold tracking-wider text-foreground sm:text-sm">
        Join{" "}
        <span className="text-gradient-gold font-bold">
          {count}+
        </span>{" "}
        creators already collaborating with Baby Seven
      </span>
      <FaUsers className="h-3 w-3 text-cyan" />
    </motion.div>
  );
}
