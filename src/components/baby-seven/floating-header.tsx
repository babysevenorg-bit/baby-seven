"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useNav, NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

/**
 * FloatingHeader — transparent top bar that gains a blurred glass background
 * as the user scrolls down. Mobile uses a slide-down menu.
 */
export function FloatingHeader() {
  const { view, setView } = useNav();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (v) => {
    setScrolled(v > 24);
  });

  // Lock body scroll when the mobile menu is open.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleNav = (id: (typeof NAV_ITEMS)[number]["id"]) => {
    setView(id);
    setOpen(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled ? "glass-nav py-3 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)]" : "py-5 bg-transparent",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <button
            onClick={() => handleNav("home")}
            className="group flex items-center gap-2"
            aria-label="Baby Seven home"
          >
            <span className="font-display text-lg font-extrabold tracking-widest text-white sm:text-xl">
              BABY <span className="text-gradient-gold">SEVEN</span>
            </span>
            <span className="hidden h-1.5 w-1.5 rounded-full bg-cyan animate-pulse-dot sm:inline-block" />
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                data-active={view === item.id}
                className={cn(
                  "nav-underline font-display text-sm font-medium tracking-wider transition-colors",
                  view === item.id ? "text-cyan" : "text-ash hover:text-white",
                )}
              >
                {item.label.toUpperCase()}
              </button>
            ))}
            <button
              onClick={() => handleNav("support")}
              className="group relative overflow-hidden rounded-full border border-gold/60 px-5 py-2 font-display text-xs font-bold tracking-widest text-gold transition-all hover:glow-gold"
            >
              <span className="relative z-10">SUPPORT</span>
              <span className="absolute inset-0 -z-0 translate-y-full bg-gold/15 transition-transform duration-300 group-hover:translate-y-0" />
            </button>
          </nav>

          {/* Mobile burger */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-white md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile slide-down menu */}
      <motion.div
        initial={false}
        animate={open ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-0 right-0 top-[64px] z-40 overflow-hidden md:hidden"
      >
        <div className="glass-nav mx-3 flex flex-col gap-1 rounded-2xl p-4">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={cn(
                "rounded-lg px-4 py-3 text-left font-display text-sm tracking-wider transition-colors",
                view === item.id
                  ? "bg-cyan/10 text-cyan"
                  : "text-ash hover:bg-white/5 hover:text-white",
              )}
            >
              {item.label.toUpperCase()}
            </button>
          ))}
        </div>
      </motion.div>
    </>
  );
}
