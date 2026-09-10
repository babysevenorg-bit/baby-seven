import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySession, getSessionTokenFromRequest } from "@/lib/admin-auth";

/**
 * DELETE /api/collaborations/[id]
 * Remove a collaboration request. Protected — requires an admin session.
 * Used by the admin panel.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await verifySession(getSessionTokenFromRequest(req));
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const { id } = await params;
    const existing = await db.collaboration.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Collaboration not found." },
        { status: 404 },
      );
    }
    await db.collaboration.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[/api/collaborations/[id]] DELETE error:", e);
    return NextResponse.json(
      { error: "Failed to delete collaboration." },
      { status: 500 },
    );
  }
}
