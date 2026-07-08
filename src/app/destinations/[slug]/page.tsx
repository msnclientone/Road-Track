import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  CalendarDays,
  IndianRupee,
  MapPinned,
  MessageCircle,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { buildWhatsAppUrl, formatCurrency } from "@/lib/utils";
import { getSessionUser } from "@/lib/auth/get-session-user";
import { getSession } from "@/lib/auth/session";
import ResortCard from "@/components/ResortCard";
import VehicleCard from "@/components/VehicleCard";
import ExpandableDescription from "@/components/ExpandableDescription";
import MobileExpandableSection from "@/components/MobileExpandableSection";

export async function generateStaticParams() {
  const destinations = await prisma.destination.findMany({
    select: {
      slug: true,
    },
  });

  return destinations.map((destination) => ({
    slug: destination.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const destination = await prisma.destination.findUnique({
    where: {
      slug,
    },
  });

  if (!destination) return {};

  return {
    title: `${destination.name} | Road Track`,
    description: destination.description,
  };
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const headerUser = await getSessionUser();
  const session = await getSession();

  const destination = await prisma.destination.findUnique({
    where: {
      slug,
    },
    include: {
      nearbyPlaces: {
        include: {
          nearbyDestination: true,
        },
        orderBy: {
          distanceKm: "asc",
        },
      },
    },
  });

  if (!destination) {
    notFound();
  }

  const [resorts, vehicles] = await Promise.all([
    prisma.resort.findMany({
      where: { destinationId: destination.id, status: "APPROVED" },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        googleMapsLink: true,
        priceMin: true,
        amenities: true,
        ownerId: true,
        media: {
          select: { url: true, type: true, order: true },
          orderBy: { order: "asc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.vehicle.findMany({
      where: { destinationId: destination.id, status: "APPROVED" },
      select: {
        id: true,
        vehicleType: true,
        registrationNo: true,
        seatingCapacity: true,
        pricePerDay: true,
        pricePerKm: true,
        driverName: true,
        media: {
          select: { url: true, order: true },
          orderBy: { order: "asc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <main className="min-h-screen bg-ivory text-ink">
      <SiteHeader user={headerUser} />

      {/* HERO */}

      <section className="relative isolate min-h-[70vh] max-md:min-h-[35vh] overflow-hidden pt-24">
        <Image
          src={
            destination.heroImageUrl ||
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600"
          }
          alt={destination.name}
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/60" />

        <div className="relative mx-auto flex min-h-[70vh] max-md:min-h-[35vh] max-w-7xl flex-col justify-end px-5 pb-12 max-md:pb-6 sm:px-6 sm:pb-16">
          <Link
            href="/#destinations"
            className="mb-6 max-md:mb-3 inline-flex w-fit items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 font-bold text-white backdrop-blur transition hover:bg-white/20 sm:mb-8 sm:px-5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Destinations
          </Link>

          <div className="max-w-4xl">
            <span className="rounded-full bg-coral px-3 py-1 text-xs font-bold text-ink sm:px-4 sm:text-sm">
              Explore Destination
            </span>

            <h1 className="mt-4 max-md:mt-2 text-4xl max-md:text-2xl font-black text-white sm:text-5xl md:text-7xl">
              {destination.name}
            </h1>

            <p className="mt-4 max-md:mt-2 text-base leading-7 text-white/90 max-md:text-sm sm:mt-6 sm:text-lg sm:leading-8 max-md:line-clamp-2">
              {destination.description}
            </p>
          </div>
        </div>
      </section>

      {/* QUICK INFO */}

      <section className="mx-auto max-w-7xl px-5 py-10 max-md:py-6 sm:px-6 sm:py-14">
        <div className="grid gap-4 max-md:gap-3 sm:gap-6 max-md:grid-cols-2 sm:grid-cols-2">
          <Fact
            icon={<CalendarDays className="h-5 w-5 max-md:h-4 max-md:w-4" />}
            label="Best Time To Visit"
            value={destination.bestTimeToVisit ?? "Any Season"}
          />

          <Fact
            icon={<IndianRupee className="h-5 w-5 max-md:h-4 max-md:w-4" />}
            label="Estimated Budget"
            value={
              destination.estTripCostMin
                ? `${formatCurrency(
                    destination.estTripCostMin
                  )} - ${formatCurrency(
                    destination.estTripCostMax ??
                      destination.estTripCostMin
                  )}`
                : "Contact Us"
            }
          />

          {destination.googleMapsLink && (
            <a
              href={destination.googleMapsLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-3xl border border-coral/40 bg-white p-8 max-md:p-4 shadow-sm transition hover:bg-coral hover:text-ink sm:justify-start max-md:col-span-2"
            >
              <div className="flex h-12 w-12 max-md:h-8 max-md:w-8 items-center justify-center rounded-2xl bg-coral/10 text-coral">
                <MapPinned className="h-5 w-5 max-md:h-4 max-md:w-4" />
              </div>
              <div>
                <p className="text-sm max-md:text-[10px] font-black uppercase tracking-widest text-stone">
                  Location
                </p>
                <p className="mt-1 text-lg max-md:text-sm font-black">
                  View on Google Maps →
                </p>
              </div>
            </a>
          )}
        </div>
      </section>

      {/* ABOUT */}

      <section className="mx-auto max-w-7xl px-5 pb-12 max-md:pb-8 sm:px-6 sm:pb-16">
        <div className="rounded-3xl border bg-white p-5 max-md:p-4 shadow-sm sm:p-8">
          <h2 className="text-2xl max-md:text-xl font-black sm:text-3xl">
            About {destination.name}
          </h2>

          <ExpandableDescription text={destination.description} />
        </div>
      </section>

            {/* NEARBY DESTINATIONS */}

      <section className="mx-auto max-w-7xl px-5 pb-12 max-md:pb-8 sm:px-6 sm:pb-16">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black sm:text-3xl">
              Nearby Destinations
            </h2>

            <p className="mt-2 text-sm text-stone sm:text-base">
              Discover more places around {destination.name}.
            </p>
          </div>
        </div>

        {destination.nearbyPlaces.length === 0 ? (
          <div className="mt-8 rounded-3xl border bg-white p-10 max-md:p-6 text-center shadow-sm">
            <h3 className="text-xl font-bold">
              No Nearby Destinations
            </h3>

            <p className="mt-3 text-stone">
              Nearby destinations will appear here once they are added by the
              administrator.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8 max-md:mt-6 hidden md:grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {destination.nearbyPlaces.map((place) => (
                <NearbyCard key={place.id} place={place} />
              ))}
            </div>
            <div className="md:hidden mt-6">
              <MobileExpandableSection initialCount={3} buttonLabel="View More Nearby Places">
                {destination.nearbyPlaces.map((place) => (
                  <NearbyCard key={place.id} place={place} />
                ))}
              </MobileExpandableSection>
            </div>
          </>
        )}
      </section>

      {/* AVAILABLE RESORTS */}

      <section className="bg-ink py-20 max-md:py-8 text-ivory">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black sm:text-3xl">
                Available Resorts
              </h2>

              <p className="mt-2 text-sm text-white/70 sm:text-base">
                Stay options available in {destination.name}.
              </p>
            </div>
          </div>

          {resorts.length === 0 ? (
            <div className="mt-8 rounded-lg border border-white/10 bg-white/[0.06] p-10 max-md:p-6 text-center">
              <p className="text-lg font-bold text-ivory">
                No resorts available for this destination.
              </p>

              <p className="mt-2 text-sm text-white/70">
                Check back soon for new listings!
              </p>
            </div>
          ) : (
            <>
              <div className="mt-8 max-md:mt-6 hidden md:grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {resorts.map((resort, index) => (
                  <ResortCard
                    key={resort.id}
                    resort={{
                      id: resort.id,
                      name: resort.name,
                      address: resort.address,
                      description: resort.description ?? "",
                      priceMin: resort.priceMin,
                      amenities: (resort.amenities as string[]) || [],
                      googleMapsLink: resort.googleMapsLink,
                      media: resort.media,
                    }}
                    index={index}
                    showLocation={
                      headerUser?.role === "SUPER_ADMIN" ||
                      headerUser?.role === "VEHICLE_OWNER" ||
                      (headerUser?.role === "RESORT_OWNER" && session?.sub != null && resort.ownerId === session.sub)
                    }
                  />
                ))}
              </div>
              <div className="md:hidden mt-6">
                <MobileExpandableSection initialCount={2} buttonLabel="View More Resorts">
                  {resorts.map((resort, index) => (
                    <div key={resort.id} className="mb-4">
                      <ResortCard
                        resort={{
                          id: resort.id,
                          name: resort.name,
                          address: resort.address,
                          description: resort.description ?? "",
                          priceMin: resort.priceMin,
                          amenities: (resort.amenities as string[]) || [],
                          googleMapsLink: resort.googleMapsLink,
                          media: resort.media,
                        }}
                        index={index}
                        showLocation={
                          headerUser?.role === "SUPER_ADMIN" ||
                          headerUser?.role === "VEHICLE_OWNER" ||
                          (headerUser?.role === "RESORT_OWNER" && session?.sub != null && resort.ownerId === session.sub)
                        }
                      />
                    </div>
                  ))}
                </MobileExpandableSection>
              </div>
            </>
          )}
        </div>
      </section>

      {/* AVAILABLE VEHICLES */}

      <section className="mx-auto max-w-7xl px-5 pb-12 max-md:pb-8 sm:px-6 sm:pb-16">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black sm:text-3xl">
              Available Vehicles
            </h2>

            <p className="mt-2 text-sm text-stone sm:text-base">
              Transport options available in {destination.name}.
            </p>
          </div>
        </div>

        {vehicles.length === 0 ? (
          <div className="mt-8 rounded-lg border border-ink/10 bg-white p-10 max-md:p-6 text-center">
            <p className="text-lg font-bold text-stone">
              No vehicles available for this destination.
            </p>

            <p className="mt-2 text-sm text-stone">
              Check back soon for new listings!
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8 max-md:mt-6 hidden md:grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={{
                    id: vehicle.id,
                    vehicleType: vehicle.vehicleType,
                    registrationNo: vehicle.registrationNo,
                    seatingCapacity: vehicle.seatingCapacity,
                    pricePerDay: vehicle.pricePerDay,
                    pricePerKm: vehicle.pricePerKm,
                    driverName: vehicle.driverName,
                    destinationName: destination.name,
                    media: vehicle.media,
                  }}
                />
              ))}
            </div>
            <div className="md:hidden mt-6">
              <MobileExpandableSection initialCount={2} buttonLabel="View More Vehicles">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="mb-4">
                    <VehicleCard
                      vehicle={{
                        id: vehicle.id,
                        vehicleType: vehicle.vehicleType,
                        registrationNo: vehicle.registrationNo,
                        seatingCapacity: vehicle.seatingCapacity,
                        pricePerDay: vehicle.pricePerDay,
                        pricePerKm: vehicle.pricePerKm,
                        driverName: vehicle.driverName,
                        destinationName: destination.name,
                        media: vehicle.media,
                      }}
                    />
                  </div>
                ))}
              </MobileExpandableSection>
            </div>
          </>
        )}
      </section>

      {/* PLAN YOUR TRIP */}

      <section className="mx-auto max-w-7xl px-5 pb-16 max-md:pb-10 sm:px-6 sm:pb-24">
        <div className="overflow-hidden rounded-3xl bg-ink p-6 max-md:p-5 text-white sm:p-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl max-md:text-2xl font-black sm:text-4xl">
              Plan Your Trip
            </h2>

            <p className="mt-4 text-base leading-7 text-white/80 sm:mt-5 sm:text-lg sm:leading-8">
              Ready to explore {destination.name}? Our team will help you plan
              your journey with verified travel partners, personalized guidance,
              and local assistance.
            </p>

            <ul className="mt-6 space-y-2 text-sm text-white/90 sm:mt-8 sm:space-y-3 sm:text-base">
              <li>✓ Verified Travel Partners</li>
              <li>✓ Personalized Trip Planning</li>
              <li>✓ Local Destination Guidance</li>
            </ul>

            <a
              href={buildWhatsAppUrl(
                `Hello Road Track,
I want to plan my trip to ${destination.name}.`
              )}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-coral px-8 font-black text-ink transition hover:scale-105 sm:mt-10 sm:w-auto"
            >
              <MessageCircle className="h-5 w-5" />
              Enquire on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-3xl border bg-white p-8 max-md:p-4 shadow-sm">
      <div className="flex h-12 w-12 max-md:h-8 max-md:w-8 items-center justify-center rounded-2xl bg-coral/10 text-coral">
        {icon}
      </div>

      <p className="mt-6 max-md:mt-3 text-sm max-md:text-[10px] font-black uppercase tracking-widest text-stone">
        {label}
      </p>

      <p className="mt-2 text-2xl max-md:text-base font-black">
        {value}
      </p>
    </article>
  );
}

function NearbyCard({
  place,
}: {
  place: {
    id: string;
    distanceKm: number;
    nearbyDestination: {
      name: string;
      slug: string;
      description: string | null;
      heroImageUrl: string | null;
    };
  };
}) {
  return (
    <Link
      href={`/destinations/${place.nearbyDestination.slug}`}
      className="group mb-4 block overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-56 max-md:h-40 overflow-hidden">
        <Image
          src={
            place.nearbyDestination.heroImageUrl ||
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200"
          }
          alt={place.nearbyDestination.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <span className="absolute bottom-4 left-4 rounded-full bg-coral px-3 py-1 text-sm font-bold text-ink">
          {place.distanceKm} km away
        </span>
      </div>

      <div className="p-6 max-md:p-4">
        <h3 className="text-2xl max-md:text-xl font-black transition group-hover:text-coral">
          {place.nearbyDestination.name}
        </h3>

        <p className="mt-3 line-clamp-3 leading-7 text-stone">
          {place.nearbyDestination.description}
        </p>

        <div className="mt-6 flex items-center justify-between">
          <span className="font-bold text-coral">
            Explore Destination
          </span>

          <span className="rounded-full bg-coral/10 px-4 py-2 font-bold text-coral transition group-hover:bg-coral group-hover:text-white">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
