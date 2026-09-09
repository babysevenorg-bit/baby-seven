"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useNav } from "@/lib/nav";

/**
 * FloatingSupportFAB — a fixed "Support" button pinned bottom-right that
 * gently pulses every ~3s to draw attention. Clicking it switches to the
 * Support view.
 */
export function FloatingSupportFAB() {
  const setView = useNav((s) => s.setView);

  return (
    <motion.button
      onClick={() => {
        setView("support");
        if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      aria-label="Support Baby Seven"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 220, damping: 18 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.96 }}
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-gradient-to-br from-gold to-amber-700 px-4 py-3 font-bold text-white shadow-[0_8px_32px_-4px_rgba(245,176,65,0.6)] sm:bottom-8 sm:right-8 dark:text-void"
    >
      <motion.span
        animate={{
          scale: [1, 1.18, 1],
          boxShadow: [
            "0 0 0 0 rgba(245,176,65,0.55)",
            "0 0 0 12px rgba(245,176,65,0)",
            "0 0 0 0 rgba(245,176,65,0)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="flex h-5 w-5 items-center justify-center"
      >
        <Heart className="h-4 w-4 fill-white text-white dark:fill-void dark:text-void" />
      </motion.span>
      <span className="font-display text-xs font-bold tracking-widest">SUPPORT</span>
    </motion.button>
  );
}
