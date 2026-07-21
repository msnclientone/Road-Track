import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { tripNoteSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const notes = await prisma.tripNote.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("[ADMIN TRIP_NOTES GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trip notes" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = tripNoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const note = await prisma.tripNote.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description || null,
        price: parsed.data.price,
        totalKm: parsed.data.totalKm,
        imageUrl: parsed.data.imageUrl,
        isActive: parsed.data.isActive,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("[ADMIN TRIP_NOTES POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to create trip note" },
      { status: 500 },
    );
  }
}
