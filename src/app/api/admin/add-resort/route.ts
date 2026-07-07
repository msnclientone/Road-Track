import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/auth/password";
import { getSession } from "@/lib/auth/session";
import { generateTemporaryPassword } from "@/lib/auth/temp-password";
import { addResortOwnerSchema } from "@/lib/auth/validation";
import { convertToDirectImageUrl, isGoogleDriveUrl, isValidImageUrl } from "@/lib/placeholders";
import { generateResortOwnerId } from "@/lib/generate-id";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const body = await request.json();
    const parsed = addResortOwnerSchema.safeParse(body);

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
      name,
      description,
      address,
      acRooms,
      nonAcRooms,
      amenities,
      destinationId,
      imageUrl,
      additionalImageUrls,
      googleMapsLink,
      nonAcPrice,
      acPrice,
    } = parsed.data;

    const resolvedImageUrl = imageUrl && isGoogleDriveUrl(imageUrl)
      ? convertToDirectImageUrl(imageUrl)
      : imageUrl;

    if (resolvedImageUrl && !isValidImageUrl(resolvedImageUrl)) {
      return NextResponse.json(
        { error: "Please enter a valid direct image URL. Search engine image links (Bing, Google Images, Yahoo, etc.) are not supported." },
        { status: 400 },
      );
    }

    if (acRooms == null || nonAcRooms == null) {
      return NextResponse.json(
        { error: "Please enter AC Rooms and Non AC Rooms." },
        { status: 400 },
      );
    }

    const slugBase = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = `${slugBase}-${Math.random().toString(36).slice(2, 8)}`;

    const amenitiesArray = typeof amenities === "string"
      ? amenities.split(",").map((s: string) => s.trim()).filter(Boolean)
      : Array.isArray(amenities) ? amenities : [];

    // Resolve destination: try id first, then slug, then create
    let finalDestinationId = destinationId;
    const byId = await prisma.destination.findUnique({ where: { id: destinationId } });
    if (!byId) {
      const bySlug = await prisma.destination.findUnique({ where: { slug: destinationId } });
      if (bySlug) {
        finalDestinationId = bySlug.id;
      } else {
        const nameFromSlug = String(destinationId)
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        const created = await prisma.destination.create({
          data: {
            name: nameFromSlug,
            slug: String(destinationId),
            description: `Created via admin: ${nameFromSlug}`,
            published: false,
          },
        });
        finalDestinationId = created.id;
      }
    }

    if (!finalDestinationId) {
      return NextResponse.json({ error: "Invalid destination." }, { status: 400 });
    }

    let tempPassword: string | null = null;

    const result = await prisma.$transaction(async (tx) => {
      if (existingOwnerId) {
        const existingOwner = await tx.user.findUnique({
          where: { id: existingOwnerId },
          select: { id: true },
        });
        if (!existingOwner) {
          throw new Error("Selected owner not found.");
        }

        const resort = await tx.resort.create({
          data: {
            ownerId: existingOwner.id,
            destinationId: finalDestinationId,
            name,
            slug,
            description,
            address: address ?? null,
            googleMapsLink: googleMapsLink || null,
            priceMin: nonAcPrice ?? 0,
            priceMax: acPrice ?? 0,
            availableAcRooms: Number(acRooms),
            availableNonAcRooms: Number(nonAcRooms),
            amenities: amenitiesArray,
            status: "APPROVED",
          },
          include: {
            destination: { select: { name: true } },
          },
        });

        const allImageUrls: string[] = [];
        if (resolvedImageUrl) allImageUrls.push(resolvedImageUrl);
        if (additionalImageUrls) allImageUrls.push(...additionalImageUrls);

        if (allImageUrls.length > 0) {
          await tx.resortMedia.createMany({
            data: allImageUrls.map((url, index) => ({
              resortId: resort.id,
              url,
              type: "PHOTO",
              order: index,
            })),
          });
        }

        return { resort, owner: null as any };
      }

      const resortOwnerId = await generateResortOwnerId();
      const pwd = generateTemporaryPassword();
      tempPassword = pwd;
      const passwordHash = await hashPassword(pwd);
      const ownerEmail = `${resortOwnerId.toLowerCase()}@roadtrack.internal`;

      const owner = await tx.user.create({
        data: {
          email: ownerEmail,
          name: ownerName!.trim(),
          phone: ownerPhone!,
          passwordHash,
          role: "RESORT_OWNER",
          partnerStatus: "APPROVED",
          resortOwnerId,
          mustChangePassword: true,
          emailVerifiedAt: new Date(),
        },
      });

      const resort = await tx.resort.create({
        data: {
          ownerId: owner.id,
          destinationId: finalDestinationId,
          name,
          slug,
          description,
          address: address ?? null,
          googleMapsLink: googleMapsLink || null,
          priceMin: nonAcPrice ?? 0,
          priceMax: acPrice ?? 0,
          availableAcRooms: Number(acRooms),
          availableNonAcRooms: Number(nonAcRooms),
          amenities: amenitiesArray,
          status: "APPROVED",
        },
        include: {
          destination: { select: { name: true } },
        },
      });

      const allImageUrls: string[] = [];
      if (resolvedImageUrl) allImageUrls.push(resolvedImageUrl);
      if (additionalImageUrls) allImageUrls.push(...additionalImageUrls);

      if (allImageUrls.length > 0) {
        await tx.resortMedia.createMany({
          data: allImageUrls.map((url, index) => ({
            resortId: resort.id,
            url,
            type: "PHOTO",
            order: index,
          })),
        });
      }

      return { resort, owner };
    });

    return NextResponse.json({
      ok: true,
      resort: result.resort,
      resortOwnerId: result.owner?.resortOwnerId ?? null,
      tempPassword,
    });
  } catch (error) {
    console.error("Admin add resort failed:", error);
    const message = error instanceof Error ? error.message : "Unable to add resort.";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
