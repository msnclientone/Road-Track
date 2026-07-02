import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function POST() {
  try {
    const session = await getSession();

    if (!session || session.role !== "SUPER_ADMIN") {
      console.warn("[ANALYTICS RESET] Unauthorized attempt - no valid SUPER_ADMIN session");
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    console.log("[ANALYTICS RESET] Authenticated user:", session.email);

    const analytics = await prisma.websiteAnalytics.findUnique({
      where: { id: "main" },
    });

    if (!analytics) {
      console.warn("[ANALYTICS RESET] Analytics record not found, creating one");
      const created = await prisma.websiteAnalytics.create({
        data: {
          id: "main",
          totalViews: 0,
          lastResetAt: new Date(),
        },
      });
      console.log("[ANALYTICS RESET] Created new analytics record");
      return NextResponse.json({ ok: true, totalViews: created.totalViews });
    }

    console.log("[ANALYTICS RESET] Current totalViews before reset:", analytics.totalViews);

    await prisma.websiteAnalyticsHistory.create({
      data: {
        totalViews: analytics.totalViews,
      },
    });

    const updated = await prisma.websiteAnalytics.update({
      where: { id: "main" },
      data: {
        totalViews: 0,
        lastResetAt: new Date(),
      },
    });

    console.log("[ANALYTICS RESET] Reset completed. New totalViews:", updated.totalViews);

    return NextResponse.json({
      ok: true,
      totalViews: updated.totalViews,
    });
  } catch (err) {
    console.error("[ANALYTICS RESET] Error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Unable to reset visitors.",
        detail: message,
      },
      {
        status: 500,
      }
    );
  }
}