import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "CUSTOMER") {
      return NextResponse.json({
        exists: false,
      });
    }

    const { resortId, vehicleId } = await request.json();

    const bucket = await prisma.bucket.findFirst({
      where: {
        customerId: session.sub,
      },
    });

    if (!bucket) {
      return NextResponse.json({
        exists: false,
      });
    }

    const item = await prisma.bucketItem.findFirst({
      where: {
        bucketId: bucket.id,
        resortId: resortId ?? null,
        vehicleId: vehicleId ?? null,
      },
    });

    return NextResponse.json({
      exists: !!item,
    });
  } catch {
    return NextResponse.json({
      exists: false,
    });
  }
}