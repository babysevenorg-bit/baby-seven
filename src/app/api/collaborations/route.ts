import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/collaborations
 * Returns all collaboration requests, newest first. Used by the admin panel.
 */
export async function GET() {
  try {
    const collaborations = await db.collaboration.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ collaborations });
  } catch (e) {
    console.error("[/api/collaborations] GET error:", e);
    return NextResponse.json(
      { error: "Failed to fetch collaborations" },
      { status: 500 },
    );
  }
}
