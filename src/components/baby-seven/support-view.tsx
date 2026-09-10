"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, Copy, Check, ExternalLink, Wallet } from "lucide-react";
import { FaTools, FaRocket } from "react-icons/fa";
import { SiBinance, SiPaypal, SiEthereum } from "react-icons/si";
import { copyToClipboard, cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useNav } from "@/lib/nav";

// 🔥 THE MAGIC SWITCH
// ---------------------------------------------------------------------------
// When `false` (default), the Support page shows a cinematic "Under
// Construction" holding page that collects emails for a launch alert.
// When you've finalised your Binance ID, PayPal link, MiniPay + USDT
// addresses, flip this to `true` and the full Smart Payment Card dashboard
// appears instantly — no other code changes needed.
// ---------------------------------------------------------------------------
const IS_LIVE = false;

// qrcode.react is dynamically imported with ssr:false to prevent hydration mismatch.
const QRCodeSVG = dynamic(
  () => import("qrcode.react").then((m) => m.QRCodeSVG),
  { ssr: false, loading: () => <QrSkeleton /> },
);

// Hardcoded peer-to-peer payment identifiers (per spec — no API keys stored).
// Replace these with your real addresses before flipping IS_LIVE to true.
const PAYMENT = {
  binanceId: "123456789",
  paypalHandle: "@BabySevenOfficial",
  paypalUrl: "https://paypal.me/BabySevenOfficial",
  // MiniPay (Celo) — short, scan-friendly address
  celoAddress: "0x7Bc8F2a9E3d1A4b6C7d8E9f0A1B2c3D4e5F63F2a",
  // USDT BEP-20 wallet
  usdtAddress: "0x7Bc8F2a9E3d1A4b6C7d8E9f0A1B2c3D4e5F63F2a",
};

export function SupportView() {
  const [isLoading, setIsLoading] = useState(true);

  // Spec: loading state lasts exactly 2 seconds.
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(t);
  }, []);

  if (isLoading) return <LoadingScreen />;
  if (!IS_LIVE) return <UnderConstructionPage />;
  return <SupportDashboard />;
}

// ---------------------------------------------------------------------------
// State 1 — Loading (2s)
// ---------------------------------------------------------------------------
function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Animated film reel */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="relative h-28 w-28"
      >
        {/* Reel disc */}
        <div className="absolute inset-0 rounded-full border-4 border-gold/60" />
        {/* Inner ring */}
        <div className="absolute inset-4 rounded-full border-2 border-cyan/50" />
        {/* Center hub */}
        <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold" />
        {/* Spokes */}
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <div
            key={deg}
            className="absolute left-1/2 top-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 origin-top"
            style={{
              transform: `translate(-50%, -50%) rotate(${deg}deg)`,
              background: "linear-gradient(to bottom, rgba(245,176,65,0.6), transparent)",
            }}
          />
        ))}
      </motion.div>

      {/* Bouncing dots */}
      <div className="mt-10 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-cyan animate-bounce-dot"
            style={{ animationDelay: `${i * 0.16}s` }}
          />
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-6 font-display text-sm tracking-widest text-ash"
      >
        🔐 Fetching secure payment gateways... Please wait.
      </motion.p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// State 2 — "Under Construction" Holding Page (shown when IS_LIVE = false)
// ---------------------------------------------------------------------------
function UnderConstructionPage() {
  const setView = useNav((s) => s.setView);
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const goHome = () => {
    setView("portfolio");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goCollaborate = () => {
    setView("collaborate");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to subscribe");
      setSubscribed(true);
      toast({
        title: data.alreadySubscribed
          ? "You're already on the list 🎬"
          : "Subscribed 🚀",
        description: data.message,
      });
      setEmail("");
    } catch (e) {
      toast({
        title: "Subscription failed",
        description: e instanceof Error ? e.message : "Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative px-4 pt-32 pb-24 sm:px-6 lg:px-8">
      {/* Background ambience */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-80 w-80 rounded-full bg-gold/15 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-cyan/15 blur-[120px]" />
      </div>

      <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="glass-card w-full p-8 text-center sm:p-12"
        >
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/15"
            >
              <FaTools className="text-4xl text-gold" />
            </motion.div>
          </div>

          {/* Title */}
          <p className="font-display text-xs tracking-[0.3em] text-cyan">MAINTENANCE MODE</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
            Support Hub <span className="text-gradient-gold">Upgrade</span>
          </h1>

          {/* Message */}
          <div className="mx-auto mt-6 max-w-xl space-y-4 text-left leading-relaxed text-ash sm:text-center">
            <p className="text-base sm:text-lg">
              🚀 <span className="font-semibold text-foreground">Baby Seven</span> is
              currently upgrading the Support Hub to serve you better.
            </p>
            <p>
              We are integrating seamless{" "}
              <span className="font-semibold text-amber-500 dark:text-amber-400">Binance Pay</span>,{" "}
              <span className="font-semibold text-sky-600 dark:text-sky-400">PayPal</span>, and{" "}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">MiniPay</span>{" "}
              to make supporting the{" "}
              <span className="font-semibold text-foreground">#1 “Blood Disaster”</span>{" "}
              creator as smooth as possible.
            </p>
            <div className="rounded-xl border border-dashed border-border bg-card/40 p-4">
              <p className="font-mono text-sm text-stone">
                ⏳ Estimated Launch:{" "}
                <span className="font-bold text-gold">Coming Soon</span>
              </p>
            </div>
          </div>

          {/* Notify Me — email capture */}
          <div className="mt-8">
            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mx-auto flex max-w-md items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-emerald-700 dark:text-emerald-300"
              >
                <Check className="h-4 w-4" />
                <span className="font-display text-xs tracking-wider">
                  YOU&apos;RE ON THE LIST — WE&apos;LL PING YOU AT LAUNCH
                </span>
              </motion.div>
            ) : (
              <form
                onSubmit={subscribe}
                className="mx-auto flex max-w-md flex-col gap-2 sm:flex-row"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email for launch alert..."
                  aria-label="Email for launch alert"
                  className="flex-1 rounded-xl border border-border bg-card/40 px-4 py-3 text-sm text-foreground placeholder:text-stone focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/40"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="group relative overflow-hidden rounded-xl bg-cyan px-6 py-3 font-display text-xs font-bold tracking-widest text-void transition-transform hover:scale-[1.03] disabled:opacity-60"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-void border-t-transparent" />
                      SUBSCRIBING…
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <FaRocket className="h-3.5 w-3.5" />
                      NOTIFY ME
                    </span>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <motion.button
              onClick={goHome}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative overflow-hidden rounded-xl px-8 py-3 font-display text-sm font-bold tracking-widest text-void shadow-lg shadow-gold/30"
            >
              <span className="absolute inset-0 bg-gold transition-colors group-hover:bg-amber-500" />
              <span className="relative z-10">BROWSE MY WORK</span>
            </motion.button>
            <motion.button
              onClick={goCollaborate}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl border-2 border-border bg-transparent px-8 py-3 font-display text-sm font-bold tracking-widest text-foreground transition-all hover:bg-foreground/5"
            >
              🤝 COLLABORATE INSTEAD
            </motion.button>
          </div>

          {/* Security / Trust Badge */}
          <p className="mt-8 flex items-center justify-center gap-2 text-xs text-stone">
            <FaRocket className="text-gold" />
            Stay tuned for exclusive crypto rewards when we launch!
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// State 3 — Live Smart Payment Card Dashboard (shown when IS_LIVE = true)
// ---------------------------------------------------------------------------
function SupportDashboard() {
  return (
    <section className="relative px-4 pt-32 pb-24 sm:px-6 lg:px-8">
      {/* Background ambience */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-80 w-80 rounded-full bg-gold/15 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-cyan/15 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-5xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <p className="font-display text-xs tracking-[0.3em] text-cyan">SUPPORT</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
            Back the Story
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-sm text-ash sm:text-base">
            Peer-to-peer. No middlemen. Pick a method below — every contribution
            keeps the next chapter alive.
          </p>
        </motion.div>

        {/* Smart Interface Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card p-5 sm:p-8"
        >
          {/* 2x2 grid of payment tiles */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <BinanceTile />
            <PaypalTile />
            <MiniPayTile />
            <UsdtTile />
          </div>

          {/* Security footer */}
          <div className="mt-8 flex flex-col items-center gap-2 border-t border-border pt-6 text-center">
            <div className="flex items-center gap-2 text-cyan">
              <Lock className="h-3.5 w-3.5" />
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
            <p className="max-w-md text-xs text-stone">
              ⚠️ No API keys stored here. Transfers are peer-to-peer. We never touch your funds.
            </p>
            <p className="mt-1 text-[11px] text-stone/80">
              🔒 Peer-to-Peer transfers. No middlemen. Your keys, your crypto.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Tile components
// ---------------------------------------------------------------------------

function BinanceTile() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const id = PAYMENT.binanceId;

  const onCopy = useCallback(async () => {
    const ok = await copyToClipboard(id);
    if (ok) {
      setCopied(true);
      toast({ title: "Binance ID copied", description: id });
      setTimeout(() => setCopied(false), 1800);
    } else {
      toast({ title: "Copy failed", description: "Please copy manually.", variant: "destructive" });
    }
  }, [id, toast]);

  return (
    <PaymentTile
      gradient="linear-gradient(135deg, rgba(243,182,25,0.25), rgba(240,185,32,0.05))"
      border="border-amber-400/40"
      icon={<SiBinance className="h-7 w-7 text-amber-400" />}
      label="BINANCE"
      title="Binance Pay ID"
    >
      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-border bg-card/40 px-4 py-3">
        <code className="font-mono text-base tracking-wider text-foreground sm:text-lg">{id}</code>
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 font-display text-[10px] font-bold tracking-widest text-amber-600 dark:text-amber-300 transition-all hover:bg-amber-400/20"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "COPIED" : "COPY"}
        </button>
      </div>
    </PaymentTile>
  );
}

function PaypalTile() {
  return (
    <PaymentTile
      gradient="linear-gradient(135deg, rgba(0,156,222,0.25), rgba(0,114,187,0.05))"
      border="border-sky-500/40"
      icon={<SiPaypal className="h-7 w-7 text-sky-400" />}
      label="PAYPAL"
      title="PayPal.me"
    >
      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-border bg-card/40 px-4 py-3">
        <span className="font-mono text-base text-foreground sm:text-lg">
          {PAYMENT.paypalHandle}
        </span>
        <a
          href={PAYMENT.paypalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-2 font-display text-[10px] font-bold tracking-widest text-sky-600 dark:text-sky-300 transition-all hover:bg-sky-500/20"
        >
          PAY NOW
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </PaymentTile>
  );
}

function MiniPayTile() {
  const addr = PAYMENT.celoAddress;
  const short = "0x7B...3F2a";
  return (
    <PaymentTile
      gradient="linear-gradient(135deg, rgba(52,211,153,0.25), rgba(16,185,129,0.05))"
      border="border-emerald-500/40"
      icon={<SiEthereum className="h-7 w-7 text-emerald-400" />}
      label="MINIPAY · CELO"
      title="Scan to pay"
    >
      <div className="mt-3 flex flex-col items-center gap-2">
        <div className="rounded-2xl bg-white p-3 shadow-lg">
          <QRCodeSVG
            value={addr}
            size={132}
            level="M"
            bgColor="#ffffff"
            fgColor="#080808"
          />
        </div>
        <code className="font-mono text-xs text-emerald-600 dark:text-emerald-300">{short}</code>
        <p className="text-[11px] text-stone">Open MiniPay → scan to send on Celo</p>
      </div>
    </PaymentTile>
  );
}

function UsdtTile() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const addr = PAYMENT.usdtAddress;
  const short = "0x7B...3F2a";

  const onCopy = useCallback(async () => {
    const ok = await copyToClipboard(addr);
    if (ok) {
      setCopied(true);
      toast({ title: "USDT address copied", description: short });
      setTimeout(() => setCopied(false), 1800);
    } else {
      toast({ title: "Copy failed", description: "Please copy manually.", variant: "destructive" });
    }
  }, [addr, short, toast]);

  return (
    <PaymentTile
      gradient="linear-gradient(135deg, rgba(45,212,191,0.25), rgba(20,184,166,0.05))"
      border="border-teal-500/40"
      icon={<Wallet className="h-7 w-7 text-teal-300" />}
      label="USDT · BEP-20"
      title="Tether (BSC)"
    >
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card/40 px-4 py-3">
          <code className="truncate font-mono text-xs text-foreground sm:text-sm">{addr}</code>
        </div>
        <button
          onClick={onCopy}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-teal-500/40 bg-teal-500/10 px-3 py-3 font-display text-xs font-bold tracking-widest text-teal-700 dark:text-teal-200 transition-all hover:bg-teal-500/20"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "ADDRESS COPIED" : "COPY ADDRESS"}
        </button>
      </div>
    </PaymentTile>
  );
}

// ---------------------------------------------------------------------------
// Reusable tile shell
// ---------------------------------------------------------------------------
function PaymentTile({
  gradient,
  border,
  icon,
  label,
  title,
  children,
}: {
  gradient: string;
  border: string;
  icon: React.ReactNode;
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card p-5 sm:p-6 shadow-sm",
        border,
      )}
      style={{ backgroundImage: gradient }}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-background/40">
              {icon}
            </div>
            <div>
              <p className="font-display text-[10px] tracking-widest text-ash">{label}</p>
              <p className="font-display text-sm font-bold text-foreground">{title}</p>
            </div>
          </div>
        </div>
        {children}
      </div>
      {/* Subtle top highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/15" />
    </motion.div>
  );
}

function QrSkeleton() {
  return <div className="h-[132px] w-[132px] animate-pulse rounded-xl bg-white/10" />;
}
