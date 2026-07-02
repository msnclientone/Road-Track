import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const resorts = await prisma.resort.findMany({
      where: {
        status: "APPROVED",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        address: true,
        googleMapsLink: true,
        priceMin: true,
        priceMax: true,
        availableAcRooms: true,
        availableNonAcRooms: true,
        amenities: true,
        status: true,
        createdAt: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        destination: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        media: {
          select: {
            url: true,
            type: true,
            order: true,
          },
          orderBy: { order: "asc" },
          take: 1,
        },
        rooms: {
          select: {
            id: true,
            name: true,
            pricePerNight: true,
            maxOccupancy: true,
            availability: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, resorts });
  } catch (err) {
    console.error("list approved resorts failed:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Unable to list resorts", detail: message }, { status: 500 });
  }
}
