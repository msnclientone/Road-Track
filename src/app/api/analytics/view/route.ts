import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  await prisma.websiteAnalytics.upsert({
    where: {
      id: "main",
    },
    update: {
      totalViews: {
        increment: 1,
      },
    },
    create: {
      id: "main",
      totalViews: 1,
      lastResetAt: new Date(),
    },
  });

  return NextResponse.json({
    ok: true,
  });
}