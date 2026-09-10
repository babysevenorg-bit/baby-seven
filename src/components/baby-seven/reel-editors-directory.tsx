"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Film } from "lucide-react";
import { FaFilm } from "react-icons/fa";
import { categoryLabel } from "@/lib/utils";

type ReelEditor = {
  id: string;
  fullName: string;
  email: string;
  portfolioLink: string;
  editingStyle: string;
  sampleReelUrl: string | null;
  status: string;
  createdAt: string;
};

const STYLE_COLORS: Record<string, string> = {
  "Fast-Paced": "border-amber-400/40 text-amber-400",
  Cinematic: "border-cyan/40 text-cyan",
  "Story-driven": "border-fuchsia-400/40 text-fuchsia-400",
  "Viral/Hook": "border-emerald-400/40 text-emerald-400",
};

/**
 * ReelEditorsDirectoryGrid — public directory of reel editors who have
 * applied to the Baby Seven hub. Fetches from /api/editors and renders a
 * 3-column responsive grid of editor profile cards.
 */
export function ReelEditorsDirectoryGrid() {
  const [editors, setEditors] = useState<ReelEditor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/editors")
      .then((r) => r.json())
      .then((d) => setEditors(d.editors ?? []))
      .catch(() => setEditors([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="glass-card h-44 w-full animate-pulse bg-card/40"
          />
        ))}
      </div>
    );
  }

  if (editors.length === 0) {
    return (
      <div className="glass-card flex h-44 items-center justify-center text-ash">
        No editors in the pool yet — be the first to apply.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {editors.map((e, i) => (
        <motion.div
          key={e.id}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: i * 0.06 }}
          whileHover={{ y: -6 }}
          className="glass-card flex flex-col gap-3 p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan/20 to-gold/20">
              <FaFilm className="h-5 w-5 text-cyan" />
            </div>
            <span
              className={`rounded-full border px-2.5 py-0.5 font-display text-[10px] tracking-widest ${
                STYLE_COLORS[e.editingStyle] ?? "border-border text-ash"
              }`}
            >
              {e.editingStyle.toUpperCase()}
            </span>
          </div>

          <div>
            <p className="font-display text-base font-bold text-foreground">{e.fullName}</p>
            <p className="text-xs text-ash">{e.email}</p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={e.portfolioLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-3 py-1.5 font-display text-[10px] tracking-widest text-foreground transition-all hover:border-cyan hover:text-cyan"
            >
              <ExternalLink className="h-3 w-3" />
              PORTFOLIO
            </a>
            {e.sampleReelUrl && (
              <a
                href={e.sampleReelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/5 px-3 py-1.5 font-display text-[10px] tracking-widest text-gold transition-all hover:bg-gold/15"
              >
                <Film className="h-3 w-3" />
                SAMPLE REEL
              </a>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
            <span className="text-[11px] text-stone">
              Applied {new Date(e.createdAt).toLocaleDateString()}
            </span>
            <span className="rounded-full bg-cyan/10 px-2 py-0.5 font-display text-[10px] tracking-widest text-cyan">
              {e.status.toUpperCase()}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Re-export for usage inside the directory header (kept simple here).
export { categoryLabel };
