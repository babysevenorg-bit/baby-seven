"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { cn, formatBudget } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useNav } from "@/lib/nav";

type Tier = "Apprentice" | "Partner" | "Exec";

const TIERS: {
  id: Tier;
  tagline: string;
  price: string;
  perks: string[];
  accent: string;
}[] = [
  {
    id: "Apprentice",
    tagline: "Solo creator collab",
    price: "$500 — $2K",
    perks: ["1 deliverable", "1 round of revisions", "Async feedback"],
    accent: "border-cyan/50",
  },
  {
    id: "Partner",
    tagline: "Production duo",
    price: "$3K — $8K",
    perks: ["Up to 3 deliverables", "2 revision rounds", "1 strategy call"],
    accent: "border-gold/50",
  },
  {
    id: "Exec",
    tagline: "End-to-end direction",
    price: "$10K+",
    perks: ["Full creative direction", "Unlimited revisions", "Weekly syncs"],
    accent: "border-fuchsia-400/50",
  },
];

const STEPS = ["Tier", "Pitch", "Contact"] as const;

export function CollaborateView() {
  const { toast } = useToast();
  const setView = useNav((s) => s.setView);
  const [step, setStep] = useState(0);
  const [tier, setTier] = useState<Tier | null>(null);
  const [budget, setBudget] = useState<number>(2000);
  const [pitch, setPitch] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const canAdvance =
    (step === 0 && tier !== null) ||
    (step === 1 && pitch.trim().length >= 10) ||
    step === 2;

  const submit = async () => {
    if (!tier || !fullName.trim() || !email.trim() || pitch.trim().length < 10) {
      toast({
        title: "Missing info",
        description: "Please complete every field before submitting.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/collaborate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          tier,
          budget,
          message: pitch,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      setDone(true);
      toast({
        title: "Request received 📬",
        description: `Auto-reply sent to ${email}. We'll respond within 48h.`,
      });
    } catch (e) {
      toast({
        title: "Submission failed",
        description: e instanceof Error ? e.message : "Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="px-4 pt-32 pb-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <p className="font-display text-xs tracking-[0.3em] text-cyan">COLLABORATION PORTAL</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Pitch a Project
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-sm text-ash sm:text-base">
            Three steps. Tell us how big you want to go — and we&apos;ll take it from there.
          </p>
        </motion.div>

        {/* Stepper */}
        <div className="mb-10 flex items-center justify-center gap-2 sm:gap-4">
          {STEPS.map((label, i) => {
            const active = i === step;
            const completed = i < step;
            return (
              <div key={label} className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border font-display text-sm font-bold transition-all",
                      completed
                        ? "border-gold bg-gold text-void"
                        : active
                          ? "border-cyan bg-cyan/10 text-cyan glow-cyan"
                          : "border-white/15 bg-white/5 text-stone",
                    )}
                  >
                    {completed ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      "font-display text-xs tracking-widest transition-colors",
                      active ? "text-white" : "text-stone",
                    )}
                  >
                    {label.toUpperCase()}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="h-px w-6 bg-white/15 sm:w-12" />
                )}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="glass-card p-6 sm:p-10">
          <AnimatePresence mode="wait">
            {done ? (
              <SuccessPanel
                onBackHome={() => setView("home")}
                tier={tier}
                email={email}
              />
            ) : step === 0 ? (
              <motion.div
                key="step-tier"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.4 }}
              >
                <p className="mb-1 font-display text-sm font-semibold text-white">Step 1 — Choose your tier</p>
                <p className="mb-6 text-sm text-ash">Each tier sets the depth of our collaboration.</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {TIERS.map((t) => {
                    const selected = tier === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTier(t.id)}
                        className={cn(
                          "relative flex flex-col gap-3 rounded-xl border-2 bg-card-bg p-5 text-left transition-all",
                          selected
                            ? `${t.accent} bg-white/5`
                            : "border-white/10 hover:border-white/25",
                        )}
                      >
                        {selected && (
                          <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-cyan text-void">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                        )}
                        <div>
                          <p className="font-display text-base font-bold text-white">{t.id}</p>
                          <p className="text-xs text-stone">{t.tagline}</p>
                        </div>
                        <p className="font-display text-sm text-gold">{t.price}</p>
                        <ul className="space-y-1">
                          {t.perks.map((perk) => (
                            <li key={perk} className="flex items-start gap-1.5 text-xs text-ash">
                              <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-cyan" />
                              {perk}
                            </li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>

                {/* Budget slider */}
                <div className="mt-8">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-display text-sm font-semibold text-white">Budget (USD)</p>
                    <p className="font-display text-sm text-gold">{formatBudget(budget)}</p>
                  </div>
                  <input
                    type="range"
                    min={500}
                    max={50000}
                    step={500}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full accent-gold"
                    aria-label="Budget"
                  />
                  <div className="mt-1 flex justify-between text-xs text-stone">
                    <span>$500</span>
                    <span>$50,000+</span>
                  </div>
                </div>
              </motion.div>
            ) : step === 1 ? (
              <motion.div
                key="step-pitch"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.4 }}
              >
                <p className="mb-1 font-display text-sm font-semibold text-white">Step 2 — Your pitch</p>
                <p className="mb-6 text-sm text-ash">
                  Tell us what you want to make. The clearer the vision, the sharper the cut.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block font-display text-xs tracking-widest text-ash">
                      PROJECT BRIEF
                    </label>
                    <textarea
                      value={pitch}
                      onChange={(e) => setPitch(e.target.value)}
                      rows={6}
                      placeholder="e.g. A 6-part Instagram Reels series for my new EP launch — neon, nocturnal, cinematic. Each reel ~45s. Need direction, edit, and color grade."
                      className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-stone focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/40"
                    />
                    <div className="mt-1 flex justify-between text-xs text-stone">
                      <span>Minimum 10 characters</span>
                      <span>{pitch.length} chars</span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="mb-1 flex items-center gap-2 font-display text-xs tracking-widest text-cyan">
                      <Sparkles className="h-3.5 w-3.5" /> PITCH TIPS
                    </p>
                    <p className="text-xs text-ash">
                      Share the audience, tone, deadline, and any references (films, books, reels).
                      The more specific, the better the response.
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step-contact"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.4 }}
              >
                <p className="mb-1 font-display text-sm font-semibold text-white">Step 3 — Contact info</p>
                <p className="mb-6 text-sm text-ash">Where should the auto-reply land?</p>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block font-display text-xs tracking-widest text-ash">
                      FULL NAME
                    </label>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your name"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-stone focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/40"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block font-display text-xs tracking-widest text-ash">
                      EMAIL
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@studio.com"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-stone focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/40"
                    />
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-ash">
                    <p className="mb-1 flex items-center gap-2 font-display tracking-widest text-ash">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                      SUMMARY
                    </p>
                    <p>
                      <span className="text-white">Tier:</span> {tier ?? "—"} ·{" "}
                      <span className="text-white">Budget:</span> {formatBudget(budget)} ·{" "}
                      <span className="text-white">Pitch length:</span> {pitch.length} chars
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nav buttons */}
          {!done && (
            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0 || submitting}
                className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 font-display text-xs tracking-widest text-ash transition-all hover:border-white/25 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                BACK
              </button>

              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => canAdvance && setStep((s) => s + 1)}
                  disabled={!canAdvance}
                  className="flex items-center gap-1.5 rounded-full bg-cyan px-6 py-2.5 font-display text-xs font-bold tracking-widest text-void transition-all hover:glow-cyan disabled:cursor-not-allowed disabled:opacity-30"
                >
                  CONTINUE
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={submitting}
                  className="group relative overflow-hidden rounded-full px-8 py-2.5 font-display text-xs font-bold tracking-widest text-void disabled:opacity-60"
                >
                  <span className="absolute inset-0 shimmer-bg" />
                  <span className="relative z-10 flex items-center gap-1.5">
                    {submitting ? (
                      <>
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-void border-t-transparent" />
                        SUBMITTING…
                      </>
                    ) : (
                      <>
                        SUBMIT REQUEST
                        <ChevronRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SuccessPanel({
  onBackHome,
  tier,
  email,
}: {
  onBackHome: () => void;
  tier: Tier | null;
  email: string;
}) {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center py-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [0, 360] }}
        transition={{ duration: 0.7, type: "spring", stiffness: 200 }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold bg-gold/10 glow-gold"
      >
        <Check className="h-10 w-10 text-gold" />
      </motion.div>
      <h3 className="font-display text-2xl font-bold text-white">Request received</h3>
      <p className="mt-3 max-w-md text-sm text-ash">
        Your <span className="text-white">{tier ?? "collaboration"}</span> request is logged in Neon DB.
        An auto-reply confirmation has been sent to{" "}
        <span className="text-cyan">{email}</span>. Expect a personal reply within 48h.
      </p>
      <button
        onClick={onBackHome}
        className="mt-8 rounded-full border border-white/15 bg-white/5 px-6 py-2.5 font-display text-xs tracking-widest text-white transition-all hover:border-cyan hover:text-cyan"
      >
        BACK TO HOME
      </button>
    </motion.div>
  );
}
