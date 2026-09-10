"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { FaMoon, FaSun } from "react-icons/fa";

/**
 * ThemeToggle — switches between dark and light mode.
 *
 * Hydration safety: next-themes doesn't know the resolved theme during SSR
 * (it injects a script that runs client-side), so `resolvedTheme` is
 * `undefined` on both server render AND the first client render. The
 * `mounted` flag flips to `true` after the first effect runs, and only
 * then do we read `resolvedTheme` and render the icon + the theme-derived
 * aria-label. Before mount, we render a neutral placeholder with a
 * stable aria-label so the server-rendered HTML matches the first client
 * render exactly.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only derive the theme-dependent values AFTER mount, so the server-rendered
  // HTML and the first client render both use the placeholder branch and match.
  const isDark = mounted && resolvedTheme === "dark";
  const ariaLabel = mounted
    ? isDark
      ? "Switch to light mode"
      : "Switch to dark mode"
    : "Toggle color theme";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={ariaLabel}
      className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-ash transition-all hover:border-cyan hover:text-cyan dark:border-white/10 dark:bg-white/5 dark:hover:border-cyan dark:hover:text-cyan"
    >
      {mounted ? (
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {isDark ? (
            <FaMoon className="h-3.5 w-3.5 text-cyan" />
          ) : (
            <FaSun className="h-3.5 w-3.5 text-[#B8860B]" />
          )}
        </motion.span>
      ) : (
        <span className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
