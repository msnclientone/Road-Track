import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  processConfirmedBooking,
  restoreBookingInventory,
} from "@/lib/booking-inventory";

const VALID_STATUSES = ["NEW", "CONTACTED", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;

function isAcRoom(roomType: string): boolean {
  return /^(AC|A\/C|AIR CONDITIONED)$/i.test(roomType);
}

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

    const existing = await prisma.tripBooking.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 },
      );
    }

    if (newStatus === "CONFIRMED") {
      const updated = await prisma.$transaction(async (tx) => {
        const booking = await tx.tripBooking.findUniqueOrThrow({
          where: { id },
        });

        if (booking.inventoryUpdated) return booking;

        if (booking.selectedVehicleId && booking.checkIn && booking.checkOut) {
          const overlapping = await tx.tripBooking.findFirst({
            where: {
              selectedVehicleId: booking.selectedVehicleId,
              status: "CONFIRMED",
              id: { not: id },
              checkIn: { lt: booking.checkOut },
              checkOut: { gt: booking.checkIn },
            },
          });
          if (overlapping) {
            throw new Error(
              "This vehicle is already booked during the selected dates.",
            );
          }
        }

        if (booking.selectedResortId && booking.roomType) {
          const resort = await tx.resort.findUniqueOrThrow({
            where: { id: booking.selectedResortId },
          });
          const ac = isAcRoom(booking.roomType);
          if (ac && resort.availableAcRooms <= 0) {
            throw new Error(
              "No AC rooms are available for the selected dates.",
            );
          }
          if (!ac && resort.availableNonAcRooms <= 0) {
            throw new Error(
              "No Non-AC rooms are available for the selected dates.",
            );
          }
        }

        await processConfirmedBooking(id, tx);

        return tx.tripBooking.update({
          where: { id },
          data: { status: "CONFIRMED", inventoryUpdated: true },
        });
      });

      revalidatePath("/");
      revalidatePath("/admin");
      revalidatePath("/vehicle-owner");
      revalidatePath("/resort-owner");

      return NextResponse.json({ booking: updated });
    }

    if (newStatus === "COMPLETED") {
      const updated = await prisma.$transaction(async (tx) => {
        const booking = await tx.tripBooking.findUniqueOrThrow({
          where: { id },
        });

        if (booking.inventoryRestored) return booking;

        if (booking.inventoryUpdated) {
          await restoreBookingInventory(id, tx);
        }

        return tx.tripBooking.update({
          where: { id },
          data: { status: "COMPLETED", inventoryRestored: true },
        });
      });

      revalidatePath("/");
      revalidatePath("/admin");
      revalidatePath("/vehicle-owner");
      revalidatePath("/resort-owner");

      return NextResponse.json({ booking: updated });
    }

    if (newStatus === "CANCELLED") {
      const updated = await prisma.$transaction(async (tx) => {
        const booking = await tx.tripBooking.findUniqueOrThrow({
          where: { id },
        });

        if (booking.inventoryRestored) return booking;

        if (booking.inventoryUpdated) {
          await restoreBookingInventory(id, tx);
        }

        return tx.tripBooking.update({
          where: { id },
          data: { status: "CANCELLED", inventoryRestored: true },
        });
      });

      revalidatePath("/");
      revalidatePath("/admin");
      revalidatePath("/vehicle-owner");
      revalidatePath("/resort-owner");

      return NextResponse.json({ booking: updated });
    }

    const updated = await prisma.tripBooking.update({
      where: { id },
      data: { status: newStatus },
    });

    return NextResponse.json({ booking: updated });
  } catch (error) {
    if (error instanceof Error) {
      const msg = error.message;
      if (
        msg.includes("already booked") ||
        msg.includes("No AC rooms") ||
        msg.includes("No Non-AC rooms")
      ) {
        return NextResponse.json({ error: msg }, { status: 409 });
      }
    }
    console.error("Failed to update booking", error);
    return NextResponse.json(
      { error: "Failed to update booking." },
      { status: 500 },
    );
  }
}
