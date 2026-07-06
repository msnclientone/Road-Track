import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/auth/password";
import { getSession } from "@/lib/auth/session";
import { generateTemporaryPassword } from "@/lib/auth/temp-password";
import { addVehicleOwnerSchema } from "@/lib/auth/validation";
import { generateVehicleOwnerId } from "@/lib/generate-id";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const body = await request.json();
    const parsed = addVehicleOwnerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const {
      ownerName,
      ownerPhone,
      vehicleType,
      seatingCapacity,
      registrationNo,
      destinationId,
      pricePerKm,
      pricePerDay,
    } = parsed.data;

    // Generate unique ID and temp password for the owner
    const vehicleOwnerId = await generateVehicleOwnerId();
    const tempPassword = generateTemporaryPassword();
    const passwordHash = await hashPassword(tempPassword);

    // Generate a unique email placeholder for the auto-created owner
    const ownerEmail = `${vehicleOwnerId.toLowerCase()}@roadtrack.internal`;

    // Create the owner account in a transaction with the vehicle
    const result = await prisma.$transaction(async (tx) => {
      const owner = await tx.user.create({
        data: {
          email: ownerEmail,
          name: ownerName.trim(),
          phone: ownerPhone,
          passwordHash,
          role: "VEHICLE_OWNER",
          partnerStatus: "APPROVED",
          vehicleOwnerId,
          mustChangePassword: true,
          emailVerifiedAt: new Date(),
        },
      });

      const vehicle = await tx.vehicle.create({
        data: {
          ownerId: owner.id,
          vehicleType,
          seatingCapacity: Number(seatingCapacity),
          pricePerKm: pricePerKm ?? null,
          pricePerDay: pricePerDay ?? null,
          driverName: ownerName.trim(),
          driverPhone: ownerPhone,
          registrationNo: registrationNo?.toUpperCase() || null,
          destinationId: destinationId || null,
          status: "APPROVED",
        },
        include: {
          destination: { select: { name: true } },
        },
      });

      return { owner, vehicle };
    });

    return NextResponse.json({
      ok: true,
      vehicle: result.vehicle,
      vehicleOwnerId: result.owner.vehicleOwnerId,
      tempPassword,
    });
  } catch (error) {
    console.error("Admin add vehicle failed:", error);
    const message = error instanceof Error ? error.message : "Unable to add vehicle.";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
