import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const destination = await prisma.destination.update({
      where: {
        id,
      },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        heroImageUrl: body.heroImageUrl,
        bestTimeToVisit: body.bestTimeToVisit,
        estTripCostMin: body.estTripCostMin,
        estTripCostMax: body.estTripCostMax,
        published: body.published,
      },
    });

    return NextResponse.json(destination);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to update destination",
      },
      {
        status: 500,
      }
    );
  }
}
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.destination.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to delete destination",
      },
      {
        status: 500,
      }
    );
  }
}