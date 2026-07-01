import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "VEHICLE_OWNER") {
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

    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id,
        ownerId: session.sub,
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        {
          error: "Vehicle not found.",
        },
        {
          status: 404,
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
      message: "Vehicle deleted successfully.",
    });
  } catch (err) {
    console.error(err);

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