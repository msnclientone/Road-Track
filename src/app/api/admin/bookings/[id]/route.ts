import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { status?: string };

    if (!body.status) {
      return NextResponse.json(
        { error: "Status is required." },
        { status: 400 },
      );
    }

    const validStatuses = ["NEW", "CONTACTED", "CONFIRMED", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid status value." },
        { status: 422 },
      );
    }

    const booking = await prisma.tripBooking.update({
      where: { id },
      data: { status: body.status as "NEW" | "CONTACTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" },
    });

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Failed to update booking", error);
    return NextResponse.json(
      { error: "Failed to update booking." },
      { status: 500 },
    );
  }
}
