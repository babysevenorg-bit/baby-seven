"use client";

import { useNav, NAV_ITEMS } from "@/lib/nav";
import { Heart } from "lucide-react";

export function Footer() {
  const setView = useNav((s) => s.setView);

  return (
    <footer className="mt-auto border-t border-white/10 bg-void">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="max-w-sm">
            <div className="font-display text-lg font-extrabold tracking-widest text-white">
              BABY <span className="text-gradient-gold">SEVEN</span>
            </div>
            <p className="mt-3 text-sm text-ash">
              Novelist. Director. Story Architect. Creator of{" "}
              <span className="text-white">“Blood Disaster”</span> — the #1 ranked novel.
            </p>
          </div>

          {/* Nav */}
          <div className="flex flex-col gap-2">
            <p className="font-display text-[10px] tracking-widest text-stone">NAVIGATE</p>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  if (typeof window !== "undefined")
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-left text-sm text-ash transition-colors hover:text-cyan"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Support CTA */}
          <div className="flex flex-col gap-2">
            <p className="font-display text-[10px] tracking-widest text-stone">SUPPORT</p>
            <p className="text-sm text-ash">Like the work? Back the next chapter.</p>
            <button
              onClick={() => {
                setView("support");
                if (typeof window !== "undefined")
                  window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-gold px-4 py-2 font-display text-xs font-bold tracking-widest text-void transition-transform hover:scale-105"
            >
              <Heart className="h-3.5 w-3.5 fill-void" />
              BECOME A BACKER
            </button>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-stone">
            © {new Date().getFullYear()} Baby Seven Studio. All rights reserved.
          </p>
          <p className="text-xs text-stone">
            Built cinematic with Next.js · Tailwind · Framer Motion.
          </p>
        </div>
      </div>
    </footer>
  );
}
