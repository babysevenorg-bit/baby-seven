"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Play, Star } from "lucide-react";
import { categoryLabel } from "@/lib/utils";

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

/**
 * FeaturedCarousel — horizontal scroll-snap carousel of featured projects.
 * Fetches /api/projects?featured=true and renders one big card per item with
 * smooth keyboard + button navigation.
 */
export function FeaturedCarousel() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/projects?featured=true")
      .then((r) => r.json())
      .then((d) => setProjects(d.projects ?? []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.clientWidth * 0.85;
    el.scrollBy({ left: dir * cardWidth, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-stone">
          <span className="h-2 w-2 rounded-full bg-cyan animate-pulse-dot" />
          <span className="font-display text-xs tracking-widest">LOADING FEATURED WORK…</span>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return null;
  }

  return (
    <section className="relative px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="font-display text-xs tracking-[0.3em] text-cyan">FEATURED</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
              Signature Work
            </h2>
          </div>
          {/* Carousel arrows */}
          <div className="hidden gap-2 sm:flex">
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Previous"
              className="rounded-full border border-white/10 bg-white/5 p-2.5 text-ash transition-all hover:border-cyan hover:text-cyan"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="Next"
              className="rounded-full border border-white/10 bg-white/5 p-2.5 text-ash transition-all hover:border-cyan hover:text-cyan"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scroll-snap carousel */}
        <div
          ref={scrollerRef}
          className="bs-scroll flex snap-x-mandatory gap-5 overflow-x-auto pb-4"
          style={{ scrollPaddingLeft: "1rem", scrollPaddingRight: "1rem" }}
        >
          {projects.map((p, i) => (
            <FeaturedCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedCard({ project, index }: { project: Project; index: number }) {
  const isRank1 = project.rank === 1;
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="snap-center shrink-0"
      style={{ width: "min(85vw, 460px)" }}
    >
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
        className={`group relative overflow-hidden rounded-2xl border ${
          isRank1
            ? "border-gold/60 glow-gold"
            : "border-white/10 hover:border-cyan/50 hover:glow-cyan"
        } bg-card-bg`}
      >
        {/* Cover */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={project.coverImage}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading={index < 2 ? "eager" : "lazy"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/30 to-transparent" />

          {/* Rank #1 ribbon */}
          {isRank1 && (
            <div className="absolute left-0 top-4">
              <div className="bg-gold px-3 py-1 text-[10px] font-bold tracking-wider text-void shadow-lg">
                #1 SEARCH RESULT
              </div>
            </div>
          )}

          {/* Category chip */}
          <div className="absolute right-3 top-3 rounded-full border border-white/20 bg-void/60 px-3 py-1 font-display text-[10px] tracking-widest text-white backdrop-blur-sm">
            {categoryLabel(project.category).toUpperCase()}
          </div>

          {/* Video play badge */}
          {project.videoUrl && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-cyan/20 px-2.5 py-1 font-display text-[10px] tracking-wider text-cyan backdrop-blur-sm">
              <Play className="h-3 w-3 fill-cyan" />
              WATCH
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-lg font-bold text-white">{project.title}</h3>
            {isRank1 && (
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-gold text-gold" />
                ))}
              </div>
            )}
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-ash">{project.description}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
