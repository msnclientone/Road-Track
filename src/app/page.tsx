import ViewLocationButton from "@/components/ViewLocationButton";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import dynamicImport from "next/dynamic";
import {
  BusFront,
  Building2,
  CalendarCheck,
  MapPinned,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { heroImage } from "@/lib/data";
import { buildWhatsAppUrl, formatCurrency } from "@/lib/utils";
import { getSessionUser } from "@/lib/auth/get-session-user";
import { getSession } from "@/lib/auth/session";

const ResortsSection = dynamicImport(() => import("@/components/ResortsSection"), {
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-mint border-t-transparent" />
    </div>
  ),
});

const VehiclesSection = dynamicImport(() => import("@/components/VehiclesSection"), {
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-coral border-t-transparent" />
    </div>
  ),
});

export const dynamic = "force-dynamic";

export default async function Home() {
  const headerUser = await getSessionUser();
  const session = await getSession();
  const destinations = await prisma.destination.findMany({
  where: {
    published: true,
  },
  select: {
    id: true,
    name: true,
    slug: true,
    heroImageUrl: true,
    description: true,
    bestTimeToVisit: true,
    estTripCostMin: true,
    googleMapsLink: true,
  },
  orderBy: {
    name: "asc",
  },
});
  return (
  <main className="min-h-screen bg-ivory text-ink">
    <SiteHeader
      destinations={destinations.map((d) => ({
        id: d.id,
        name: d.name,
        slug: d.slug,
      }))}
      user={headerUser}
    />

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
          <div className="pt-6 sm:pt-8">
            <p className="max-w-2xl text-base font-bold text-mint sm:text-lg">
              Trusted Udupi tourism planning for resorts, vehicles, packages,
              and local support.
            </p>
            <div className="mt-6 max-w-5xl sm:mt-8">
  <h1 className="text-5xl font-black text-ivory sm:text-6xl md:text-7xl lg:text-8xl">
    Explore UDUPI
  </h1>

  <p className="mt-2 text-lg text-white/80 sm:mt-3 sm:text-xl md:text-2xl">
    Search your favourite destination and start planning instantly.
  </p>

</div>
            <div className="mt-4 grid max-w-4xl gap-3 text-white/88 sm:mt-6 sm:grid-cols-3 sm:gap-4">
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

          <div className="mt-8 sm:mt-10">
            <div className="max-w-xl">
              <p className="text-xl font-black leading-tight sm:text-2xl">
                Plan beaches, temples, rainforests, vehicles, resorts, and
                support from one local network.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
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
          </div>
        </div>
      </section>

      <section
        id="destinations"
        className="mx-auto max-w-none px-5 py-20 sm:px-8 lg:px-10 2xl:px-12"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-coral">
              Destination pages
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Sell the complete trip, not just one listing.
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-stone">
              Each destination connects travel timing, nearby resorts, available
              vehicles, attractions, maps, weather notes, and estimated trip cost.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                <p className="mt-2 flex items-center gap-1.5 text-sm font-bold capitalize text-stone">
  <MapPinned className="h-4 w-4 shrink-0 text-coral" />
  {destination.slug?.replace(/-/g, " ") || "Unknown Location"}
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
                {destination.googleMapsLink && (
                  <ViewLocationButton href={destination.googleMapsLink} />
                )}
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

          <ResortsSection userRole={session?.role} userId={session?.sub} />
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

      <section className="mx-auto max-w-none px-5 py-20 sm:px-8 lg:px-10 2xl:px-12">
        <div>
          <h2 className="text-5xl font-black tracking-tight sm:text-7xl">
           Adventure begins where plans end !
          </h2>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
