import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/** GET /api/testimonials — returns all client testimonials. */
export async function GET() {
  try {
    const testimonials = await db.testimonial.findMany();
    return NextResponse.json({ testimonials });
  } catch (e) {
    console.error("[/api/testimonials] error:", e);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 },
    );
  }
}
