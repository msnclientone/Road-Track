import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type Tx = Omit<
  Prisma.TransactionClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export async function processConfirmedBooking(
  _bookingId: string,
  _tx?: Tx,
): Promise<void> {
  /* Inventory is computed dynamically — no permanent changes needed */
}

export async function restoreBookingInventory(
  _bookingId: string,
  _tx?: Tx,
): Promise<void> {
  /* Inventory is computed dynamically — no permanent changes needed */
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
    await prisma.tripBooking.update({
      where: { id: booking.id },
      data: { status: "COMPLETED", inventoryRestored: true },
    });
  }

  return expired.length;
}
