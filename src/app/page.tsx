"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useNav } from "@/lib/nav";
import { FloatingHeader } from "@/components/baby-seven/floating-header";
import { FloatingSupportFAB } from "@/components/baby-seven/floating-support-fab";
import { Footer } from "@/components/baby-seven/footer";
import { ScrollToTopButton } from "@/components/baby-seven/scroll-to-top-button";
import { HomeView } from "@/components/baby-seven/home-view";
import { PortfolioView } from "@/components/baby-seven/portfolio-view";
import { CollaborateView } from "@/components/baby-seven/collaborate-view";
import { SupportView } from "@/components/baby-seven/support-view";
import { AdminDashboard } from "@/components/baby-seven/admin-dashboard";
import { ExpertiseRadarChart } from "@/components/baby-seven/expertise-radar-chart";

export default function Home() {
  const view = useNav((s) => s.view);
  const setView = useNav((s) => s.setView);
  const { resolvedTheme } = useTheme();

  // Sync URL hash → admin view (hidden access path: /#admin).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#admin") {
      setView("admin");
    }
    const onHash = () => {
      if (window.location.hash === "#admin") setView("admin");
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [setView]);

  // Update the URL hash when the admin view is active (so a refresh keeps you in admin).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (view === "admin") {
      if (window.location.hash !== "#admin") {
        window.history.replaceState(null, "", "#admin");
      }
    } else if (window.location.hash === "#admin") {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [view]);

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <FloatingHeader />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {view === "home" && (
              <>
                <HomeView />
                {/* Expertise radar sits between the home content and the footer. */}
                <ExpertiseRadarChart theme={resolvedTheme as "dark" | "light" | undefined} />
              </>
            )}
            {view === "portfolio" && <PortfolioView />}
            {view === "collaborate" && <CollaborateView />}
            {view === "support" && <SupportView />}
            {view === "admin" && <AdminDashboard />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Hide the FAB on Support + Admin views (no need to advertise it there). */}
      {view !== "support" && view !== "admin" && <FloatingSupportFAB />}

      {/* Scroll-to-top appears on scroll. Hidden on the Support loading screen. */}
      {view !== "admin" && <ScrollToTopButton />}

      <Footer />
    </div>
  );
}
