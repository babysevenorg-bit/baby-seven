import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/projects
 * Optional query params:
 *   - category: "Writing" | "Video" | "Script"  (filters by category)
 *   - featured: "true"                          (only isFeatured=true)
 *
 * Returns the full list of projects, ordered with Blood Disaster (rank=1)
 * always pinned to the top of its category.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    const where: {
      category?: string;
      isFeatured?: boolean;
    } = {};
    if (category && category !== "All") {
      where.category = category;
    }
    if (featured === "true") {
      where.isFeatured = true;
    }

    const projects = await db.project.findMany({ where });

    // Sort so that rank=1 (Blood Disaster) is always first within its category.
    projects.sort((a, b) => {
      if (a.rank && b.rank) return a.rank - b.rank;
      if (a.rank) return -1;
      if (b.rank) return 1;
      return 0;
    });

    return NextResponse.json({ projects });
  } catch (e) {
    console.error("[/api/projects] error:", e);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}
