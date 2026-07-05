import { prisma } from "@/lib/prisma";

const VEHICLE_PREFIX = "ROADV";
const RESORT_PREFIX = "ROADR";
const PAD_LENGTH = 4;

export async function generateVehicleOwnerId(): Promise<string> {
  const lastUser = await prisma.user.findFirst({
    where: { vehicleOwnerId: { not: null } },
    orderBy: { vehicleOwnerId: "desc" },
    select: { vehicleOwnerId: true },
  });

  let nextNum = 1;
  if (lastUser?.vehicleOwnerId) {
    const num = parseInt(
      lastUser.vehicleOwnerId.replace(VEHICLE_PREFIX, ""),
      10,
    );
    nextNum = num + 1;
  }

  return `${VEHICLE_PREFIX}${String(nextNum).padStart(PAD_LENGTH, "0")}`;
}

export async function generateResortOwnerId(): Promise<string> {
  const lastUser = await prisma.user.findFirst({
    where: { resortOwnerId: { not: null } },
    orderBy: { resortOwnerId: "desc" },
    select: { resortOwnerId: true },
  });

  let nextNum = 1;
  if (lastUser?.resortOwnerId) {
    const num = parseInt(
      lastUser.resortOwnerId.replace(RESORT_PREFIX, ""),
      10,
    );
    nextNum = num + 1;
  }

  return `${RESORT_PREFIX}${String(nextNum).padStart(PAD_LENGTH, "0")}`;
}
