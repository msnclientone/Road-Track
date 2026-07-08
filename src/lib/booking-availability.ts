import { prisma } from "@/lib/prisma";

export async function getAvailableRooms(
  resortId: string,
  checkIn: Date,
  checkOut: Date,
): Promise<{ ac: number; nonAc: number }> {
  const resort = await prisma.resort.findUnique({
    where: { id: resortId },
    select: { availableAcRooms: true, availableNonAcRooms: true },
  });

  if (!resort) return { ac: 0, nonAc: 0 };

  const totalAc = resort.availableAcRooms;
  const totalNonAc = resort.availableNonAcRooms;

  const overlapping = await prisma.tripBooking.findMany({
    where: {
      selectedResortId: resortId,
      status: "CONFIRMED",
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
    },
    select: { acRoomsRequired: true, nonAcRoomsRequired: true },
  });

  let bookedAc = 0;
  let bookedNonAc = 0;

  for (const b of overlapping) {
    bookedAc += b.acRoomsRequired;
    bookedNonAc += b.nonAcRoomsRequired;
  }

  return {
    ac: Math.max(0, totalAc - bookedAc),
    nonAc: Math.max(0, totalNonAc - bookedNonAc),
  };
}

export async function hasOverlappingVehicleBooking(
  vehicleId: string,
  checkIn: Date,
  checkOut: Date,
  excludeBookingId?: string,
): Promise<boolean> {
  const where: Record<string, unknown> = {
    selectedVehicleId: vehicleId,
    status: "CONFIRMED",
    checkIn: { lt: checkOut },
    checkOut: { gt: checkIn },
  };

  if (excludeBookingId) {
    where.id = { not: excludeBookingId };
  }

  const count = await prisma.tripBooking.count({ where });
  return count > 0;
}

export async function getCurrentActiveReservations(
  resortId: string,
): Promise<{ ac: number; nonAc: number }> {
  const now = new Date();

  const overlapping = await prisma.tripBooking.findMany({
    where: {
      selectedResortId: resortId,
      status: "CONFIRMED",
      checkIn: { lte: now },
      checkOut: { gte: now },
    },
    select: { acRoomsRequired: true, nonAcRoomsRequired: true },
  });

  let bookedAc = 0;
  let bookedNonAc = 0;

  for (const b of overlapping) {
    bookedAc += b.acRoomsRequired;
    bookedNonAc += b.nonAcRoomsRequired;
  }

  return { ac: bookedAc, nonAc: bookedNonAc };
}

export async function getVehicleCurrentBooking(
  vehicleId: string,
): Promise<{ isBooked: boolean; bookedUntil: Date | null }> {
  const now = new Date();

  const active = await prisma.tripBooking.findFirst({
    where: {
      selectedVehicleId: vehicleId,
      status: "CONFIRMED",
      checkIn: { lte: now },
      checkOut: { gte: now },
    },
    select: { checkOut: true },
    orderBy: { checkOut: "desc" },
  });

  if (active) {
    return { isBooked: true, bookedUntil: active.checkOut };
  }

  return { isBooked: false, bookedUntil: null };
}
