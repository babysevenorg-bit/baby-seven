"use client";

import { create } from "zustand";

/**
 * Single source of truth for the in-app "view" navigation.
 * Because this project is constrained to a single user-visible route (`/`),
 * we simulate multi-page navigation by switching the active view inside
 * the SPA. Framer Motion's AnimatePresence renders the cinematic page
 * transitions between views.
 */
export type ViewId = "home" | "portfolio" | "collaborate" | "support";

interface NavState {
  view: ViewId;
  setView: (v: ViewId) => void;
}

export const useNav = create<NavState>((set) => ({
  view: "home",
  setView: (v) => set({ view: v }),
}));

export const NAV_ITEMS: { id: ViewId; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "portfolio", label: "Portfolio" },
  { id: "collaborate", label: "Collaborate" },
  { id: "support", label: "Support" },
];
