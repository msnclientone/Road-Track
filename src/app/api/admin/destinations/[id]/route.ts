import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      console.warn("[DESTINATION PUT] Unauthorized attempt");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    console.log("[DESTINATION PUT] Authenticated user:", session.email, "ID:", id);

    const body = await request.json();
    console.log("[DESTINATION PUT] Request body:", JSON.stringify(body, null, 2));

    const destination = await prisma.destination.update({
      where: { id },
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

    console.log("[DESTINATION PUT] Update succeeded for ID:", id, "Name:", destination.name);
    return NextResponse.json(destination);
  } catch (error) {
    console.error("[DESTINATION PUT] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update destination", detail: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      console.warn("[DESTINATION DELETE] Unauthorized attempt");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    console.log("[DESTINATION DELETE] Authenticated user:", session.email, "ID:", id);

    await prisma.destination.delete({
      where: { id },
    });

    console.log("[DESTINATION DELETE] Delete succeeded for ID:", id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DESTINATION DELETE] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to delete destination", detail: message },
      { status: 500 }
    );
  }
}