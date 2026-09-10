import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  verifySession,
  getSessionTokenFromRequest,
  hashPassword,
  verifyPassword,
} from "@/lib/admin-auth";

/**
 * POST /api/admin/password
 * Change the current admin's password. Requires authentication.
 *
 * Body: { currentPassword, newPassword }
 *
 * Validates:
 *   - newPassword is at least 12 characters (stricter than the 8-char minimum
 *     used at initial creation — password changes are a good time to enforce
 *     stronger hygiene).
 *   - currentPassword matches the stored hash (prevents session hijacking
 *     from being escalated to a password change).
 */
export async function POST(req: NextRequest) {
  try {
    const user = await verifySession(getSessionTokenFromRequest(req));
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = (await req.json()) as {
      currentPassword?: string;
      newPassword?: string;
    };
    const currentPassword = body.currentPassword ?? "";
    const newPassword = body.newPassword ?? "";

    if (newPassword.length < 12) {
      return NextResponse.json(
        { error: "New password must be at least 12 characters." },
        { status: 400 },
      );
    }
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "New password must differ from the current one." },
        { status: 400 },
      );
    }

    const admin = await db.adminUser.findUnique({ where: { id: user.id } });
    if (!admin) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const valid = await verifyPassword(currentPassword, admin.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 401 },
      );
    }

    const newHash = await hashPassword(newPassword);
    await db.adminUser.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[/api/admin/password] error:", e);
    return NextResponse.json(
      { error: "Password change failed." },
      { status: 500 },
    );
  }
}
