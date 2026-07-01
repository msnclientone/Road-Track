import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        {
          error: "Forbidden",
        },
        {
          status: 403,
        }
      );
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          error: "Vehicle ID missing.",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.vehicle.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Unable to delete vehicle.",
      },
      {
        status: 500,
      }
    );
  }
}