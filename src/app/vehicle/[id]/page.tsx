import { notFound } from "next/navigation";
import { vehicleImages } from "@/lib/vehicleImages";
import Image from "next/image";
import { Users } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { prisma } from "@/lib/prisma";
import { buildWhatsAppUrl, formatCurrency, maskRegistrationNo } from "@/lib/utils";
import { getSession } from "@/lib/auth/session";
import { getSessionUser } from "@/lib/auth/get-session-user";
import AddToBucketButton from "@/components/AddToBucketButton";

export async function generateStaticParams() {
  const vehicles = await prisma.vehicle.findMany({
    where: { status: "APPROVED" },
    select: { id: true },
  });

  return vehicles.map((vehicle) => ({
    id: vehicle.id,
  }));
}

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const headerUser = await getSessionUser();

  let customer: { name: string | null; phone: string | null } | null = null;
  let vehicleInBucket = false;

  if (session?.role === "CUSTOMER") {
    const [user, bucket] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.sub },
        select: { name: true, phone: true },
      }),
      prisma.bucket.findFirst({
        where: { customerId: session.sub },
        select: {
          items: {
            where: { vehicleId: id },
            select: { id: true },
            take: 1,
          },
        },
      }),
    ]);
    customer = user;
    vehicleInBucket = (bucket?.items?.length ?? 0) > 0;
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      owner: {
        select: { name: true, email: true, phone: true },
      },
      destination: {
        select: { name: true, slug: true },
      },
    },
  });

  if (!vehicle || vehicle.status !== "APPROVED") {
    notFound();
  }
  const maskedRegNo = maskRegistrationNo(vehicle.registrationNo ?? "");
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
              <span>{vehicle.vehicleType}</span>
              {" / "}
              <span>{maskedRegNo}</span>
            </nav>

            {/* Title */}
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              {vehicle.vehicleType}
            </h1>
            <p className="mt-2 font-bold text-base text-stone sm:mt-3 sm:text-lg">
              {maskedRegNo}
            </p>

            {/* Image Gallery */}
            <div className="mt-6 rounded-lg overflow-hidden sm:mt-8">
              <div className="relative aspect-video">
                <Image
                  src={
  vehicleImages[vehicle.vehicleType] ??
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200"
}
                  alt={vehicle.vehicleType}
                  fill
                  priority
                  loading="eager"
                  className="object-cover"
                  sizes="(min-width: 1024px) 66vw, 100vw"
                />
              </div>
            </div>

            {/* Vehicle Specs */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-mint/20 bg-mint/5 p-4">
                <p className="text-sm font-bold text-stone">Type</p>
                <p className="mt-2 text-2xl font-black">{vehicle.vehicleType}</p>
              </div>

              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-700" />
                  <p className="text-sm font-bold text-stone">Capacity</p>
                </div>
                <p className="mt-2 text-2xl font-black">{vehicle.seatingCapacity}</p>
              </div>

              <div className="rounded-lg border border-sky/20 bg-sky/5 p-4">
                <p className="text-sm font-bold text-stone">Seats</p>
                <p className="mt-2 text-2xl font-black">{vehicle.seatingCapacity}</p>
              </div>

              <div className="rounded-lg border border-coral/20 bg-coral/5 p-4">
                <p className="text-sm font-bold text-stone">Registration</p>
                <p className="mt-2 text-xl font-black text-coral">
                  {maskedRegNo}
                </p>
              </div>

              {vehicle.destinationId && (
                <div className="rounded-lg border border-ink/10 bg-white p-4">
                  <p className="text-sm font-bold text-stone">Available For</p>
                  <p className="mt-2 text-lg font-black">
                    {vehicle.destination?.name || "Various"}
                  </p>
                </div>
              )}

            </div>

          </div>

          {/* Sidebar */}
          <aside className="h-fit rounded-lg border border-ink/10 bg-white p-5 shadow-sm sm:p-6 sm:sticky sm:top-28">
            <h3 className="text-lg font-black sm:text-xl">Vehicle Details</h3>

            <div className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
              <div>
                <p className="text-sm font-bold text-stone">Owner Name</p>
                <p className="mt-1 text-base font-black sm:text-lg">{vehicle.owner?.name ?? "Not Available"}</p>
              </div>

              <div className="pt-3 sm:pt-4">
                <p className="text-sm text-stone">Vehicle Type</p>
                <p className="mt-1 font-bold">{vehicle.vehicleType}</p>
              </div>

              <div className="pt-3 sm:pt-4">
                <p className="text-sm text-stone">Capacity</p>
                <p className="mt-1 flex items-center gap-2 font-bold">
                  <Users className="h-4 w-4" />
                  {vehicle.seatingCapacity} Seats
                </p>
              </div>

              <div className="pt-3 sm:pt-4">
                <p className="text-sm text-stone">Pricing</p>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 items-start">
                  <div className="space-y-1">
                    <p className="font-black text-coral">
                      {vehicle.pricePerKm != null
                        ? `${formatCurrency(vehicle.pricePerKm)} / KM`
                        : "Not Set"}
                    </p>
                    <p className="font-black text-coral">
                      {vehicle.pricePerDay != null
                        ? `${formatCurrency(vehicle.pricePerDay)} / Day`
                        : "Not Set"}
                    </p>
                  </div>
                  <div className="space-y-1 text-right">
                    {vehicle.minimumPrice != null && (
                      <p className="font-black text-coral">
                        {formatCurrency(vehicle.minimumPrice)}{" "}
                        <span className="text-xs font-semibold text-stone">Minimum Charge</span>
                      </p>
                    )}
                    {vehicle.minimumKm != null && (
                      <p className="font-black text-coral">
                        {vehicle.minimumKm} KM{" "}
                        <span className="text-xs font-semibold text-stone">Minimum Distance</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3 sm:mt-6">
  {session?.role === "CUSTOMER" && (
    <>
      <AddToBucketButton vehicleId={vehicle.id} alreadyInBucket={vehicleInBucket} />

      <a
        href={buildWhatsAppUrl(
`Hello Road Track,

🚗 FULL DAY RENTAL REQUEST

Customer Name:
${customer?.name ?? "Not Available"}

Customer Email:
${session.email}

Vehicle:
${vehicle.vehicleType}

Registration Number:
${maskedRegNo}

Destination:
${vehicle.destination?.name ?? "Not Specified"}

Price Per Day:
${vehicle.pricePerDay != null ? formatCurrency(vehicle.pricePerDay) : "Not Set"}

Price Per KM:
${vehicle.pricePerKm != null ? formatCurrency(vehicle.pricePerKm) : "Not Set"}

I am interested in renting this vehicle for a full day.

Please contact me with the quotation.

Thank you.`
        )}
        target="_blank"
        rel="noreferrer"
        className="block w-full rounded-lg bg-blue-600 px-4 py-3 text-center font-black text-white transition hover:bg-blue-700"
      >
        🚗 Full Day Rental
      </a>
    </>
  )}

  <a
    href={buildWhatsAppUrl(
      `Hello Road Track,\nI'm interested in booking a ${vehicle.vehicleType} (${maskedRegNo}). Can you provide details?`
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
