"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGoogle, FaSearch } from "react-icons/fa";
import { X, ExternalLink, Copy, TrendingUp } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

/**
 * GoogleSearchBar — the SEO weapon from the v2.0 spec.
 *
 * The "redirect strategy":
 *   1. User types a query (e.g. "Blood Disaster") and hits Enter or clicks the button.
 *   2. We DO NOT search our internal DB.
 *   3. We open a Framer Motion modal that says "📈 Ready to see the magic?
 *      Open Google Chrome to search '[User Query]' and watch 'Blood Disaster'
 *      dominate the #1 spot!"
 *   4. The modal has two buttons:
 *        - "Open Google Now" → https://www.google.com/search?q=[Query]+Baby+Seven+Novel
 *        - "Copy Link" → copies the same URL to the clipboard.
 *
 * This forces users to physically open Google, search your name, and see the
 * #1 ranking in real-time — branding authority instantly.
 */
export function GoogleSearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const handleSearch = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      const q = query.trim();
      if (!q) return;
      setOpen(true);
    },
    [query],
  );

  return (
    <>
      <form
        onSubmit={handleSearch}
        className="mx-auto mt-10 flex w-full max-w-2xl items-stretch gap-2"
        role="search"
      >
        <div className="relative flex-1">
          <FaSearch className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ash" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search my work (e.g., Blood Disaster)..."
            aria-label="Search my work"
            className="w-full rounded-full border border-cyan/40 bg-card/60 py-3.5 pl-11 pr-4 text-sm text-foreground placeholder:text-stone shadow-[0_0_30px_-8px_rgba(0,255,255,0.35)] backdrop-blur-md transition-all focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/40"
          />
        </div>
        <button
          type="submit"
          className="group relative overflow-hidden rounded-full px-5 py-3.5 font-display text-xs font-bold tracking-widest text-void shadow-lg transition-transform hover:scale-[1.03] sm:px-7 sm:text-sm dark:text-void"
        >
          <span className="absolute inset-0 shimmer-bg" />
          <span className="relative z-10 flex items-center gap-2">
            <FaGoogle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">SEARCH GOOGLE</span>
            <span className="sm:hidden">GOOGLE</span>
          </span>
        </button>
      </form>

      <AnimatePresence>
        {open && (
          <SearchModal query={query.trim()} onClose={() => setOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

function SearchModal({ query, onClose }: { query: string; onClose: () => void }) {
  const { toast } = useToast();
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(
    `${query} Baby Seven Novel`,
  )}`;

  const copyLink = async () => {
    const ok = await copyToClipboard(googleUrl);
    if (ok) {
      toast({
        title: "Search link copied",
        description: "Paste it into Chrome to verify the #1 ranking.",
      });
    } else {
      toast({
        title: "Copy failed",
        description: "Please copy manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-void/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card relative w-full max-w-md p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Search Google confirmation"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-border bg-card/60 p-1.5 text-ash transition-colors hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Trending icon */}
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/30 to-cyan/30">
          <TrendingUp className="h-7 w-7 text-gold" />
        </div>

        <h3 className="font-display text-xl font-bold text-foreground">
          📈 Ready to see the magic?
        </h3>
        <p className="mt-3 text-sm text-ash sm:text-base">
          Open Google Chrome to search{" "}
          <span className="font-semibold text-foreground">“{query}”</span> and
          watch <span className="text-gradient-gold font-bold">“Blood Disaster”</span>{" "}
          dominate the #1 spot!
        </p>

        {/* URL preview */}
        <div className="mt-5 rounded-xl border border-border bg-card/60 px-3 py-2">
          <code className="block truncate font-mono text-[11px] text-ash">
            {googleUrl}
          </code>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-full px-5 py-3 font-display text-xs font-bold tracking-widest text-void dark:text-void"
          >
            <span className="absolute inset-0 shimmer-bg" />
            <span className="relative z-10 flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5" />
              OPEN GOOGLE NOW
            </span>
          </a>
          <button
            onClick={copyLink}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card/60 px-5 py-3 font-display text-xs font-bold tracking-widest text-foreground transition-all hover:border-cyan hover:text-cyan hover:glow-cyan"
          >
            <Copy className="h-3.5 w-3.5" />
            COPY LINK
          </button>
        </div>

        {/* Trust note */}
        <p className="mt-4 text-center text-[11px] text-stone">
          Verify the ranking yourself — the proof is one click away.
        </p>
      </motion.div>
    </motion.div>
  );
}
