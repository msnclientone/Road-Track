import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  processConfirmedBooking,
  restoreBookingInventory,
} from "@/lib/booking-inventory";

const VALID_STATUSES = ["NEW", "CONTACTED", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;

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

    if (!VALID_STATUSES.includes(body.status as typeof VALID_STATUSES[number])) {
      return NextResponse.json(
        { error: "Invalid status value." },
        { status: 422 },
      );
    }

    const newStatus = body.status as typeof VALID_STATUSES[number];
    const booking = await prisma.tripBooking.findUnique({ where: { id } });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 },
      );
    }

    if (newStatus === "CONFIRMED") {
      const claimed = await prisma.tripBooking.updateMany({
        where: { id, inventoryUpdated: false },
        data: { status: "CONFIRMED", inventoryUpdated: true },
      });

      if (claimed.count > 0) {
        await prisma.$transaction(async (tx) => {
          await processConfirmedBooking(id, tx);
        });
      }

      const updated = await prisma.tripBooking.findUnique({ where: { id } });
      return NextResponse.json({ booking: updated });
    }

    if (newStatus === "COMPLETED") {
      const claimed = await prisma.tripBooking.updateMany({
        where: { id, inventoryRestored: false },
        data: { status: "COMPLETED", inventoryRestored: true },
      });

      if (claimed.count > 0 && booking.inventoryUpdated) {
        await prisma.$transaction(async (tx) => {
          await restoreBookingInventory(id, tx);
        });
      }

      const updated = await prisma.tripBooking.findUnique({ where: { id } });
      return NextResponse.json({ booking: updated });
    }

    if (newStatus === "CANCELLED") {
      const claimed = await prisma.tripBooking.updateMany({
        where: { id, inventoryRestored: false },
        data: { status: "CANCELLED", inventoryRestored: true },
      });

      if (claimed.count > 0 && booking.inventoryUpdated) {
        await prisma.$transaction(async (tx) => {
          await restoreBookingInventory(id, tx);
        });
      }

      if (claimed.count === 0) {
        await prisma.tripBooking.update({
          where: { id },
          data: { status: "CANCELLED" },
        });
      }

      const updated = await prisma.tripBooking.findUnique({ where: { id } });
      return NextResponse.json({ booking: updated });
    }

    const updated = await prisma.tripBooking.update({
      where: { id },
      data: { status: newStatus },
    });

    return NextResponse.json({ booking: updated });
  } catch (error) {
    console.error("Failed to update booking", error);
    return NextResponse.json(
      { error: "Failed to update booking." },
      { status: 500 },
    );
  }
}
