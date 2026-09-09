"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { FaMoon, FaSun } from "react-icons/fa";

/**
 * ThemeToggle — switches between dark and light mode.
 * Renders a placeholder until mounted to avoid hydration mismatch
 * (next-themes needs the client to read the resolved theme).
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
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
