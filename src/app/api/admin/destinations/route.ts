import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const destinations = await prisma.destination.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json(destinations);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const destination = await prisma.destination.create({
     data: {
  name: body.name,
  slug: body.slug,
  description: body.description,

  heroImageUrl: body.heroImageUrl || null,
  googleMapsLink: body.googleMapsLink || null,
  bestTimeToVisit: body.bestTimeToVisit || null,

  estTripCostMin:
    body.estTripCostMin > 0 ? body.estTripCostMin : null,

  estTripCostMax:
    body.estTripCostMax > 0 ? body.estTripCostMax : null,

  published: body.published ?? true,
},
    });

    return NextResponse.json(destination);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create destination" },
      { status: 500 }
    );
  }
}