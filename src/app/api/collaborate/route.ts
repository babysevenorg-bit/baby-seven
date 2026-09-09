import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type CollaborateBody = {
  fullName?: string;
  email?: string;
  tier?: string; // 'Apprentice' | 'Partner' | 'Exec'
  budget?: number;
  message?: string;
};

const VALID_TIERS = new Set(["Apprentice", "Partner", "Exec"]);

/**
 * POST /api/collaborate
 * Validates the payload and inserts a new collaboration request.
 * Simulates an auto-reply email by logging to the server console.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CollaborateBody;

    // --- validation --------------------------------------------------------
    const fullName = (body.fullName ?? "").trim();
    const email = (body.email ?? "").trim();
    const tier = (body.tier ?? "").trim();
    const message = (body.message ?? "").trim();
    const budget = Number(body.budget);

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
    if (!VALID_TIERS.has(tier)) {
      return NextResponse.json(
        { error: "Tier must be one of: Apprentice, Partner, Exec." },
        { status: 400 },
      );
    }
    if (Number.isNaN(budget) || budget < 0) {
      return NextResponse.json(
        { error: "Budget must be a positive number." },
        { status: 400 },
      );
    }
    if (!message || message.length < 10) {
      return NextResponse.json(
        { error: "Pitch / message must be at least 10 characters." },
        { status: 400 },
      );
    }

    // --- insert ------------------------------------------------------------
    const record = await db.collaboration.create({
      data: {
        fullName,
        email,
        tier,
        budget: Math.round(budget),
        message,
        status: "Pending",
      },
    });

    // --- auto-reply simulation (per spec) ---------------------------------
    // In production this would send a real email via Resend/SendGrid.
    // For now we log a clear confirmation so a developer can verify it ran.
    console.log(
      `[auto-reply] To: ${email}\n` +
        `Subject: We received your ${tier} collaboration request 📬\n` +
        `Body: Hi ${fullName}, thanks for reaching out to Baby Seven. ` +
        `We've logged your ${tier} tier pitch (budget $${budget}) and will respond within 48h. ` +
        `Your request ID is ${record.id}.`,
    );

    return NextResponse.json(
      {
        ok: true,
        id: record.id,
        message: "Collaboration request received. Auto-reply sent.",
      },
      { status: 201 },
    );
  } catch (e) {
    console.error("[/api/collaborate] error:", e);
    return NextResponse.json(
      { error: "Failed to submit collaboration request." },
      { status: 500 },
    );
  }
}
