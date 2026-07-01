import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  CalendarDays,
  IndianRupee,
  MessageCircle,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { buildWhatsAppUrl, formatCurrency } from "@/lib/utils";

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

  return (
    <main className="min-h-screen bg-ivory text-ink">
      <SiteHeader />

      {/* HERO */}

      <section className="relative isolate min-h-[70vh] overflow-hidden pt-24">
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

        <div className="relative mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-end px-6 pb-16">
          <Link
            href="/#destinations"
            className="mb-8 inline-flex w-fit items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2 font-bold text-white backdrop-blur transition hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Destinations
          </Link>

          <div className="max-w-4xl">
            <span className="rounded-full bg-coral px-4 py-1 text-sm font-bold text-ink">
              Explore Destination
            </span>

            <h1 className="mt-5 text-5xl font-black text-white md:text-7xl">
              {destination.name}
            </h1>

            <p className="mt-6 text-lg leading-8 text-white/90">
              {destination.description}
            </p>
          </div>
        </div>
      </section>

      {/* QUICK INFO */}

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-6 md:grid-cols-2">
          <Fact
            icon={<CalendarDays className="h-5 w-5" />}
            label="Best Time To Visit"
            value={destination.bestTimeToVisit ?? "Any Season"}
          />

          <Fact
            icon={<IndianRupee className="h-5 w-5" />}
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
        </div>
      </section>

      {/* ABOUT */}

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="rounded-3xl border bg-white p-8 shadow-sm">
          <h2 className="text-3xl font-black">
            About {destination.name}
          </h2>

          <p className="mt-6 text-lg leading-8 text-stone">
            {destination.description}
          </p>
        </div>
      </section>

            {/* NEARBY DESTINATIONS */}

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black">
              Nearby Destinations
            </h2>

            <p className="mt-2 text-stone">
              Discover more places around {destination.name}.
            </p>
          </div>
        </div>

        {destination.nearbyPlaces.length === 0 ? (
          <div className="mt-8 rounded-3xl border bg-white p-10 text-center shadow-sm">
            <h3 className="text-xl font-bold">
              No Nearby Destinations
            </h3>

            <p className="mt-3 text-stone">
              Nearby destinations will appear here once they are added by the
              administrator.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {destination.nearbyPlaces.map((place) => (
              <Link
                key={place.id}
                href={`/destinations/${place.nearbyDestination.slug}`}
                className="group overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-56 overflow-hidden">
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

                <div className="p-6">
                  <h3 className="text-2xl font-black transition group-hover:text-coral">
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
            ))}
          </div>
        )}
      </section>

      {/* PLAN YOUR TRIP */}

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="overflow-hidden rounded-3xl bg-ink p-10 text-white">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-black">
              Plan Your Trip
            </h2>

            <p className="mt-5 text-lg leading-8 text-white/80">
              Ready to explore {destination.name}? Our team will help you plan
              your journey with verified travel partners, personalized guidance,
              and local assistance.
            </p>

            <ul className="mt-8 space-y-3 text-white/90">
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
              className="mt-10 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-coral px-8 font-black text-ink transition hover:scale-105"
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
    <article className="rounded-3xl border bg-white p-8 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-coral/10 text-coral">
        {icon}
      </div>

      <p className="mt-6 text-sm font-black uppercase tracking-widest text-stone">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black">
        {value}
      </p>
    </article>
  );
}
