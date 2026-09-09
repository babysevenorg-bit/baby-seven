"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Check, Upload, Film } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type EditingStyle = "Fast-Paced" | "Cinematic" | "Story-driven" | "Viral/Hook";
type FormValues = {
  fullName: string;
  email: string;
  portfolioLink: string;
  editingStyle: EditingStyle;
  sampleReelUrl: string;
};

const STYLES: { value: EditingStyle; desc: string }[] = [
  { value: "Fast-Paced", desc: "Quick cuts · high energy" },
  { value: "Cinematic", desc: "Light, mood, slow burn" },
  { value: "Story-driven", desc: "Narrative-first arcs" },
  { value: "Viral/Hook", desc: "Hook-in-first-second" },
];

/**
 * ReelEditorApplicationForm — submit an application to the Baby Seven
 * "Reel Editors & Makers" hub. Uses react-hook-form for validation.
 *
 * The sampleReelUrl field accepts a URL string (in production we'd upload
 * the file to Vercel Blob and POST the resulting URL — see the comment in
 * /api/editors).
 */
export function ReelEditorApplicationForm() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [applicantName, setApplicantName] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      fullName: "",
      email: "",
      portfolioLink: "",
      editingStyle: "Cinematic",
      sampleReelUrl: "",
    },
  });

  const watchedStyle = watch("editingStyle");

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/editors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to submit");
      setApplicantName(data.fullName);
      setDone(true);
      toast({
        title: "Application received 🎬",
        description: `Auto-reply sent to ${data.email}. Review within 5–7 days.`,
      });
      reset();
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

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center py-10 text-center"
      >
        <motion.div
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: [0, 360] }}
          transition={{ duration: 0.7, type: "spring", stiffness: 200 }}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-cyan bg-cyan/10 glow-cyan"
        >
          <Check className="h-10 w-10 text-cyan" />
        </motion.div>
        <h3 className="font-display text-2xl font-bold text-foreground">
          Welcome to the hub, {applicantName.split(" ")[0]}!
        </h3>
        <p className="mt-3 max-w-md text-sm text-ash">
          Your application is logged. An auto-reply confirmation has been sent
          to your inbox. Expect a personal reply within 5–7 days.
        </p>
        <button
          onClick={() => setDone(false)}
          className="mt-8 rounded-full border border-border bg-card/60 px-6 py-2.5 font-display text-xs tracking-widest text-foreground transition-all hover:border-cyan hover:text-cyan"
        >
          APPLY ANOTHER REEL
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full Name" error={errors.fullName?.message}>
          <input
            {...register("fullName", {
              required: "Name is required",
              minLength: { value: 2, message: "Min 2 characters" },
            })}
            placeholder="Your name"
            className="w-full rounded-xl border border-border bg-card/40 px-4 py-3 text-sm text-foreground placeholder:text-stone focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/40"
          />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
            })}
            placeholder="you@studio.com"
            className="w-full rounded-xl border border-border bg-card/40 px-4 py-3 text-sm text-foreground placeholder:text-stone focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/40"
          />
        </Field>
      </div>

      <Field label="Portfolio Link (YouTube/Instagram)" error={errors.portfolioLink?.message}>
        <input
          {...register("portfolioLink", {
            required: "Portfolio link is required",
            pattern: { value: /^https?:\/\//, message: "Must start with http(s)://" },
          })}
          placeholder="https://instagram.com/your.cuts"
          className="w-full rounded-xl border border-border bg-card/40 px-4 py-3 text-sm text-foreground placeholder:text-stone focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/40"
        />
      </Field>

      {/* Editing style selector (visual + hidden register binding) */}
      <Field label="Editing Style" error={errors.editingStyle?.message}>
        <div className="grid gap-2 sm:grid-cols-2">
          {STYLES.map((s) => {
            const active = watchedStyle === s.value;
            return (
              <button
                type="button"
                key={s.value}
                onClick={() => setValue("editingStyle", s.value, { shouldValidate: true })}
                className={cn(
                  "flex flex-col items-start gap-0.5 rounded-xl border-2 px-4 py-3 text-left transition-all",
                  active
                    ? "border-cyan bg-cyan/10 text-foreground"
                    : "border-border bg-card/30 text-ash hover:border-foreground/30",
                )}
              >
                <span className="font-display text-sm font-semibold">{s.value}</span>
                <span className="text-xs text-stone">{s.desc}</span>
              </button>
            );
          })}
        </div>
        {/* Hidden input keeps react-hook-form's state consistent */}
        <input
          type="hidden"
          {...register("editingStyle", { required: "Select an editing style" })}
        />
      </Field>

      <Field
        label="Sample Reel URL (30-second sample)"
        error={errors.sampleReelUrl?.message}
        hint="Paste a public link to your 30-sec sample reel. In production this is a Vercel Blob upload."
      >
        <div className="relative">
          <Upload className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ash" />
          <input
            {...register("sampleReelUrl", {
              required: "Sample reel URL is required",
              pattern: { value: /^https?:\/\//, message: "Must start with http(s)://" },
            })}
            placeholder="https://instagram.com/reel/your-best-cut"
            className="w-full rounded-xl border border-border bg-card/40 py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-stone focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/40"
          />
        </div>
      </Field>

      <button
        type="submit"
        disabled={submitting}
        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full px-8 py-3.5 font-display text-sm font-bold tracking-widest disabled:opacity-60"
      >
        <span className="absolute inset-0 shimmer-bg" />
        <span className="relative z-10 flex items-center gap-2 text-void dark:text-void">
          {submitting ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-void border-t-transparent dark:border-void" />
              SUBMITTING…
            </>
          ) : (
            <>
              <Film className="h-4 w-4" />
              APPLY AS A REEL EDITOR
            </>
          )}
        </span>
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block font-display text-xs tracking-widest text-ash">
        {label.toUpperCase()}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-stone">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
