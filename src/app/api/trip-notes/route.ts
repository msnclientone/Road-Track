import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const notes = await prisma.tripNote.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("[TRIP_NOTES GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trip notes" },
      { status: 500 },
    );
  }
}
