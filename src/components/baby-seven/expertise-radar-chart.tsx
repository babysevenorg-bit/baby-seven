"use client";

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import { motion } from "framer-motion";

// Register only the pieces chart.js needs for a radar chart.
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

type Theme = "dark" | "light" | undefined;

/**
 * ExpertiseRadarChart — a visually striking radar chart showing Baby Seven's
 * proficiency levels across five disciplines. Color values adapt to the
 * active theme so the chart looks correct in both modes.
 *
 * Uses CSS variables (gold / cyan) so the palette stays in sync with the
 * theme tokens defined in globals.css.
 */
export function ExpertiseRadarChart({ theme }: { theme: Theme }) {
  const isLight = theme === "light";

  // Read brand colors from CSS variables so we stay synced with the theme.
  const gold = isLight ? "#B8860B" : "#F5B041";
  const cyan = isLight ? "#0047AB" : "#00FFFF";
  const grid = isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)";
  const ticks = isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.55)";
  const labels = isLight ? "#1A1A1A" : "#FFFFFF";

  const data = {
    labels: ["Writing", "Directing", "Reels Editing", "Scriptwriting", "SEO Ranking"],
    datasets: [
      {
        label: "Proficiency",
        data: [100, 95, 100, 90, 100],
        backgroundColor: `color-mix(in srgb, ${gold} 35%, transparent)`,
        borderColor: gold,
        borderWidth: 2,
        pointBackgroundColor: cyan,
        pointBorderColor: isLight ? "#FFFFFF" : "#080808",
        pointHoverBackgroundColor: gold,
        pointHoverBorderColor: cyan,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          color: ticks,
          backdropColor: "transparent",
          font: { size: 10, family: "Inter, sans-serif" },
        },
        grid: { color: grid },
        angleLines: { color: grid },
        pointLabels: {
          color: labels,
          font: {
            size: 12,
            weight: 700 as const,
            family: "Orbitron, sans-serif",
          },
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isLight ? "#FFFFFF" : "#121212",
        titleColor: labels,
        bodyColor: labels,
        borderColor: gold,
        borderWidth: 1,
        padding: 10,
        titleFont: { family: "Orbitron, sans-serif", weight: 700 as const },
        bodyFont: { family: "Inter, sans-serif" },
        callbacks: {
          label: (ctx: { parsed: { r?: number }; label: string }) =>
            ` ${ctx.label}: ${ctx.parsed.r ?? 0}/100`,
        },
      },
    },
  };

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-10 md:grid-cols-2">
          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-display text-xs tracking-[0.3em] text-cyan">EXPERTISE</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
              A Multi-Discipline Skill Set
            </h2>
            <p className="mt-4 max-w-md text-sm text-ash sm:text-base">
              Novelist, director, reels editor, scriptwriter — each craft feeds
              the others. The radar shows where the edge is sharpest right now.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-ash">
              <li>• Writing: 100 — page-one prose that ranks.</li>
              <li>• Directing: 95 — frames that earn the second watch.</li>
              <li>• Reels Editing: 100 — 60-second storytelling.</li>
              <li>• Scriptwriting: 90 — features & pilots, optioned.</li>
              <li>• SEO Ranking: 100 — #1 on Google, verified.</li>
            </ul>
          </motion.div>

          {/* Chart card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-card relative p-6 sm:p-8"
          >
            <div className="pointer-events-none absolute -top-20 right-10 h-40 w-40 rounded-full bg-cyan/15 blur-[80px]" />
            <div className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-gold/15 blur-[80px]" />
            <div className="relative h-[360px] w-full">
              <Radar data={data} options={options} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
