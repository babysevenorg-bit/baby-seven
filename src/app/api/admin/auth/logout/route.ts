import { NextRequest, NextResponse } from "next/server";
import { logout, buildExpiredCookie, getSessionTokenFromRequest } from "@/lib/admin-auth";

/**
 * POST /api/admin/auth/logout
 * Deletes the server-side session row and expires the cookie.
 */
export async function POST(req: NextRequest) {
  try {
    const token = getSessionTokenFromRequest(req);
    await logout(token);
    const res = NextResponse.json({ ok: true });
    res.headers.set("Set-Cookie", buildExpiredCookie());
    return res;
  } catch (e) {
    console.error("[/api/admin/auth/logout] error:", e);
    return NextResponse.json({ error: "Logout failed." }, { status: 500 });
  }
}
