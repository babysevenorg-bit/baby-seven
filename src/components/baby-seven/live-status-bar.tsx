"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, TrendingUp, Award, Users } from "lucide-react";

type Stats = {
  collaborations: number;
  featuredProjects: number;
  totalProjects: number;
  testimonials: number;
};

/**
 * LiveStatusBar — a thin, animated bar below the hero that fetches live
 * counts from /api/stats and surfaces a "Blood Disaster is ranking #1"
 * headline along with three live counters.
 */
export function LiveStatusBar() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => !cancelled && setStats(d))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative z-10 -mt-2 mb-4 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          {/* Primary headline */}
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15">
              <BookOpen className="h-4 w-4 text-gold" />
            </span>
            <div className="text-left">
              <p className="font-display text-sm font-semibold tracking-wide text-white">
                📖 Blood Disaster is ranking #1 on Google.
              </p>
              <p className="text-xs text-stone">Live · refreshing from Neon DB</p>
            </div>
          </div>

          {/* Counters */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Counter
              icon={<TrendingUp className="h-3.5 w-3.5" />}
              label="Projects"
              value={stats?.totalProjects ?? null}
            />
            <Counter
              icon={<Award className="h-3.5 w-3.5" />}
              label="Featured"
              value={stats?.featuredProjects ?? null}
            />
            <Counter
              icon={<Users className="h-3.5 w-3.5" />}
              label="Requests"
              value={stats?.collaborations ?? null}
            />
          </div>
        </motion.div>
        {error && (
          <p className="mt-2 text-center text-xs text-stone">
            Stats are temporarily unavailable. Showing cached state.
          </p>
        )}
      </div>
    </div>
  );
}

function Counter({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | null;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-cyan">{icon}</span>
      <div className="flex flex-col">
        <motion.span
          key={value ?? "na"}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-base font-bold text-white"
        >
          {value === null ? "—" : value}
        </motion.span>
        <span className="text-[10px] uppercase tracking-widest text-stone">{label}</span>
      </div>
    </div>
  );
}
