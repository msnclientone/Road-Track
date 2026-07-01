import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "RESORT_OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
  name,
  description,
  address,
  acRooms,
  nonAcRooms,
  amenities,
  destinationId,
  destinationSlug,
} = body as any;

    if (typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "Missing required field: name" }, { status: 400 });
    }
    if (typeof description !== "string" || description.trim() === "") {
      return NextResponse.json({ error: "Missing required field: description" }, { status: 400 });
    }
    if (typeof destinationId !== "string" || destinationId.trim() === "") {
      return NextResponse.json({ error: "Missing required field: destinationId" }, { status: 400 });
    }
    if (acRooms == null || nonAcRooms == null) {
  return NextResponse.json(
    {
      error: "Please enter AC Rooms and Non AC Rooms.",
    },
    {
      status: 400,
    }
  );
}

    const slugBase = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = `${slugBase}-${Math.random().toString(36).slice(2, 8)}`;

    const amenitiesArray = Array.isArray(amenities)
      ? amenities
      : (typeof amenities === "string" ? amenities.split(",").map((s: string) => s.trim()).filter(Boolean) : []);

    // determine destinationId either from provided id or slug (create if necessary)
    let finalDestinationId = destinationId;

    // if an id was provided but doesn't match, try treating it as a slug
    if (finalDestinationId) {
      const byId = await prisma.destination.findUnique({ where: { id: finalDestinationId } });
      if (!byId) {
        const bySlug = await prisma.destination.findUnique({ where: { slug: finalDestinationId } });
        if (bySlug) {
          finalDestinationId = bySlug.id;
        } else {
          // treat provided value as slug and create destination record
          const nameFromSlug = String(finalDestinationId).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
          const created = await prisma.destination.create({
            data: {
              name: nameFromSlug,
              slug: String(finalDestinationId),
              description: `Created via partner: ${nameFromSlug}`,
              published: false,
            },
          });
          finalDestinationId = created.id;
        }
      }
    }

    if (!finalDestinationId && destinationSlug) {
      const existing = await prisma.destination.findUnique({ where: { slug: destinationSlug } });
      if (existing) {
        finalDestinationId = existing.id;
      } else {
       const slugValue = String(destinationSlug);

const nameFromSlug = slugValue
  .replace(/-/g, " ")
  .replace(/\b\w/g, (c) => c.toUpperCase());
        const created = await prisma.destination.create({
          data: {
            name: nameFromSlug,
            slug: destinationSlug,
            description: `Created via partner: ${nameFromSlug}`,
            published: false,
          },
        });
        finalDestinationId = created.id;
      }
    }

    if (!finalDestinationId) {
      return NextResponse.json({ error: "Missing destinationId or destinationSlug" }, { status: 400 });
    }

    const resort = await prisma.resort.create({
  data: {
    ownerId: session.sub,
    destinationId: finalDestinationId,

    name,
    slug,
    description,
    address: address ?? null,

    // Super Admin sets these after approval
    priceMin: 0,
    priceMax: 0,

    // Room availability
    availableAcRooms: Number(acRooms),
    availableNonAcRooms: Number(nonAcRooms),

    amenities: amenitiesArray,

    status: "PENDING",
  },
});

    return NextResponse.json({ ok: true, resort });
  } catch (err) {
    console.error("create resort failed:", err);
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error && err.stack ? err.stack : undefined;
    return NextResponse.json({ error: "Unable to create resort", detail: message, stack }, { status: 500 });
  }
}
