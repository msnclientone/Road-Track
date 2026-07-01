import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
