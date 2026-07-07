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

const ENQUIRY_PREFIX = "ROADE";
const ENQUIRY_PAD_LENGTH = 6;

export async function generateEnquiryId(): Promise<string> {
  const lastEnquiry = await prisma.enquiry.findFirst({
    where: { enquiryId: { not: null } },
    orderBy: { enquiryId: "desc" },
    select: { enquiryId: true },
  });

  let nextNum = 1;
  if (lastEnquiry?.enquiryId) {
    const match = lastEnquiry.enquiryId.match(/ROADE(\d+)/);
    if (match) {
      nextNum = parseInt(match[1], 10) + 1;
    }
  }

  return `${ENQUIRY_PREFIX}${String(nextNum).padStart(ENQUIRY_PAD_LENGTH, "0")}`;
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
