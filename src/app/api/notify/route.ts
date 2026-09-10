import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/notify
 * Subscribe an email to the "Support Hub launch" notification list.
 *
 * Used by the Maintenance Mode holding page on /support when IS_LIVE = false.
 * The email must be valid and not already subscribed (the `unique` constraint
 * on NotifySubscriber.email handles dedupe at the DB layer).
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string };
    const email = (body.email ?? "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 },
      );
    }

    // Idempotent: if already subscribed, return success with `alreadySubscribed: true`.
    const existing = await db.notifySubscriber.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({
        ok: true,
        alreadySubscribed: true,
        message: "You're already on the list — we'll ping you the moment it goes live.",
      });
    }

    await db.notifySubscriber.create({ data: { email } });

    // Auto-reply simulation (parallel to /api/collaborate + /api/editors).
    console.log(
      `[notify] To: ${email}\n` +
        `Subject: You're on the list 🚀\n` +
        `Body: Thanks for subscribing to the Baby Seven Support Hub launch alert. ` +
        `We'll email you the moment Binance Pay, PayPal, and MiniPay go live. ` +
        `Stay cinematic.`,
    );

    return NextResponse.json(
      {
        ok: true,
        alreadySubscribed: false,
        message: "Subscribed — we'll email you the moment Support goes live.",
      },
      { status: 201 },
    );
  } catch (e) {
    console.error("[/api/notify] error:", e);
    return NextResponse.json(
      { error: "Failed to subscribe. Try again in a moment." },
      { status: 500 },
    );
  }
}

/**
 * GET /api/notify
 * Returns the current subscriber count (used by the admin dashboard).
 * Intentionally does NOT return the emails themselves to keep the list
 * private to the studio.
 */
export async function GET() {
  try {
    const count = await db.notifySubscriber.count();
    return NextResponse.json({ count });
  } catch (e) {
    console.error("[/api/notify] GET error:", e);
    return NextResponse.json({ error: "Failed to fetch count" }, { status: 500 });
  }
}
