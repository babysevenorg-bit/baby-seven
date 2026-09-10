import { NextRequest, NextResponse } from "next/server";
import { verifySession, getSessionTokenFromRequest } from "@/lib/admin-auth";

/**
 * GET /api/admin/auth/me
 * Returns the currently-logged-in admin user, or 401 if no valid session.
 * Used by the admin panel to check whether the user is authenticated on
 * page load (so it can show either the login form or the dashboard).
 */
export async function GET(req: NextRequest) {
  try {
    const token = getSessionTokenFromRequest(req);
    const user = await verifySession(token);
    if (!user) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 },
      );
    }
    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (e) {
    console.error("[/api/admin/auth/me] error:", e);
    return NextResponse.json({ error: "Session check failed." }, { status: 500 });
  }
}
