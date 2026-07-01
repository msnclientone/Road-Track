import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.nearbyPlace.findMany({
    include: {
      destination: true,
      nearbyDestination: true,
    },
    orderBy: {
      destination: {
        name: "asc",
      },
    },
  });

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();

  const nearby = await prisma.nearbyPlace.create({
    data: {
      destinationId: body.destinationId,
      nearbyDestinationId: body.nearbyDestinationId,
      distanceKm: Number(body.distanceKm),
    },
  });

  return NextResponse.json(nearby);
}