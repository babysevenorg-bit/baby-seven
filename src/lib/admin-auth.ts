/**
 * Server-side auth helpers for the admin Studio.
 *
 * Security model:
 *   - Passwords are hashed with bcrypt (12 rounds).
 *   - Sessions are opaque tokens stored as HTTP-only cookies. The token is
 *     32 random bytes (base64url). We store SHA-256(token) in the DB so a DB
 *     leak can't be replayed as a session.
 *   - Sessions expire after 24h of inactivity (rolling).
 *   - Failed login attempts lock the account for 15 minutes after 5 tries.
 *
 * Edge-runtime compatibility:
 *   - bcryptjs is pure JS (no native bindings) so it runs on Cloudflare's
 *     edge runtime. (bcrypt itself would NOT — it's a native addon.)
 *   - We use Web Crypto (`crypto.subtle` / `crypto.getRandomValues`) for
 *     the SHA-256 hash and random token generation, which is available in
 *     both Node 20+ and the Cloudflare Workers runtime.
 *   - Cookies use the standard `Set-Cookie` header, no Node `cookie` package.
 */
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const BCRYPT_ROUNDS = 12;
const SESSION_COOKIE = "babyseven_admin";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours of inactivity
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

// ---------------------------------------------------------------------------
// Password hashing
// ---------------------------------------------------------------------------

export async function hashPassword(plain: string): Promise<string> {
  if (plain.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  // bcryptjs's compare is constant-time — safe against timing attacks.
  return bcrypt.compare(plain, hash);
}

// ---------------------------------------------------------------------------
// Session token + cookie helpers
// ---------------------------------------------------------------------------

/** Generate a 32-byte random session token, base64url-encoded. */
export function generateSessionToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

/** SHA-256(token) → hex. We store this in the DB, never the raw token. */
export async function hashToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return bufToHex(digest);
}

/** Build a Set-Cookie header value for the session token. */
export function buildSessionCookie(token: string, maxAgeMs = SESSION_TTL_MS): string {
  const maxAgeSec = Math.floor(maxAgeMs / 1000);
  return [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    `Max-Age=${maxAgeSec}`,
  ].join("; ");
}

/** Build a Set-Cookie header value that immediately expires the session cookie. */
export function buildExpiredCookie(): string {
  return [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    "Max-Age=0",
  ].join("; ");
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;

// ---------------------------------------------------------------------------
// Login / logout
// ---------------------------------------------------------------------------

type LoginResult =
  | { ok: true; token: string; user: { id: string; username: string; role: string } }
  | { ok: false; error: string; lockedUntil?: Date };

export async function login(args: {
  username: string;
  password: string;
  userAgent?: string;
  ip?: string;
}): Promise<LoginResult> {
  const username = args.username.trim().toLowerCase();
  const user = await db.adminUser.findUnique({ where: { username } });

  if (!user) {
    // Don't leak whether the username exists — return the same error as a bad
    // password. (bcrypt.compare with a dummy hash keeps the timing similar.)
    await bcrypt.compare(args.password, "$2a$12$dummyhashplaceholderplaceholderplaceholderplaceholderplaceholder");
    return { ok: false, error: "Invalid username or password." };
  }

  // Check lockout
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return {
      ok: false,
      error: "Too many failed attempts. Try again in 15 minutes.",
      lockedUntil: user.lockedUntil,
    };
  }

  // Verify password
  const valid = await verifyPassword(args.password, user.passwordHash);
  if (!valid) {
    const newAttempts = user.failedAttempts + 1;
    const shouldLock = newAttempts >= MAX_FAILED_ATTEMPTS;
    await db.adminUser.update({
      where: { id: user.id },
      data: {
        failedAttempts: newAttempts,
        lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_MS) : null,
      },
    });
    return {
      ok: false,
      error: shouldLock
        ? "Account locked for 15 minutes after 5 failed attempts."
        : "Invalid username or password.",
    };
  }

  // Success — reset failed attempts, create session, update lastLoginAt
  await db.adminUser.update({
    where: { id: user.id },
    data: { failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  });

  const token = generateSessionToken();
  const tokenHash = await hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.adminSession.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
      lastSeenAt: new Date(),
      userAgent: args.userAgent?.slice(0, 200),
      ip: args.ip?.slice(0, 50),
    },
  });

  return {
    ok: true,
    token,
    user: { id: user.id, username: user.username, role: user.role },
  };
}

export async function logout(token: string | undefined): Promise<void> {
  if (!token) return;
  const tokenHash = await hashToken(token);
  await db.adminSession.deleteMany({ where: { tokenHash } });
}

// ---------------------------------------------------------------------------
// Session verification (called by every protected API route)
// ---------------------------------------------------------------------------

export type SessionUser = {
  id: string;
  username: string;
  role: string;
};

export async function verifySession(
  token: string | undefined,
): Promise<SessionUser | null> {
  if (!token) return null;

  const tokenHash = await hashToken(token);
  const session = await db.adminSession.findUnique({ where: { tokenHash } });
  if (!session) return null;

  // Check expiry
  if (session.expiresAt < new Date()) {
    await db.adminSession.delete({ where: { id: session.id } });
    return null;
  }

  // Rolling expiry: extend by 24h on every authenticated request
  const newExpiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.adminSession.update({
    where: { id: session.id },
    data: { expiresAt: newExpiresAt, lastSeenAt: new Date() },
  });

  const user = await db.adminUser.findUnique({ where: { id: session.userId } });
  if (!user) {
    await db.adminSession.delete({ where: { id: session.id } });
    return null;
  }

  return { id: user.id, username: user.username, role: user.role };
}

/** Extract the session cookie value from a Request's Cookie header. */
export function getSessionTokenFromRequest(req: Request): string | undefined {
  const cookieHeader = req.headers.get("Cookie");
  if (!cookieHeader) return undefined;
  return parseCookie(cookieHeader)[SESSION_COOKIE];
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function parseCookie(header: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    out[k] = decodeURIComponent(v);
  }
  return out;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
