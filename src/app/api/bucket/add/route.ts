import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const {
      resortId,
      vehicleId,
    } = await request.json();

    let bucket = await prisma.bucket.findFirst({
      where: {
        customerId: session.sub,
      },
    });

    if (!bucket) {
      bucket = await prisma.bucket.create({
        data: {
          customerId: session.sub,
        },
      });
    }

    const existing = await prisma.bucketItem.findFirst({
      where: {
        bucketId: bucket.id,
        resortId: resortId ?? null,
        vehicleId: vehicleId ?? null,
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Already in bucket",
      });
    }

    await prisma.bucketItem.create({
      data: {
        bucketId: bucket.id,
        resortId,
        vehicleId,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}