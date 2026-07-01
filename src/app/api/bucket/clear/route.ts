import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function POST() {
  try {
    const session = await getSession();

    if (!session || session.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const bucket = await prisma.bucket.findFirst({
      where: {
        customerId: session.sub,
      },
    });

    if (!bucket) {
      return NextResponse.json({
        success: true,
      });
    }

    await prisma.bucketItem.deleteMany({
      where: {
        bucketId: bucket.id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Unable to clear bucket.",
      },
      {
        status: 500,
      }
    );
  }
}