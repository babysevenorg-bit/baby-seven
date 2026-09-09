import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/stats
 * Returns aggregate counts powering the homepage "Live Status Bar",
 * the hero "Live Collaborator Counter", and the "Proof" badge.
 *
 *   {
 *     collaborations: number,       // total collaboration requests received
 *     featuredProjects: number,    // projects flagged isFeatured
 *     totalProjects: number,
 *     testimonials: number,
 *     reelEditors: number,         // reel-editor applicants
 *     pageViews: Record<route, count>
 *   }
 */
export async function GET() {
  try {
    const [
      collaborations,
      featuredProjects,
      totalProjects,
      testimonials,
      reelEditors,
      pageViews,
    ] = await Promise.all([
      db.collaboration.count(),
      db.project.count({ where: { isFeatured: true } }),
      db.project.count(),
      db.testimonial.count(),
      db.reelEditor.count(),
      db.pageView.findMany(),
    ]);

    const viewsByRoute: Record<string, number> = {};
    for (const pv of pageViews) {
      viewsByRoute[pv.route] = pv.count;
    }

    return NextResponse.json({
      collaborations,
      featuredProjects,
      totalProjects,
      testimonials,
      reelEditors,
      pageViews: viewsByRoute,
    });
  } catch (e) {
    console.error("[/api/stats] error:", e);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
