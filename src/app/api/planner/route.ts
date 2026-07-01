import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
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
      include: {
        items: {
          include: {
            resort: {
              include: {
                destination: true,
              },
            },
            vehicle: {
              include: {
                destination: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(bucket);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Unable to load planner.",
      },
      {
        status: 500,
      }
    );
  }
}