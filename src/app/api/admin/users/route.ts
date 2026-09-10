import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySession, getSessionTokenFromRequest } from "@/lib/admin-auth";

/**
 * GET /api/admin/users
 * List all admin users. Owner-only.
 * Returns: { users: [{ id, username, role, createdAt, lastLoginAt, failedAttempts }] }
 * (Never returns passwordHash.)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await verifySession(getSessionTokenFromRequest(req));
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    if (user.role !== "owner") {
      return NextResponse.json({ error: "Owner access required." }, { status: 403 });
    }

    const users = await db.adminUser.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        failedAttempts: true,
        lockedUntil: true,
      },
    });

    return NextResponse.json({ users, currentUser: user });
  } catch (e) {
    console.error("[/api/admin/users] GET error:", e);
    return NextResponse.json({ error: "Failed to list admins." }, { status: 500 });
  }
}
