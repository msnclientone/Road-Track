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
      name,
      description,
      address,
      acRooms,
      nonAcRooms,
      amenities,
      destinationId,
      imageUrl,
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

    // Generate unique ID and temp password for the owner
    const resortOwnerId = await generateResortOwnerId();
    const tempPassword = generateTemporaryPassword();
    const passwordHash = await hashPassword(tempPassword);

    // Generate a unique email placeholder for the auto-created owner
    const ownerEmail = `${resortOwnerId.toLowerCase()}@roadtrack.internal`;

    // Create the owner account and resort in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const owner = await tx.user.create({
        data: {
          email: ownerEmail,
          name: ownerName.trim(),
          phone: ownerPhone,
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

      if (resolvedImageUrl) {
        await tx.resortMedia.create({
          data: {
            resortId: resort.id,
            url: resolvedImageUrl,
            type: "PHOTO",
            order: 0,
          },
        });
      }

      return { owner, resort };
    });

    return NextResponse.json({
      ok: true,
      resort: result.resort,
      resortOwnerId: result.owner.resortOwnerId,
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
