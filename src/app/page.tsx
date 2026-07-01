import VisitorTracker from "@/components/VisitorTracker";
import { prisma } from "@/lib/prisma";
import DestinationSearch from "@/components/DestinationSearch";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BusFront,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Compass,
  MessageCircle,
  ShieldCheck,
  Star,
} from "lucide-react";

import { EnquiryPlanner } from "@/components/EnquiryPlanner";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import ResortsSection from "@/components/ResortsSection";
import VehiclesSection from "@/components/VehiclesSection";
import {
  heroImage,
  reviews,
  tourPackages,
} from "@/lib/data";
import { buildWhatsAppUrl, formatCurrency } from "@/lib/utils";

const platformFeatures = [
  "Server-rendered destination pages",
  "Verified resort and vehicle listings",
  "Zod-validated enquiry capture",
  "WhatsApp opens only after lead save",
  "Admin-controlled lead assignment",
  "PostgreSQL and Prisma data foundation",
];

const roadmap = [
  {
    phase: "Phase 1",
    title: "Launch MVP",
    text: "Destinations, listings, WhatsApp enquiry, lead dashboard, OTP-ready customer login.",
  },
  {
    phase: "Phase 2",
    title: "Partner Operations",
    text: "Resort and vehicle owner panels, availability updates, lead history, approval flow.",
  },
  {
    phase: "Phase 3",
    title: "Revenue Systems",
    text: "Auto pricing, reviews, commission tracking, notifications, and Twilio automation.",
  },
  {
    phase: "Phase 4",
    title: "Tourism Platform",
    text: "Travel blog, weather, nearby attractions, live availability, and emergency network.",
  },
];

import { getSession } from "@/lib/auth/session";

export default async function Home() {
  const session = await getSession();
  const destinations = await prisma.destination.findMany({
  where: {
    published: true,
  },
  orderBy: {
    name: "asc",
  },
});
  return (
  <main className="min-h-screen bg-ivory text-ink">
    <VisitorTracker />
    <SiteHeader />

      <section className="relative isolate min-h-[92svh] overflow-hidden pt-24 text-ivory">
        <Image
          src={heroImage}
          alt="Kapu beach lighthouse on the Udupi coast"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,26,22,0.72),rgba(16,26,22,0.38)_42%,rgba(16,26,22,0.9))]" />

        <div className="relative mx-auto flex min-h-[calc(92svh-6rem)] max-w-none flex-col justify-between px-5 pb-10 sm:px-8 lg:px-10 2xl:px-12">
          <div className="pt-8">
            <p className="max-w-2xl text-lg font-bold text-mint">
              Trusted Udupi tourism planning for resorts, vehicles, packages,
              and local support.
            </p>
            <div className="mt-8 max-w-5xl">
  <h1 className="text-5xl font-black text-ivory sm:text-6xl">
    Where do you want to travel?
  </h1>

  <p className="mt-3 text-lg text-white/80">
    Search your favourite destination and start planning instantly.
  </p>

  <div className="mt-8">
  <DestinationSearch
    destinations={destinations.map((destination) => ({
      id: destination.id,
      name: destination.name,
      slug: destination.slug,
    }))}
  />
</div>
</div>
            <div className="mt-6 grid max-w-4xl gap-4 text-white/88 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-coral" />
                <span className="font-bold">Verified local partners</span>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="h-6 w-6 text-coral" />
                <span className="font-bold">WhatsApp enquiry flow</span>
              </div>
              <div className="flex items-center gap-3">
                <CalendarCheck className="h-6 w-6 text-coral" />
                <span className="font-bold">Live availability mindset</span>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.6fr] lg:items-end">
            <div className="max-w-xl">
              <p className="text-2xl font-black leading-tight">
                Plan beaches, temples, rainforests, vehicles, resorts, and
                support from one local network.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="#planner"
                  className="inline-flex h-12 items-center gap-2 rounded-md bg-coral px-5 font-black text-ink transition hover:bg-coral/90"
                >
                  <Compass className="h-5 w-5" />
                  Plan trip
                </Link>
                <a
                  href={buildWhatsAppUrl(
                    "Hello Road Track,\nI need a resort and vehicle for Udupi.",
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-md border border-white/40 px-5 font-black text-white transition hover:bg-white hover:text-ink"
                >
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp now
                </a>
              </div>
            </div>

            <div id="planner" className="flex justify-center lg:justify-end">
  {session?.role === "CUSTOMER" ? (
    <EnquiryPlanner />
  ) : (
    <div className="w-full max-w-[540px] rounded-lg border border-white/15 bg-ink/80 p-8 text-center text-white shadow-2xl backdrop-blur">
      <h3 className="text-2xl font-black">
        Plan Your Trip
      </h3>

      <p className="mt-3 text-white/80">
        Login as a Customer to plan your trip,
        estimate costs and book resorts & vehicles.
      </p>

      <Link
        href="/login"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-coral px-6 font-bold text-ink hover:bg-coral/90"
      >
        Login to Continue
      </Link>
    </div>
  )}
</div>
          </div>
        </div>
      </section>

      <section
        id="destinations"
        className="mx-auto max-w-none px-5 py-20 sm:px-8 lg:px-10 2xl:px-12"
      >
        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-coral">
              Destination pages
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Sell the complete trip, not just one listing.
            </h2>
          </div>
          <p className="text-lg leading-8 text-stone">
            Each destination connects travel timing, nearby resorts, available
            vehicles, attractions, maps, weather notes, and estimated trip cost.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {destinations.map((destination) => (
            <Link
              href={`/destinations/${destination.slug}`}
              key={destination.slug}
              className="group overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={
  destination.heroImageUrl ||
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200"
}
                  alt={destination.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-2xl font-black">{destination.name}</h3>
                  <div className="mt-5 flex items-center justify-between">

<p className="font-bold text-coral">
    Explore Destination
</p>

<span className="text-2xl text-coral transition group-hover:translate-x-2">
    →
</span>

</div>
                </div>
                <p className="mt-2 text-sm font-bold capitalize text-stone">
  📍 {destination.slug?.replace(/-/g, " ") || "Unknown Location"}
</p>
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-stone">
                  {destination.description}
                </p>
                <div className="mt-5 flex items-center justify-between text-sm font-black">
                  <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
    🌤 {destination.bestTimeToVisit || "All Season"}
</span>
                  <span className="text-coral">
                    From{" "}
{destination.estTripCostMin
  ? formatCurrency(destination.estTripCostMin)
  : "Contact Us"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="resorts" className="bg-ink py-20 text-ivory">
        <div className="mx-auto max-w-none px-5 sm:px-8 lg:px-10 2xl:px-12">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-mint">
                Resort inventory
              </p>
              <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                Availability-led stays for families and groups.
              </h2>
            </div>
            <Link
              href="/partner/resort"
              className="inline-flex h-12 items-center gap-2 rounded-md border border-mint/60 px-5 font-black text-mint transition hover:bg-mint hover:text-ink"
            >
              <Building2 className="h-5 w-5" />
              Resort panel
            </Link>
          </div>

          <ResortsSection />
        </div>
      </section>

      <section id="vehicles" className="mx-auto max-w-none px-5 py-20 sm:px-8 lg:px-10 2xl:px-12">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-coral">
              Tourist vehicles
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Driver-backed transport for every group size.
            </h2>
          </div>
          <Link
            href="/partner/vehicle"
            className="inline-flex h-12 items-center gap-2 rounded-md bg-ink px-5 font-black text-white transition hover:bg-stone"
          >
            <BusFront className="h-5 w-5" />
            Vehicle panel
          </Link>
        </div>

        <VehiclesSection />
      </section>

      <section id="packages" className="bg-white py-20">
        <div className="mx-auto max-w-none px-5 sm:px-8 lg:px-10 2xl:px-12">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-coral">
                Dynamic packages
              </p>
              <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                Quote-ready plans your team can customize.
              </h2>
              <p className="mt-5 text-lg leading-8 text-stone">
                Packages combine pickup, resort, vehicle, sightseeing, and drop.
                The planner above captures the trip requirement while Road Track
                keeps pricing, partner assignment, and final confirmation under
                control.
              </p>
            </div>

            <div className="grid gap-4">
              {tourPackages.map((pack) => (
                <article
                  key={pack.id}
                  className="rounded-lg border border-ink/10 bg-ivory p-5"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <p className="text-sm font-black text-coral">
                        {pack.days}
                      </p>
                      <h3 className="mt-1 text-2xl font-black">
                        {pack.title}
                      </h3>
                    </div>
                    <p className="text-xl font-black">
                      From {formatCurrency(pack.priceFrom)}
                    </p>
                  </div>
                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {pack.includes.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-mint" />
                        <span className="font-semibold text-stone">{item}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-none gap-6 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1fr] lg:px-10 2xl:px-12">
        <div className="rounded-lg bg-ink p-8 text-ivory">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-mint">
            Lead marketplace model
          </p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">
            You stay in control of quality and commission.
          </h2>
          <div className="mt-8 grid gap-4">
            {[
              "Customer sends enquiry",
              "Road Track verifies requirement",
              "Lead is assigned to resort or vehicle owner",
              "Partner confirms availability",
              "Commission and service quality are tracked",
            ].map((step, index) => (
              <div key={step} className="flex items-center gap-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-coral font-black text-ink">
                  {index + 1}
                </span>
                <p className="font-bold text-white/85">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-ink/10 bg-white p-8 shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-coral">
            Platform features
          </p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">
            Built for launch, shaped for scale.
          </h2>
          <div className="mt-8 grid gap-3">
            {platformFeatures.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-mint" />
                <span className="font-bold text-stone">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-none px-5 py-20 sm:px-8 lg:px-10 2xl:px-12">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-coral">
              Reviews and roadmap
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Trust now, wider marketplace later.
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {reviews.map((review) => (
              <article
                key={review.name}
                className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm"
              >
                <div className="flex gap-1 text-amber">
                  {Array.from({ length: review.rating }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-6 text-stone">
                  {review.text}
                </p>
                <p className="mt-5 font-black">{review.name}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {roadmap.map((item) => (
            <article
              key={item.phase}
              className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-black text-coral">{item.phase}</p>
              <h3 className="mt-2 text-xl font-black">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-stone">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
