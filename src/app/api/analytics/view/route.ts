import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();

    if (cookieStore.get("rt_visited")) {
      return NextResponse.json({ ok: true, note: "already counted" });
    }

    const result = await prisma.websiteAnalytics.upsert({
      where: { id: "main" },
      update: { totalViews: { increment: 1 } },
      create: { id: "main", totalViews: 1, lastResetAt: new Date() },
    });

    console.log("[ANALYTICS VIEW] View recorded. New total:", result.totalViews);

    const response = NextResponse.json({ ok: true, totalViews: result.totalViews });
    response.cookies.set("rt_visited", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[ANALYTICS VIEW] Error:", error);
    return NextResponse.json(
      { error: "Failed to record view" },
      { status: 500 }
    );
  }
}