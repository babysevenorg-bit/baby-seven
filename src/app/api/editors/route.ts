import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/editors
 * Optional query params:
 *   - status: filter by 'Pending' | 'Shortlisted' | 'Hired'
 *
 * Returns the public directory of reel-editor applicants, newest first.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: { status?: string } = {};
    if (status) where.status = status;

    const editors = await db.reelEditor.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ editors });
  } catch (e) {
    console.error("[/api/editors] GET error:", e);
    return NextResponse.json(
      { error: "Failed to fetch editors" },
      { status: 500 },
    );
  }
}

const VALID_STYLES = new Set([
  "Fast-Paced",
  "Cinematic",
  "Story-driven",
  "Viral/Hook",
]);

type EditorBody = {
  fullName?: string;
  email?: string;
  portfolioLink?: string;
  editingStyle?: string;
  sampleReelUrl?: string;
};

/**
 * POST /api/editors
 * Submit a new reel-editor application.
 * In production, the sampleReelUrl would be uploaded to Vercel Blob and
 * the resulting URL would be POSTed here. For this build we accept a URL
 * string directly.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as EditorBody;

    const fullName = (body.fullName ?? "").trim();
    const email = (body.email ?? "").trim();
    const portfolioLink = (body.portfolioLink ?? "").trim();
    const editingStyle = (body.editingStyle ?? "").trim();
    const sampleReelUrl = (body.sampleReelUrl ?? "").trim() || null;

    if (!fullName || fullName.length < 2) {
      return NextResponse.json(
        { error: "Full name is required (min 2 characters)." },
        { status: 400 },
      );
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 },
      );
    }
    if (!portfolioLink || !/^https?:\/\//.test(portfolioLink)) {
      return NextResponse.json(
        { error: "A valid portfolio link (starting with http(s)://) is required." },
        { status: 400 },
      );
    }
    if (!VALID_STYLES.has(editingStyle)) {
      return NextResponse.json(
        {
          error:
            "Editing style must be one of: Fast-Paced, Cinematic, Story-driven, Viral/Hook.",
        },
        { status: 400 },
      );
    }

    const record = await db.reelEditor.create({
      data: {
        fullName,
        email,
        portfolioLink,
        editingStyle,
        sampleReelUrl,
        status: "Pending",
      },
    });

    // Auto-reply simulation (parallel to /api/collaborate).
    console.log(
      `[auto-reply] To: ${email}\n` +
        `Subject: Reel editor application received 🎬\n` +
        `Body: Hi ${fullName}, thanks for applying to the Baby Seven Reel Editors & Makers Hub. ` +
        `We've logged your ${editingStyle} style sample and will review within 5–7 days. ` +
        `Application ID: ${record.id}.`,
    );

    return NextResponse.json(
      {
        ok: true,
        id: record.id,
        message: "Reel editor application received. Auto-reply sent.",
      },
      { status: 201 },
    );
  } catch (e) {
    console.error("[/api/editors] POST error:", e);
    return NextResponse.json(
      { error: "Failed to submit application." },
      { status: 500 },
    );
  }
}
