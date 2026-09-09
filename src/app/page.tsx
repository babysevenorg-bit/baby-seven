"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useNav } from "@/lib/nav";
import { FloatingHeader } from "@/components/baby-seven/floating-header";
import { FloatingSupportFAB } from "@/components/baby-seven/floating-support-fab";
import { Footer } from "@/components/baby-seven/footer";
import { HomeView } from "@/components/baby-seven/home-view";
import { PortfolioView } from "@/components/baby-seven/portfolio-view";
import { CollaborateView } from "@/components/baby-seven/collaborate-view";
import { SupportView } from "@/components/baby-seven/support-view";

export default function Home() {
  const view = useNav((s) => s.view);

  return (
    <div className="relative flex min-h-screen flex-col bg-void text-white">
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
            {view === "home" && <HomeView />}
            {view === "portfolio" && <PortfolioView />}
            {view === "collaborate" && <CollaborateView />}
            {view === "support" && <SupportView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Hide the FAB on the Support view (no need to advertise it there). */}
      {view !== "support" && <FloatingSupportFAB />}

      <Footer />
    </div>
  );
}
