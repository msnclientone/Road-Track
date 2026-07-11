import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/auth/password";
import { getSession } from "@/lib/auth/session";
import { generateTemporaryPassword } from "@/lib/auth/temp-password";
import { addVehicleOwnerSchema } from "@/lib/auth/validation";
import { generateVehicleOwnerId } from "@/lib/generate-id";
import { convertToDirectImageUrl, isGoogleDriveUrl, isValidImageUrl } from "@/lib/placeholders";
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
      existingOwnerId,
      vehicleType,
      seatingCapacity,
      registrationNo,
      destinationId,
      pricePerKm,
      pricePerDay,
      heroImageUrl,
    } = parsed.data;

    const resolvedHeroImageUrl = heroImageUrl && isGoogleDriveUrl(heroImageUrl)
      ? convertToDirectImageUrl(heroImageUrl)
      : heroImageUrl || null;

    if (resolvedHeroImageUrl && !isValidImageUrl(resolvedHeroImageUrl)) {
      return NextResponse.json(
        { error: "Please enter a valid direct image URL. Search engine image links (Bing, Google Images, Yahoo, etc.) are not supported." },
        { status: 400 },
      );
    }

    let tempPassword: string | null = null;
    let preGeneratedVehicleOwnerId: string | null = null;
    let preGeneratedPasswordHash: string | null = null;

    if (!existingOwnerId) {
      preGeneratedVehicleOwnerId = await generateVehicleOwnerId();
      const pwd = generateTemporaryPassword();
      tempPassword = pwd;
      preGeneratedPasswordHash = await hashPassword(pwd);
    }

    const result = await prisma.$transaction(async (tx) => {
      if (existingOwnerId) {
        const existingOwner = await tx.user.findUnique({
          where: { id: existingOwnerId },
          select: { id: true, name: true, phone: true },
        });
        if (!existingOwner) {
          throw new Error("Selected owner not found.");
        }

        const vehicle = await tx.vehicle.create({
          data: {
            owner: { connect: { id: existingOwner.id } },
            vehicleType,
            seatingCapacity: Number(seatingCapacity),
            pricePerKm: pricePerKm ?? null,
            pricePerDay: pricePerDay ?? null,
            driverName: existingOwner.name ?? "",
            driverPhone: existingOwner.phone ?? "",
            registrationNo: registrationNo?.toUpperCase() || null,
            destination: destinationId ? { connect: { id: destinationId } } : undefined,
            heroImageUrl: resolvedHeroImageUrl,
            status: "APPROVED",
          },
          include: {
            destination: { select: { name: true } },
          },
        });

        return { vehicle, owner: null as any };
      }

      const ownerEmail = `${preGeneratedVehicleOwnerId!.toLowerCase()}@roadtrack.internal`;

      const owner = await tx.user.create({
        data: {
          email: ownerEmail,
          name: ownerName!.trim(),
          phone: ownerPhone!,
          passwordHash: preGeneratedPasswordHash!,
          role: "VEHICLE_OWNER",
          partnerStatus: "APPROVED",
          vehicleOwnerId: preGeneratedVehicleOwnerId!,
          mustChangePassword: true,
          emailVerifiedAt: new Date(),
        },
      });

      const vehicle = await tx.vehicle.create({
        data: {
          owner: { connect: { id: owner.id } },
          vehicleType,
          seatingCapacity: Number(seatingCapacity),
          pricePerKm: pricePerKm ?? null,
          pricePerDay: pricePerDay ?? null,
          driverName: ownerName!.trim(),
          driverPhone: ownerPhone!,
          registrationNo: registrationNo?.toUpperCase() || null,
          destination: destinationId ? { connect: { id: destinationId } } : undefined,
          heroImageUrl: resolvedHeroImageUrl,
          status: "APPROVED",
        },
        include: {
          destination: { select: { name: true } },
        },
      });

      return { vehicle, owner };
    });

    return NextResponse.json({
      ok: true,
      vehicle: result.vehicle,
      vehicleOwnerId: result.owner?.vehicleOwnerId ?? null,
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
