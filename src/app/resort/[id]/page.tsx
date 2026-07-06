import { notFound } from "next/navigation";
import { MapPinned, IndianRupee } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { prisma } from "@/lib/prisma";
import { buildWhatsAppUrl, formatCurrency } from "@/lib/utils";
import { getSession } from "@/lib/auth/session";
import AddToBucketButton from "@/components/AddToBucketButton";
import SafeResortImage from "@/components/SafeResortImage";

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
        take: 1,
      },
    },
  });

  if (!resort || resort.status !== "APPROVED") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-ivory text-ink">
      <SiteHeader />

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
            <p className="mt-2 flex items-center gap-2 text-base font-bold text-stone sm:mt-3 sm:text-lg">
              <MapPinned className="h-4 w-4 text-coral sm:h-5 sm:w-5" />
              {resort.address}
            </p>
            {resort.googleMapsLink && (
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
            <div className="mt-6 overflow-hidden rounded-lg sm:mt-8">
              <div className="relative aspect-video">
                <SafeResortImage
                  media={resort.media}
                  name={resort.name}
                  priority
                />
              </div>
            </div>

            {/* Description */}
            <div className="mt-6 sm:mt-8">
              <h2 className="text-xl font-black sm:text-2xl">About this resort</h2>
              <p className="mt-3 text-base leading-7 text-stone sm:mt-4 sm:text-lg sm:leading-8">
                {resort.description}
              </p>
            </div>

            {/* Amenities */}
            {Array.isArray(resort.amenities) &&
  resort.amenities.length > 0 && (
              <div className="mt-6 sm:mt-8">
                <h2 className="text-xl font-black sm:text-2xl">Amenities</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {(resort.amenities as string[]).map((amenity: string) => (
                    <div
                      key={amenity}
                      className="rounded-lg border border-ink/10 bg-white p-4 text-center font-bold"
                    >
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing */}
            <div className="mt-6 rounded-lg border border-coral/20 bg-coral/5 p-5 sm:mt-8 sm:p-6">
              <h2 className="text-xl font-black sm:text-2xl">Pricing</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <p className="text-sm text-stone">Starting from</p>
                  <p className="mt-2 text-2xl font-black text-coral sm:text-3xl">
                    {formatCurrency(resort.priceMin)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-stone">Up to</p>
                  <p className="mt-2 text-2xl font-black text-coral sm:text-3xl">
                    {formatCurrency(resort.priceMax)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="h-fit rounded-lg border border-ink/10 bg-white p-5 shadow-sm sm:p-6 sm:sticky sm:top-28">
            <h3 className="text-lg font-black sm:text-xl">Contact Owner</h3>

            <div className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
              {resort.googleMapsLink && (
                <div>
                  <p className="text-sm font-bold text-stone">Location</p>
                  <a
                    href={resort.googleMapsLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 flex items-center gap-2 font-semibold text-coral hover:underline"
                  >
                    <MapPinned className="h-4 w-4" />
                    View on Google Maps
                  </a>
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-stone">Owner Name</p>
                <p className="mt-1 text-base font-black sm:text-lg">
  {resort.owner?.name ?? "Not Available"}
</p>
              </div>

              <div className="pt-3 sm:pt-4">
                <p className="text-sm text-stone">Destination</p>
                <p className="mt-1 font-bold">{resort.destination.name}</p>
              </div>

              <div className="pt-3 sm:pt-4">
                <p className="text-sm text-stone">Price Range</p>
                <p className="mt-1 flex items-center gap-2 font-black text-coral">
                  <IndianRupee className="h-4 w-4" />
                  {formatCurrency(resort.priceMin)} - {formatCurrency(resort.priceMax)}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3 sm:mt-6">
  {session?.role === "CUSTOMER" && (
  <AddToBucketButton resortId={resort.id} />
)}
  <a
    href={buildWhatsAppUrl(
      `Hello Road Track,\nI'm interested in ${resort.name} in ${resort.destination.name}. Can you provide more details?`
    )}
    target="_blank"
    rel="noreferrer"
    className="block w-full rounded-lg bg-coral px-4 py-3 text-center font-black text-ink transition hover:bg-coral/90"
  >
    Enquire on WhatsApp
  </a>
</div>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
