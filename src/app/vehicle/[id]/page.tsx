import { notFound } from "next/navigation";
import Image from "next/image";
import { Mail, Phone, MapPin, Users, Zap, IndianRupee } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { prisma } from "@/lib/prisma";
import { buildWhatsAppUrl, formatCurrency } from "@/lib/utils";

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

  return (
    <main className="min-h-screen bg-ivory text-ink">
      <SiteHeader />

      <section className="mx-auto max-w-none px-5 pb-20 pt-28 sm:px-8 lg:px-10 2xl:px-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.6fr]">
          {/* Main Content */}
          <div>
            {/* Breadcrumb */}
            <nav className="mb-6 text-sm font-bold text-stone">
              <a href="/" className="hover:text-coral">
                Home
              </a>
              {" / "}
              <span>{vehicle.vehicleType}</span>
              {" / "}
              <span>{vehicle.registrationNo}</span>
            </nav>

            {/* Title */}
            <h1 className="text-5xl font-black tracking-tight sm:text-6xl">
              {vehicle.vehicleType}
            </h1>
            <p className="mt-3 font-bold text-lg text-stone">
              {vehicle.registrationNo}
            </p>

            {/* Image Gallery */}
            <div className="mt-8 rounded-lg overflow-hidden">
              <div className="relative aspect-video">
                <Image
                  src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=800&fit=crop"
                  alt={vehicle.vehicleType}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Vehicle Specs */}
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
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
                  {vehicle.registrationNo}
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

              <div className="rounded-lg border border-amber/20 bg-amber/5 p-4">
                <p className="text-sm font-bold text-stone">Driver</p>
                <p className="mt-2 text-lg font-black">{vehicle.driverName}</p>
              </div>
            </div>

            {/* Driver Info */}
            <div className="mt-8 rounded-lg border border-ink/10 bg-white p-6">
              <h2 className="text-2xl font-black">Driver Information</h2>
              <div className="mt-4 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-stone">Driver Name</p>
                  <p className="mt-2 text-xl font-black">{vehicle.driverName}</p>
                </div>
                {vehicle.driverPhone && (
                  <div>
                    <p className="text-sm text-stone">Driver Phone</p>
                    <a
                      href={`tel:${vehicle.driverPhone}`}
                      className="mt-2 flex items-center gap-2 text-coral hover:underline font-bold"
                    >
                      <Phone className="h-4 w-4" />
                      {vehicle.driverPhone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="mt-8 rounded-lg border border-coral/20 bg-coral/5 p-6">
              <h2 className="text-2xl font-black">Pricing</h2>
              <div className="mt-4 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-stone">Per Day</p>
                  <p className="mt-2 text-3xl font-black text-coral">
                    {formatCurrency(vehicle.pricePerDay)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-stone">Per KM</p>
                  <p className="mt-2 text-3xl font-black text-coral">
                    {formatCurrency(vehicle.pricePerKm)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="h-fit rounded-lg border border-ink/10 bg-white p-6 shadow-sm sticky top-28">
            <h3 className="text-xl font-black">Contact Owner</h3>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm font-bold text-stone">Owner Name</p>
                <p className="mt-1 text-lg font-black">{vehicle.owner.name}</p>
              </div>

              {vehicle.owner.email && (
                <div>
                  <p className="text-sm font-bold text-stone">Email</p>
                  <a
                    href={`mailto:${vehicle.owner.email}`}
                    className="mt-1 flex items-center gap-2 text-coral hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {vehicle.owner.email}
                  </a>
                </div>
              )}

              {vehicle.owner.phone && (
                <div>
                  <p className="text-sm font-bold text-stone">Phone</p>
                  <a
                    href={`tel:${vehicle.owner.phone}`}
                    className="mt-1 flex items-center gap-2 text-coral hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    {vehicle.owner.phone}
                  </a>
                </div>
              )}

              <div className="pt-4">
                <p className="text-sm text-stone">Vehicle Type</p>
                <p className="mt-1 font-bold">{vehicle.vehicleType}</p>
              </div>

              <div className="pt-4">
                <p className="text-sm text-stone">Capacity</p>
                <p className="mt-1 flex items-center gap-2 font-bold">
                  <Users className="h-4 w-4" />
                  {vehicle.seatingCapacity} Seats
                </p>
              </div>

              <div className="pt-4">
                <p className="text-sm text-stone">Pricing</p>
                <p className="mt-1 flex items-center gap-2 font-black text-coral">
                  <IndianRupee className="h-4 w-4" />
                  {formatCurrency(vehicle.pricePerDay)}/day · {formatCurrency(vehicle.pricePerKm)}/km
                </p>
              </div>
            </div>

            <a
              href={buildWhatsAppUrl(
                `Hello Road Track,\nI'm interested in booking a ${vehicle.vehicleType} (${vehicle.registrationNo}). Can you provide details?`
              )}
              target="_blank"
              rel="noreferrer"
              className="mt-6 block w-full rounded-lg bg-coral px-4 py-3 text-center font-black text-ink transition hover:bg-coral/90"
            >
              Enquire on WhatsApp
            </a>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
