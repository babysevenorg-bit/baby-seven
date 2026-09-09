"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Play, Star, FilmIcon, PenLine, FileText } from "lucide-react";
import { categoryLabel, cn } from "@/lib/utils";

type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
  videoUrl: string | null;
  isFeatured: boolean;
  rank: number | null;
};

type Filter = "All" | "Writing" | "Video" | "Script";

const FILTERS: { id: Filter; label: string; icon: React.ReactNode }[] = [
  { id: "All", label: "All", icon: null },
  { id: "Writing", label: "Writing", icon: <PenLine className="h-3.5 w-3.5" /> },
  { id: "Video", label: "Video Editing", icon: <FilmIcon className="h-3.5 w-3.5" /> },
  { id: "Script", label: "Scriptwriting", icon: <FileText className="h-3.5 w-3.5" /> },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function PortfolioView() {
  const [all, setAll] = useState<Project[]>([]);
  const [filter, setFilter] = useState<Filter>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => setAll(d.projects ?? []))
      .catch(() => setAll([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (filter === "All") return all;
    return all.filter((p) => p.category === filter);
  }, [all, filter]);

  return (
    <section className="px-4 pt-32 pb-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center sm:text-left"
        >
          <p className="font-display text-xs tracking-[0.3em] text-cyan">PORTFOLIO</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Selected Work
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-ash sm:text-base">
            Novels, films, and scripts — built frame by frame, line by line.
            Filter by craft to see how the story changes shape across mediums.
          </p>
        </motion.div>

        {/* Filter tabs */}
        <div className="mb-10 flex flex-wrap justify-center gap-2 sm:justify-start">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "relative flex items-center gap-2 rounded-full border px-5 py-2 font-display text-xs font-semibold tracking-widest transition-all",
                  active
                    ? "border-cyan/60 bg-cyan/10 text-cyan"
                    : "border-white/10 bg-white/5 text-ash hover:text-white",
                )}
              >
                {f.icon}
                {f.label.toUpperCase()}
                {active && (
                  <motion.span
                    layoutId="filter-underline"
                    className="absolute -bottom-1 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-cyan"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Masonry grid (3-col on desktop, 2 on tablet, 1 on mobile) */}
        {loading ? (
          <PortfolioSkeleton />
        ) : filtered.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-stone">
            No projects in this category yet.
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="columns-1 gap-5 md:columns-2 lg:columns-3 [&>*]:mb-5 [&>*]:break-inside-avoid"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const isRank1 = project.rank === 1;
  return (
    <motion.div
      variants={cardVariants}
      layout
      whileHover={{ y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card-bg transition-all",
        isRank1 ? "border-gold/60 glow-gold" : "border-white/10 hover:border-cyan/50 hover:glow-cyan",
      )}
    >
      {/* #1 corner ribbon */}
      {isRank1 && (
        <div className="pointer-events-none absolute -right-12 top-3 z-20 rotate-45 bg-gold px-10 py-1 text-[10px] font-bold tracking-widest text-void shadow-lg">
          #1 SEARCH RESULT
        </div>
      )}

      {/* Cover (16:9) */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={project.coverImage}
          alt={project.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-void/0 transition-colors duration-300 group-hover:bg-void/50" />
        {/* "View Project" overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex items-center gap-2 rounded-full border border-gold/40 bg-void/70 px-5 py-2 font-display text-xs font-bold tracking-widest text-gold backdrop-blur-md">
            VIEW PROJECT
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </div>
        {/* Category chip */}
        <div className="absolute left-3 top-3 rounded-full border border-white/20 bg-void/60 px-2.5 py-1 font-display text-[10px] tracking-widest text-white backdrop-blur-sm">
          {categoryLabel(project.category).toUpperCase()}
        </div>
        {project.videoUrl && (
          <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-cyan/20 text-cyan backdrop-blur-sm">
            <Play className="h-3 w-3 fill-cyan" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-base font-bold text-white sm:text-lg">
            {project.title}
          </h3>
          {isRank1 && (
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-gold text-gold" />
              ))}
            </div>
          )}
        </div>
        <p className="mt-2 line-clamp-3 text-sm text-ash">{project.description}</p>
      </div>
    </motion.div>
  );
}

function PortfolioSkeleton() {
  return (
    <div className="columns-1 gap-5 md:columns-2 lg:columns-3 [&>*]:mb-5 [&>*]:break-inside-avoid">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-white/10 bg-card-bg"
        >
          <div className="aspect-video w-full animate-pulse bg-white/5" />
          <div className="space-y-2 p-5">
            <div className="h-4 w-2/3 animate-pulse rounded bg-white/5" />
            <div className="h-3 w-full animate-pulse rounded bg-white/5" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
