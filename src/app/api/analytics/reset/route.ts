import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function POST() {
  try {
    const session = await getSession();

    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const analytics = await prisma.websiteAnalytics.findUnique({
      where: {
        id: "main",
      },
    });

    if (!analytics) {
      return NextResponse.json(
        { error: "Analytics not found." },
        { status: 404 }
      );
    }

    await prisma.websiteAnalyticsHistory.create({
      data: {
        totalViews: analytics.totalViews,
      },
    });

    await prisma.websiteAnalytics.update({
      where: {
        id: "main",
      },
      data: {
        totalViews: 0,
        lastResetAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: "Unable to reset visitors.",
      },
      {
        status: 500,
      }
    );
  }
}