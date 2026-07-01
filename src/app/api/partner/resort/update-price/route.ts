import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "RESORT_OWNER") {
      return NextResponse.json(
        {
          error: "Forbidden",
        },
        {
          status: 403,
        }
      );
    }

    const body = await request.json();

    const {
      resortId,
      nonAcPrice,
      acPrice,
    } = body;

    if (!resortId) {
      return NextResponse.json(
        {
          error: "Resort not found.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      nonAcPrice == null ||
      acPrice == null
    ) {
      return NextResponse.json(
        {
          error: "Both prices are required.",
        },
        {
          status: 400,
        }
      );
    }

    const resort = await prisma.resort.findFirst({
      where: {
        id: resortId,
        ownerId: session.sub,
      },
    });

    if (!resort) {
      return NextResponse.json(
        {
          error: "Resort not found.",
        },
        {
          status: 404,
        }
      );
    }

    const updated = await prisma.resort.update({
      where: {
        id: resortId,
      },
      data: {
        priceMin: Number(nonAcPrice),
        priceMax: Number(acPrice),
      },
    });

    return NextResponse.json({
      ok: true,
      resort: updated,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: "Unable to update prices.",
      },
      {
        status: 500,
      }
    );
  }
}