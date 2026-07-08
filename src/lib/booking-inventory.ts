import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type Tx = Omit<
  Prisma.TransactionClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

function isAcRoom(roomType: string | null): boolean {
  if (!roomType) return false;
  const t = roomType.toUpperCase();
  return t === "AC" || t === "A/C" || t === "AIR CONDITIONED";
}

export async function processConfirmedBooking(
  bookingId: string,
  tx?: Tx,
): Promise<void> {
  const run = tx ?? prisma;

  const booking = await run.tripBooking.findUniqueOrThrow({
    where: { id: bookingId },
    select: {
      selectedResortId: true,
      roomType: true,
      selectedVehicleId: true,
      checkOut: true,
      inventoryUpdated: true,
    },
  });

  if (booking.inventoryUpdated) return;

  const updates: Promise<unknown>[] = [];

  if (booking.selectedResortId && booking.roomType) {
    const ac = isAcRoom(booking.roomType);
    updates.push(
      run.resort.update({
        where: { id: booking.selectedResortId },
        data: ac
          ? { availableAcRooms: { decrement: 1 } }
          : { availableNonAcRooms: { decrement: 1 } },
      }),
    );
  }

  if (booking.selectedVehicleId) {
    updates.push(
      run.vehicle.update({
        where: { id: booking.selectedVehicleId },
        data: {
          availability: "UNAVAILABLE",
          bookedUntil: booking.checkOut ?? undefined,
        },
      }),
    );
  }

  await Promise.all(updates);
}

export async function restoreBookingInventory(
  bookingId: string,
  tx?: Tx,
): Promise<void> {
  const run = tx ?? prisma;

  const booking = await run.tripBooking.findUniqueOrThrow({
    where: { id: bookingId },
    select: {
      selectedResortId: true,
      roomType: true,
      selectedVehicleId: true,
      inventoryRestored: true,
    },
  });

  if (booking.inventoryRestored) return;

  const updates: Promise<unknown>[] = [];

  if (booking.selectedResortId && booking.roomType) {
    const ac = isAcRoom(booking.roomType);
    updates.push(
      run.resort.update({
        where: { id: booking.selectedResortId },
        data: ac
          ? { availableAcRooms: { increment: 1 } }
          : { availableNonAcRooms: { increment: 1 } },
      }),
    );
  }

  if (booking.selectedVehicleId) {
    updates.push(
      run.vehicle.update({
        where: { id: booking.selectedVehicleId },
        data: { availability: "AVAILABLE", bookedUntil: null },
      }),
    );
  }

  await Promise.all(updates);
}

export async function autoCompleteExpiredBookings(): Promise<number> {
  const now = new Date();

  const expired = await prisma.tripBooking.findMany({
    where: {
      status: "CONFIRMED",
      checkOut: { lte: now },
      inventoryRestored: false,
    },
    select: { id: true },
  });

  for (const booking of expired) {
    await prisma.$transaction(async (tx) => {
      await restoreBookingInventory(booking.id, tx);

      await tx.tripBooking.update({
        where: { id: booking.id },
        data: { status: "COMPLETED", inventoryRestored: true },
      });
    });
  }

  return expired.length;
}
