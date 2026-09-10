"use client";

import { create } from "zustand";

/**
 * Single source of truth for the in-app "view" navigation.
 * Because this project is constrained to a single user-visible route (`/`),
 * we simulate multi-page navigation by switching the active view inside
 * the SPA. Framer Motion's AnimatePresence renders the cinematic page
 * transitions between views.
 *
 * "admin" is a HIDDEN view — it's not in the main nav. It's accessible via:
 *   - URL hash `#admin`
 *   - A discreet "Studio Access" link in the footer.
 */
export type ViewId =
  | "home"
  | "portfolio"
  | "collaborate"
  | "support"
  | "admin";

interface NavState {
  view: ViewId;
  setView: (v: ViewId) => void;
}

export const useNav = create<NavState>((set) => ({
  view: "home",
  setView: (v) => set({ view: v }),
}));

/** Public nav items (admin is intentionally excluded). */
export const NAV_ITEMS: { id: Exclude<ViewId, "admin">; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "portfolio", label: "Portfolio" },
  { id: "collaborate", label: "Collaborate" },
  { id: "support", label: "Support" },
];
