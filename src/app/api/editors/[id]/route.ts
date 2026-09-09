import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const VALID_STATUSES = new Set(["Pending", "Shortlisted", "Hired"]);

/**
 * PATCH /api/editors/[id]
 * Update a reel-editor applicant's status. Used by the hidden /admin view.
 *
 * Body: { status: "Pending" | "Shortlisted" | "Hired" }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as { status?: string };
    const status = (body.status ?? "").trim();

    if (!VALID_STATUSES.has(status)) {
      return NextResponse.json(
        { error: "Status must be Pending, Shortlisted, or Hired." },
        { status: 400 },
      );
    }

    const existing = await db.reelEditor.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Editor application not found." },
        { status: 404 },
      );
    }

    const updated = await db.reelEditor.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ ok: true, editor: updated });
  } catch (e) {
    console.error("[/api/editors/[id]] PATCH error:", e);
    return NextResponse.json(
      { error: "Failed to update editor status." },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/editors/[id]
 * Remove a reel-editor application. Used by the hidden /admin view.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const existing = await db.reelEditor.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Editor application not found." },
        { status: 404 },
      );
    }
    await db.reelEditor.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[/api/editors/[id]] DELETE error:", e);
    return NextResponse.json(
      { error: "Failed to delete editor." },
      { status: 500 },
    );
  }
}
