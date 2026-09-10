"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Trash2,
  Mail,
  ExternalLink,
  Lock,
  ArrowLeft,
  Bell,
  LogOut,
  Eye,
  EyeOff,
  Loader2,
  KeyRound,
} from "lucide-react";
import { FaTools } from "react-icons/fa";
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

type SessionUser = {
  id: string;
  username: string;
  role: string;
};

const STATUS_FLOW = ["Pending", "Shortlisted", "Hired"] as const;
type Status = (typeof STATUS_FLOW)[number];

/**
 * AdminDashboard — hidden view accessible via the "Studio Access" link in
 * the footer or the URL hash `#admin`.
 *
 * Authentication:
 *   - On mount, calls GET /api/admin/auth/me to check for an existing session.
 *   - If unauthenticated, shows the LoginForm (username + password).
 *   - If authenticated, shows the AdminPanel with the data tables.
 *   - Logout button POSTs to /api/admin/auth/logout and resets the session.
 *
 * All write operations (PATCH/DELETE) go through protected API routes that
 * verify the session server-side — so even if someone reads the source code,
 * they can't call those endpoints without a valid session cookie.
 */
export function AdminDashboard() {
  const { setView } = useNav();
  const [session, setSession] = useState<SessionUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // On mount, check if we already have a valid session cookie.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/auth/me")
      .then((r) => (r.ok ? r.json() : { authenticated: false }))
      .then((d) => {
        if (!cancelled) {
          if (d.authenticated) setSession(d.user);
          setCheckingSession(false);
        }
      })
      .catch(() => {
        if (!cancelled) setCheckingSession(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (checkingSession) return <LoadingGate />;
  if (!session)
    return <LoginForm onLogin={(u) => setSession(u)} setView={setView} />;
  return (
    <AdminPanel
      session={session}
      onLogout={() => setSession(null)}
      setView={setView}
    />
  );
}

// ---------------------------------------------------------------------------
// Loading gate — shown while we check the existing session
// ---------------------------------------------------------------------------
function LoadingGate() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center px-4 pt-20">
      <div className="flex flex-col items-center gap-3 text-ash">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
        <span className="font-display text-xs tracking-widest">CHECKING SESSION…</span>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Login form — replaces the demo PIN gate
// ---------------------------------------------------------------------------
function LoginForm({
  onLogin,
  setView,
}: {
  onLogin: (user: SessionUser) => void;
  setView: (v: ViewId) => void;
}) {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const u = username.trim().toLowerCase();
    if (!u || password.length < 8) {
      setError("Enter your username and password.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
        toast({
          title: "Login failed",
          description: data.error || "Try again.",
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Welcome back", description: `Signed in as ${data.user.username}` });
      onLogin(data.user);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
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
          <p className="font-display text-xs tracking-[0.3em] text-cyan">SECURE</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-foreground">Studio Access</h2>
          <p className="mt-2 text-sm text-ash">
            Sign in with your admin credentials to manage applications.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-3 text-left">
            <div>
              <label className="mb-1.5 block font-display text-[10px] tracking-widest text-ash">
                USERNAME
              </label>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your-admin-name"
                className="w-full rounded-xl border border-border bg-card/40 px-4 py-3 text-sm text-foreground placeholder:text-stone focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/40"
                autoFocus
                disabled={submitting}
              />
            </div>

            <div>
              <label className="mb-1.5 block font-display text-[10px] tracking-widest text-ash">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-border bg-card/40 px-4 py-3 pr-11 text-sm text-foreground placeholder:text-stone focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/40"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 font-display text-xs font-bold tracking-widest text-void transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  SIGNING IN…
                </>
              ) : (
                <>
                  <KeyRound className="h-3.5 w-3.5" />
                  SIGN IN
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setView("home")}
              disabled={submitting}
              className="w-full rounded-full border border-border bg-card/40 px-6 py-2.5 font-display text-xs tracking-widest text-ash hover:text-foreground"
            >
              BACK TO SITE
            </button>
          </form>

          <p className="mt-6 text-[11px] text-stone">
            🔒 Account locks for 15 minutes after 5 failed attempts.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Admin panel — manages editors + collaborations
// ---------------------------------------------------------------------------
type Tab = "editors" | "collaborations" | "subscribers";

function AdminPanel({
  session,
  onLogout,
  setView,
}: {
  session: SessionUser;
  onLogout: () => void;
  setView: (v: ViewId) => void;
}) {
  const [tab, setTab] = useState<Tab>("editors");
  const [editors, setEditors] = useState<Editor[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [notifyCount, setNotifyCount] = useState(0);
  const [subscribers, setSubscribers] = useState<
    { id: string; email: string; createdAt: string; notified: boolean }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const { toast } = useToast();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [eRes, cRes, nRes] = await Promise.all([
        fetch("/api/editors").then((r) => r.json()),
        fetch("/api/collaborations").then((r) => r.json()),
        fetch("/api/notify").then((r) => r.json()),
      ]);
      setEditors(eRes.editors ?? []);
      setCollaborations(cRes.collaborations ?? []);
      setNotifyCount(nRes.count ?? 0);
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

  const loadSubscribers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notify-subscribers");
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers ?? []);
      } else if (res.status === 403) {
        toast({
          title: "Owner-only",
          description: "Subscriber emails are visible to owner accounts only.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Failed to load subscribers",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (tab === "subscribers") loadSubscribers();
  }, [tab, loadSubscribers]);

  const updateEditorStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/editors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast({ title: `Editor marked ${status}` });
      refresh();
    } else if (res.status === 401) {
      toast({
        title: "Session expired",
        description: "Please sign in again.",
        variant: "destructive",
      });
      onLogout();
    } else {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const deleteEditor = async (id: string) => {
    const res = await fetch(`/api/editors/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Editor removed" });
      refresh();
    } else if (res.status === 401) {
      toast({
        title: "Session expired",
        description: "Please sign in again.",
        variant: "destructive",
      });
      onLogout();
    } else {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const deleteCollaboration = async (id: string) => {
    const res = await fetch(`/api/collaborations/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Request removed" });
      refresh();
    } else if (res.status === 401) {
      toast({
        title: "Session expired",
        description: "Please sign in again.",
        variant: "destructive",
      });
      onLogout();
    } else {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      toast({ title: "Signed out" });
    } catch {
      // ignore — local state is what matters
    } finally {
      setLoggingOut(false);
      onLogout();
    }
  };

  return (
    <section className="px-4 pt-32 pb-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-display text-xs tracking-[0.3em] text-cyan">ADMIN STUDIO</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">
              Pipeline Overview
            </h2>
            <p className="mt-1 text-xs text-stone">
              Signed in as{" "}
              <span className="font-mono text-foreground">{session.username}</span>{" "}
              ({session.role})
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-4 py-2 font-display text-xs tracking-widest text-ash hover:text-foreground"
            >
              {loggingOut ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LogOut className="h-3.5 w-3.5" />
              )}
              SIGN OUT
            </button>
            <button
              onClick={() => setView("home")}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-4 py-2 font-display text-xs tracking-widest text-ash hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              EXIT
            </button>
          </div>
        </div>

        {/* Stat strip */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <StatCard label="Reel Editors" value={editors.length} icon={<Shield className="h-4 w-4 text-cyan" />} />
          <StatCard
            label="Pending"
            value={editors.filter((e) => e.status === "Pending").length}
            icon={<Lock className="h-4 w-4 text-gold" />}
          />
          <StatCard label="Collab Requests" value={collaborations.length} icon={<Mail className="h-4 w-4 text-cyan" />} />
          <StatCard
            label="Launch Subscribers"
            value={notifyCount}
            icon={<Bell className="h-4 w-4 text-gold" />}
          />
          <StatCard
            label="Hired Editors"
            value={editors.filter((e) => e.status === "Hired").length}
            icon={<Shield className="h-4 w-4 text-emerald-400" />}
          />
        </div>

        {/* Support Hub status banner */}
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3">
          <FaTools className="h-4 w-4 text-gold" />
          <p className="flex-1 text-xs text-ash">
            <span className="font-display tracking-widest text-gold">SUPPORT HUB:</span>{" "}
            <span className="text-foreground">MAINTENANCE MODE</span> (IS_LIVE = false).
            Flip the switch in{" "}
            <code className="rounded bg-card/60 px-1.5 py-0.5 font-mono text-[10px] text-foreground">
              src/components/baby-seven/support-view.tsx
            </code>{" "}
            to go live with payments.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="mb-6 inline-flex flex-wrap gap-1 rounded-full border border-border bg-card/40 p-1.5">
          <TabButton active={tab === "editors"} onClick={() => setTab("editors")}>
            REEL EDITORS ({editors.length})
          </TabButton>
          <TabButton active={tab === "collaborations"} onClick={() => setTab("collaborations")}>
            COLLABORATIONS ({collaborations.length})
          </TabButton>
          <TabButton active={tab === "subscribers"} onClick={() => setTab("subscribers")}>
            SUBSCRIBERS ({notifyCount})
          </TabButton>
        </div>

        {/* Tables */}
        {loading ? (
          <div className="glass-card flex h-64 items-center justify-center text-ash">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-gold" />
            Loading…
          </div>
        ) : tab === "editors" ? (
          <EditorsTable
            editors={editors}
            onAdvance={updateEditorStatus}
            onDelete={deleteEditor}
          />
        ) : tab === "collaborations" ? (
          <CollaborationsTable
            collaborations={collaborations}
            onDelete={deleteCollaboration}
          />
        ) : (
          <SubscribersTable subscribers={subscribers} />
        )}
      </div>
    </section>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-5 py-2 font-display text-xs font-bold tracking-widest transition-all",
        active ? "bg-gold text-void" : "text-ash hover:text-foreground",
      )}
    >
      {children}
    </button>
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

function SubscribersTable({
  subscribers,
}: {
  subscribers: { id: string; email: string; createdAt: string; notified: boolean }[];
}) {
  if (subscribers.length === 0) {
    return (
      <div className="glass-card flex h-40 items-center justify-center text-ash">
        No subscribers yet. (Visible to owner accounts only.)
      </div>
    );
  }
  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto bs-scroll">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-foreground/[0.03]">
            <tr>
              <th className="px-4 py-3 font-display text-[10px] tracking-widest text-ash">EMAIL</th>
              <th className="px-4 py-3 font-display text-[10px] tracking-widest text-ash">SUBSCRIBED AT</th>
              <th className="px-4 py-3 font-display text-[10px] tracking-widest text-ash">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-mono text-sm text-foreground">{s.email}</td>
                <td className="px-4 py-3 text-xs text-stone">
                  {new Date(s.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 font-display text-[10px] tracking-widest",
                      s.notified
                        ? "border-emerald-400/40 text-emerald-400"
                        : "border-gold/40 text-gold",
                    )}
                  >
                    {s.notified ? "NOTIFIED" : "PENDING"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
