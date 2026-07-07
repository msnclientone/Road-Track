import { notFound } from "next/navigation";
import { MapPinned } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { getSession } from "@/lib/auth/session";
import { getSessionUser } from "@/lib/auth/get-session-user";
import AddToBucketButton from "@/components/AddToBucketButton";
import ResortImageGallery from "@/components/ResortImageGallery";
import EnquiryButton from "@/components/EnquiryButton";

export async function generateStaticParams() {
  const resorts = await prisma.resort.findMany({
    where: { status: "APPROVED" },
    select: { id: true },
  });

  return resorts.map((resort) => ({
    id: resort.id,
  }));
}

export default async function ResortDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const headerUser = await getSessionUser();

  let resortInBucket = false;
  if (session?.role === "CUSTOMER") {
    const bucket = await prisma.bucket.findFirst({
      where: { customerId: session.sub },
      select: {
        items: {
          where: { resortId: id },
          select: { id: true },
          take: 1,
        },
      },
    });
    resortInBucket = (bucket?.items?.length ?? 0) > 0;
  }

  const resort = await prisma.resort.findUnique({
    where: { id },
    include: {
      owner: {
        select: { name: true, email: true, phone: true },
      },
      destination: {
        select: { name: true, slug: true },
      },
      media: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!resort || resort.status !== "APPROVED") {
    notFound();
  }

  const canSeeLocation =
    session?.role === "SUPER_ADMIN" ||
    session?.role === "VEHICLE_OWNER" ||
    (session?.role === "RESORT_OWNER" && resort.ownerId === session.sub);

  return (
    <main className="min-h-screen bg-ivory text-ink">
      <SiteHeader user={headerUser} />

      <section className="mx-auto max-w-none px-5 pb-20 pt-24 sm:px-8 lg:px-10 2xl:px-12 sm:pt-28">
        <div className="grid gap-8 lg:gap-10 lg:grid-cols-[1fr_0.6fr]">
          {/* Main Content */}
          <div>
            {/* Breadcrumb */}
            <nav className="mb-4 text-sm font-bold text-stone sm:mb-6">
              <a href="/" className="hover:text-coral">
                Home
              </a>
              {" / "}
              <a href={`/destinations/${resort.destination.slug}`} className="hover:text-coral">
                {resort.destination.name}
              </a>
              {" / "}
              <span>{resort.name}</span>
            </nav>

            {/* Title and Location */}
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              {resort.name}
            </h1>
            {canSeeLocation && (
              <p className="mt-2 flex items-center gap-2 text-base font-bold text-stone sm:mt-3 sm:text-lg">
                <MapPinned className="h-4 w-4 text-coral sm:h-5 sm:w-5" />
                {resort.address}
              </p>
            )}
            {canSeeLocation && resort.googleMapsLink && (
              <a
                href={resort.googleMapsLink}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-coral hover:underline"
              >
                <MapPinned className="h-3.5 w-3.5" />
                View on Google Maps
              </a>
            )}

            {/* Image Gallery */}
            <div className="mt-6 sm:mt-8">
              <ResortImageGallery
                media={resort.media}
                name={resort.name}
              />
            </div>

            {/* Description */}
            <div className="mt-6 sm:mt-8">
              <h2 className="text-xl font-black sm:text-2xl">About this resort</h2>
              <p className="mt-3 text-base leading-7 text-stone sm:mt-4 sm:text-lg sm:leading-8">
                {resort.description}
              </p>
            </div>

          </div>

          {/* Sidebar */}
          <aside className="h-fit rounded-lg border border-ink/10 bg-white p-5 shadow-sm sm:p-6 sm:sticky sm:top-28">
            <h3 className="text-lg font-black sm:text-xl">Resort Details</h3>

            <div className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
              <div>
                <p className="text-sm font-bold text-stone">Owner Name</p>
                <p className="mt-1 text-base font-black sm:text-lg">
                  {resort.owner?.name ?? "Not Available"}
                </p>
              </div>

              {canSeeLocation && (
                <div className="pt-3 sm:pt-4">
                  <p className="text-sm text-stone">Address</p>
                  <p className="mt-1 font-bold">{resort.address}</p>
                </div>
              )}

              <div className="pt-3 sm:pt-4">
                <p className="text-sm text-stone">Destination</p>
                <p className="mt-1 font-bold">{resort.destination.name}</p>
              </div>

              <div className="pt-3 sm:pt-4">
                <p className="text-sm text-stone">Available AC Rooms</p>
                <p className="mt-1 font-bold">{resort.availableAcRooms}</p>
              </div>

              <div className="pt-3 sm:pt-4">
                <p className="text-sm text-stone">Available Non-AC Rooms</p>
                <p className="mt-1 font-bold">{resort.availableNonAcRooms}</p>
              </div>

              <div className="pt-3 sm:pt-4">
                <p className="text-sm text-stone">Room Pricing</p>
                <p className="mt-1 font-black text-coral">
                  AC Room: {formatCurrency(resort.priceMax)}
                </p>
                <p className="font-black text-coral">
                  Non-AC Room: {formatCurrency(resort.priceMin)}
                </p>
              </div>

              {Array.isArray(resort.amenities) && resort.amenities.length > 0 && (
                <div className="pt-3 sm:pt-4">
                  <p className="text-sm text-stone">Amenities</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(resort.amenities as string[]).map((amenity: string) => (
                      <span
                        key={amenity}
                        className="rounded-md border border-ink/10 bg-ivory px-3 py-1 text-sm font-semibold"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-3 sm:mt-6">
              {canSeeLocation && resort.googleMapsLink && (
                <a
                  href={resort.googleMapsLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg border border-ink/10 px-4 py-3 font-semibold text-ink transition hover:bg-ivory"
                >
                  <MapPinned className="h-4 w-4" />
                  View on Google Maps
                </a>
              )}

              {session?.role === "CUSTOMER" && (
                <AddToBucketButton resortId={resort.id} alreadyInBucket={resortInBucket} />
              )}

              <EnquiryButton
                type="resort"
                resortId={resort.id}
                resortName={resort.name}
                destinationName={resort.destination.name}
                acPrice={resort.priceMax}
                nonAcPrice={resort.priceMin}
              />
            </div>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
