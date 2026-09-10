import { NextRequest, NextResponse } from "next/server";
import { login, buildSessionCookie, SESSION_COOKIE_NAME } from "@/lib/admin-auth";

/**
 * POST /api/admin/auth/login
 *
 * Body: { username, password }
 * Sets an HTTP-only `babyseven_admin` cookie on success.
 * Locks the account for 15 minutes after 5 failed attempts.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { username?: string; password?: string };
    const username = (body.username ?? "").trim().toLowerCase();
    const password = body.password ?? "";

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 },
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 },
      );
    }

    const userAgent = req.headers.get("User-Agent") ?? undefined;
    const ip =
      req.headers.get("CF-Connecting-IP") ??
      req.headers.get("X-Forwarded-For") ??
      undefined;

    const result = await login({ username, password, userAgent, ip });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, lockedUntil: result.lockedUntil },
        { status: 401 },
      );
    }

    const res = NextResponse.json(
      {
        ok: true,
        user: result.user,
      },
      { status: 200 },
    );
    res.headers.set("Set-Cookie", buildSessionCookie(result.token));
    return res;
  } catch (e) {
    console.error("[/api/admin/auth/login] error:", e);
    return NextResponse.json(
      { error: "Login failed. Try again." },
      { status: 500 },
    );
  }
}
