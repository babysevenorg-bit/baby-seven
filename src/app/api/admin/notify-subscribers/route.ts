import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySession, getSessionTokenFromRequest } from "@/lib/admin-auth";

/**
 * GET /api/admin/notify-subscribers
 * List all "Notify Me" subscribers (email + createdAt). Owner-only.
 *
 * The subscriber emails are private to the studio — this endpoint is
 * protected by admin auth (not just session, but owner role specifically).
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

    const subscribers = await db.notifySubscriber.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, createdAt: true, notified: true },
    });

    return NextResponse.json({ subscribers, count: subscribers.length });
  } catch (e) {
    console.error("[/api/admin/notify-subscribers] GET error:", e);
    return NextResponse.json(
      { error: "Failed to list subscribers." },
      { status: 500 },
    );
  }
}
