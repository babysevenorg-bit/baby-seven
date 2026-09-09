"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Trash2, Mail, ExternalLink, Lock, ArrowLeft } from "lucide-react";
import { useNav, type ViewId } from "@/lib/nav";
import { useToast } from "@/hooks/use-toast";
import { cn, formatBudget } from "@/lib/utils";

type Editor = {
  id: string;
  fullName: string;
  email: string;
  portfolioLink: string;
  editingStyle: string;
  sampleReelUrl: string | null;
  status: string;
  createdAt: string;
};

type Collaboration = {
  id: string;
  fullName: string;
  email: string;
  tier: string;
  budget: number;
  message: string;
  status: string;
  createdAt: string;
};

const STATUS_FLOW = ["Pending", "Shortlisted", "Hired"] as const;
type Status = (typeof STATUS_FLOW)[number];

const PIN = "babyseven"; // demo PIN — in production use NextAuth.

/**
 * AdminDashboard — hidden view accessible via URL hash `#admin` or the
 * discreet "Studio Access" link in the footer. Protected by a simple PIN
 * gate (demo only — production should use NextAuth).
 *
 * Shows two tables: Reel Editors and Collaboration requests. Status can be
 * advanced through the pipeline or deleted. Reel editor data also exposed
 * via GET /api/editors and PATCH /api/editors/[id].
 */
export function AdminDashboard() {
  const { setView } = useNav();
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} setView={setView} />;
  return <AdminPanel setView={setView} />;
}

// ---------------------------------------------------------------------------
// PIN gate
// ---------------------------------------------------------------------------
function PinGate({
  onUnlock,
  setView,
}: {
  onUnlock: () => void;
  setView: (v: ViewId) => void;
}) {
  const [value, setValue] = useState("");
  const { toast } = useToast();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === PIN) {
      onUnlock();
      toast({ title: "Studio unlocked", description: "Welcome back, Baby Seven." });
    } else {
      toast({
        title: "Incorrect PIN",
        description: "Hint: the demo PIN is 'babyseven'.",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="px-4 pt-32 pb-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/20 to-cyan/20">
            <Lock className="h-7 w-7 text-gold" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">Studio Access</h2>
          <p className="mt-2 text-sm text-ash">
            Enter your PIN to manage applications. (Demo PIN: <code className="text-cyan">babyseven</code>)
          </p>
          <form onSubmit={submit} className="mt-6 space-y-3">
            <input
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter PIN"
              className="w-full rounded-xl border border-border bg-card/40 px-4 py-3 text-center font-mono text-sm text-foreground placeholder:text-stone focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/40"
              autoFocus
            />
            <button
              type="submit"
              className="w-full rounded-full bg-gold px-6 py-3 font-display text-xs font-bold tracking-widest text-void transition-transform hover:scale-[1.02]"
            >
              UNLOCK
            </button>
            <button
              type="button"
              onClick={() => setView("home")}
              className="w-full rounded-full border border-border bg-card/40 px-6 py-2.5 font-display text-xs tracking-widest text-ash hover:text-foreground"
            >
              BACK TO SITE
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Admin panel — manages editors + collaborations
// ---------------------------------------------------------------------------
type Tab = "editors" | "collaborations";

function AdminPanel({ setView }: { setView: (v: ViewId) => void }) {
  const [tab, setTab] = useState<Tab>("editors");
  const [editors, setEditors] = useState<Editor[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [eRes, cRes] = await Promise.all([
        fetch("/api/editors").then((r) => r.json()),
        fetch("/api/collaborations").then((r) => r.json()),
      ]);
      setEditors(eRes.editors ?? []);
      setCollaborations(cRes.collaborations ?? []);
    } catch {
      toast({
        title: "Failed to load",
        description: "Could not reach the admin API.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateEditorStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/editors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast({ title: `Editor marked ${status}` });
      refresh();
    } else {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const deleteEditor = async (id: string) => {
    const res = await fetch(`/api/editors/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Editor removed" });
      refresh();
    } else {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const deleteCollaboration = async (id: string) => {
    const res = await fetch(`/api/collaborations/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Request removed" });
      refresh();
    } else {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  return (
    <section className="px-4 pt-32 pb-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="font-display text-xs tracking-[0.3em] text-cyan">ADMIN STUDIO</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">
              Pipeline Overview
            </h2>
          </div>
          <button
            onClick={() => setView("home")}
            className="flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-4 py-2 font-display text-xs tracking-widest text-ash hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            EXIT
          </button>
        </div>

        {/* Stat strip */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Reel Editors" value={editors.length} icon={<Shield className="h-4 w-4 text-cyan" />} />
          <StatCard label="Pending" value={editors.filter((e) => e.status === "Pending").length} icon={<Lock className="h-4 w-4 text-gold" />} />
          <StatCard label="Collab Requests" value={collaborations.length} icon={<Mail className="h-4 w-4 text-cyan" />} />
          <StatCard
            label="Hired Editors"
            value={editors.filter((e) => e.status === "Hired").length}
            icon={<Shield className="h-4 w-4 text-emerald-400" />}
          />
        </div>

        {/* Tab switcher */}
        <div className="mb-6 inline-flex gap-1 rounded-full border border-border bg-card/40 p-1.5">
          <button
            onClick={() => setTab("editors")}
            className={cn(
              "rounded-full px-5 py-2 font-display text-xs font-bold tracking-widest transition-all",
              tab === "editors" ? "bg-gold text-void" : "text-ash hover:text-foreground",
            )}
          >
            REEL EDITORS ({editors.length})
          </button>
          <button
            onClick={() => setTab("collaborations")}
            className={cn(
              "rounded-full px-5 py-2 font-display text-xs font-bold tracking-widest transition-all",
              tab === "collaborations" ? "bg-gold text-void" : "text-ash hover:text-foreground",
            )}
          >
            COLLABORATIONS ({collaborations.length})
          </button>
        </div>

        {/* Tables */}
        {loading ? (
          <div className="glass-card flex h-64 items-center justify-center text-ash">
            Loading…
          </div>
        ) : tab === "editors" ? (
          <EditorsTable
            editors={editors}
            onAdvance={updateEditorStatus}
            onDelete={deleteEditor}
          />
        ) : (
          <CollaborationsTable
            collaborations={collaborations}
            onDelete={deleteCollaboration}
          />
        )}
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="glass-card flex items-center gap-3 p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground/5">
        {icon}
      </div>
      <div>
        <p className="font-display text-xl font-bold text-foreground">{value}</p>
        <p className="text-[10px] uppercase tracking-widest text-stone">{label}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "Pending"
      ? "border-gold/40 text-gold"
      : status === "Shortlisted"
        ? "border-cyan/40 text-cyan"
        : status === "Hired"
          ? "border-emerald-400/40 text-emerald-400"
          : "border-border text-ash";
  return (
    <span className={cn("rounded-full border px-2 py-0.5 font-display text-[10px] tracking-widest", color)}>
      {status.toUpperCase()}
    </span>
  );
}

function EditorsTable({
  editors,
  onAdvance,
  onDelete,
}: {
  editors: Editor[];
  onAdvance: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}) {
  if (editors.length === 0) {
    return (
      <div className="glass-card flex h-40 items-center justify-center text-ash">
        No reel editor applicants yet.
      </div>
    );
  }
  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto bs-scroll">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-foreground/[0.03]">
            <tr>
              <th className="px-4 py-3 font-display text-[10px] tracking-widest text-ash">NAME</th>
              <th className="px-4 py-3 font-display text-[10px] tracking-widest text-ash">STYLE</th>
              <th className="px-4 py-3 font-display text-[10px] tracking-widest text-ash">PORTFOLIO</th>
              <th className="px-4 py-3 font-display text-[10px] tracking-widest text-ash">STATUS</th>
              <th className="px-4 py-3 text-right font-display text-[10px] tracking-widest text-ash">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {editors.map((e) => {
              const idx = STATUS_FLOW.indexOf(e.status as Status);
              const next = idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
              return (
                <tr key={e.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-display text-sm font-bold text-foreground">{e.fullName}</p>
                    <p className="text-xs text-stone">{e.email}</p>
                  </td>
                  <td className="px-4 py-3 text-ash">{e.editingStyle}</td>
                  <td className="px-4 py-3">
                    <a
                      href={e.portfolioLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-cyan hover:underline"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {next && (
                        <button
                          onClick={() => onAdvance(e.id, next)}
                          className="rounded-full border border-cyan/40 bg-cyan/10 px-3 py-1 font-display text-[10px] tracking-widest text-cyan hover:bg-cyan/20"
                        >
                          MARK {next.toUpperCase()}
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(e.id)}
                        className="rounded-full border border-destructive/40 bg-destructive/10 px-2.5 py-1 text-destructive hover:bg-destructive/20"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CollaborationsTable({
  collaborations,
  onDelete,
}: {
  collaborations: Collaboration[];
  onDelete: (id: string) => void;
}) {
  if (collaborations.length === 0) {
    return (
      <div className="glass-card flex h-40 items-center justify-center text-ash">
        No collaboration requests yet.
      </div>
    );
  }
  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto bs-scroll">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-foreground/[0.03]">
            <tr>
              <th className="px-4 py-3 font-display text-[10px] tracking-widest text-ash">NAME</th>
              <th className="px-4 py-3 font-display text-[10px] tracking-widest text-ash">TIER</th>
              <th className="px-4 py-3 font-display text-[10px] tracking-widest text-ash">BUDGET</th>
              <th className="px-4 py-3 font-display text-[10px] tracking-widest text-ash">PITCH</th>
              <th className="px-4 py-3 text-right font-display text-[10px] tracking-widest text-ash">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {collaborations.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <p className="font-display text-sm font-bold text-foreground">{c.fullName}</p>
                  <p className="text-xs text-stone">{c.email}</p>
                </td>
                <td className="px-4 py-3 text-ash">{c.tier}</td>
                <td className="px-4 py-3 text-gold">{formatBudget(c.budget)}</td>
                <td className="px-4 py-3 max-w-xs text-ash">
                  <p className="truncate">{c.message}</p>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onDelete(c.id)}
                    className="rounded-full border border-destructive/40 bg-destructive/10 px-2.5 py-1 text-destructive hover:bg-destructive/20"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
