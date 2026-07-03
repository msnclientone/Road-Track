import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const destinations = await prisma.destination.findMany({
      orderBy: { name: "asc" },
    });

    console.log("[DESTINATION GET] Fetched", destinations.length, "destinations");
    return NextResponse.json(destinations);
  } catch (error) {
    console.error("[DESTINATION GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch destinations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      console.warn("[DESTINATION POST] Unauthorized attempt");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    console.log("[DESTINATION POST] Authenticated user:", session.email);
    console.log("[DESTINATION POST] Request body:", JSON.stringify(body, null, 2));

    const destination = await prisma.destination.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        heroImageUrl: typeof body.heroImageUrl === "string" ? body.heroImageUrl || null : null,
        googleMapsLink: typeof body.googleMapsLink === "string" ? body.googleMapsLink || null : null,
        bestTimeToVisit: typeof body.bestTimeToVisit === "string" ? body.bestTimeToVisit || null : null,
        estTripCostMin: body.estTripCostMin > 0 ? body.estTripCostMin : null,
        estTripCostMax: body.estTripCostMax > 0 ? body.estTripCostMax : null,
        published: body.published ?? true,
      },
    });

    console.log("[DESTINATION POST] Created destination:", destination.id, destination.name);
    return NextResponse.json(destination);
  } catch (error) {
    console.error("[DESTINATION POST] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create destination", detail: message },
      { status: 500 }
    );
  }
}