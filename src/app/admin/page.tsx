import Link from "next/link";
import DestinationManager from "@/components/DestinationManager";
import AdminPartnerApprovals from "@/components/AdminPartnerApprovals";
import AdminResortApprovals from "@/components/AdminResortApprovals";
import AdminVehicleApprovals from "@/components/AdminVehicleApprovals";
import AdminAddVehicle from "@/components/AdminAddVehicle";
import AdminAddResort from "@/components/AdminAddResort";
import ResetVisitorCounter from "@/components/ResetVisitorCounter";

import { SiteHeader } from "@/components/SiteHeader";
import { getSessionUser } from "@/lib/auth/get-session-user";

import {
  Building2,
  Car,
  Eye,
  MapPinned,
  RefreshCw,
  Send,
  Users,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { buildWhatsAppUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const headerUser = await getSessionUser();
  const [
  destinationCount,
  resortCount,
  vehicleCount,
  pendingPartners,
  analytics,
  destinationOptions,
] = await Promise.all([
    prisma.destination.count(),

    prisma.resort.count({
      where: {
        status: "APPROVED",
      },
    }),

    prisma.vehicle.count({
      where: {
        status: "APPROVED",
      },
    }),

    prisma.user.count({
      where: {
        role: {
          in: ["RESORT_OWNER", "VEHICLE_OWNER"],
        },
      },
    }),

    prisma.websiteAnalytics.findUnique({
  where: {
    id: "main",
  },
}),

    prisma.destination.findMany({
  select: { id: true, name: true, slug: true },
  orderBy: { name: "asc" },
}),
  ]);

  return (
    <main className="min-h-screen bg-ivory text-ink">

      <SiteHeader user={headerUser} />

      <section className="mx-auto max-w-7xl px-6 pb-24 pt-28">

        {/* HERO */}

        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-ink via-[#20372d] to-ink p-10 text-white shadow-xl">

          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">

            <div>

              <p className="text-sm font-black uppercase tracking-[0.25em] text-coral">
                Road Track
              </p>

              <h1 className="mt-4 text-5xl font-black md:text-6xl">
                Super Admin
                <br />
                Control Center
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
                Manage destinations, tourism partners,
                resorts and vehicles from one centralized dashboard.
              </p>

            </div>

            <div className="flex flex-wrap gap-3">

              <a
                href={buildWhatsAppUrl(
                  "Road Track Broadcast:\nPlease update your availability for this week."
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-coral px-5 font-black text-ink transition hover:scale-105"
              >
                <Send className="h-5 w-5" />
                Broadcast
              </a>

              <a
                href="/admin/approved-listings"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 font-black backdrop-blur transition hover:bg-white hover:text-ink"
              >
                <Eye className="h-5 w-5" />
                Approved Listings
              </a>

              <button
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 font-black backdrop-blur transition hover:bg-white hover:text-ink"
              >
                <RefreshCw className="h-5 w-5" />
                Refresh
              </button>



            </div>

          </div>

        </div>

        {/* DASHBOARD OVERVIEW */}

        <section className="mt-10">

          <div className="mb-6">

            <h2 className="text-3xl font-black">
              Dashboard Overview
            </h2>

            <p className="mt-2 text-stone">
              Live statistics from your Road Track platform.
            </p>

          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

            <DashboardCard
              icon={<MapPinned className="h-8 w-8" />}
              title="Destinations"
              value={destinationCount}
              subtitle="Available destinations"
            />

            
  <Link href="/admin/approved-resorts">
  <DashboardCard
    icon={<Building2 className="h-8 w-8" />}
    title="Approved Resorts"
    value={resortCount}
    subtitle="Verified partners"
  />
</Link>
            <Link href="/admin/approved-vehicles">
  <DashboardCard
    icon={<Car className="h-8 w-8" />}
    title="Approved Vehicles"
    value={vehicleCount}
    subtitle="Ready for booking"
  />
</Link>

            <DashboardCard
              icon={<Users className="h-8 w-8" />}
              title="Partners"
              value={pendingPartners}
              subtitle="Registered partners"
            />
            <DashboardCard
  icon={<Eye className="h-8 w-8" />}
  title="Website Visitors"
  value={analytics?.totalViews ?? 0}
  subtitle="Total website visits"
/>
<div className="mt-6">
  <ResetVisitorCounter />
</div>

          </div>

        </section>

        {/* APPROVALS */}

        <section className="mt-12 rounded-3xl border bg-white p-8 shadow-sm">

          <h2 className="text-3xl font-black">
            Partner Approvals
          </h2>

          <p className="mt-2 text-stone">
            Review and approve partner registrations.
          </p>

          <div className="mt-8 grid gap-6">

            <AdminPartnerApprovals />

            <AdminResortApprovals />

            <AdminVehicleApprovals />

          </div>

        </section>

        {/* DESTINATION MANAGER */}

        <section className="mt-12">

          <DestinationManager />

        </section>

        {/* ADD VEHICLE / ADD RESORT */}

        <section className="mt-12">
          <h2 className="text-3xl font-black">Add Listing + Create Owner</h2>
          <p className="mt-2 text-stone">
            Create a new vehicle or resort listing and automatically generate an owner account with unique ID and temporary password.
          </p>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <AdminAddVehicle destinationOptions={destinationOptions} />
            <AdminAddResort destinationOptions={destinationOptions} />
          </div>
        </section>
              </section>
    </main>
  );
}

function DashboardCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  subtitle: string;
}) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-ink/10 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

      <div className="flex items-center justify-between">

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-coral/10 text-coral transition group-hover:bg-coral group-hover:text-white">
          {icon}
        </div>

        <span className="rounded-full bg-mint/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-mint">
          Live
        </span>

      </div>

      <h3 className="mt-8 text-lg font-black text-stone">
        {title}
      </h3>

      <p className="mt-2 text-5xl font-black text-ink">
        {value}
      </p>

      <p className="mt-3 text-sm font-semibold text-stone">
        {subtitle}
      </p>

    </article>
  );
}