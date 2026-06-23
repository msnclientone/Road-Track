import {
  BarChart3,
  Download,
  Plus,
  Send,
  ShieldCheck,
  Eye,
} from "lucide-react";

import { MetricCard, StatusBadge } from "@/components/DashboardBits";
import { SiteHeader } from "@/components/SiteHeader";
import { dashboardStats, leads, resorts, vehicles } from "@/lib/data";
import { buildWhatsAppUrl, formatCurrency } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import AdminPartnerApprovals from "@/components/AdminPartnerApprovals";
import AdminResortApprovals from "@/components/AdminResortApprovals";
import AdminVehicleApprovals from "@/components/AdminVehicleApprovals";

const approvals = [
  { name: "Beach Nest Homestay", type: "Resort", owner: "Sharath", status: "Review" },
  { name: "Coastal Riders Fleet", type: "Vehicle", owner: "Naveen", status: "KYC pending" },
];

export default async function AdminPage() {
  const superAdminCount = await prisma.user.count({ where: { role: "SUPER_ADMIN" } });
  const confirmedValue = leads
    .filter((lead) => lead.status === "Confirmed")
    .reduce((sum, lead) => sum + lead.value, 0);
  const commission = Math.round(confirmedValue * 0.1);

  return (
    <main className="min-h-screen bg-ivory text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-none px-5 pb-20 pt-28 sm:px-8 lg:px-10 2xl:px-12">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-coral">
              Super Admin
            </p>
            <h1 className="mt-3 text-5xl font-black tracking-tight sm:text-6xl">
              Road Track command center
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-stone">
              Manage resorts, vehicles, leads, partner approvals, commission,
              pricing visibility, and WhatsApp communication from one screen.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={buildWhatsAppUrl(
                "Road Track partner update:\nPlease confirm your availability for this week.",
              )}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-md bg-mint px-5 font-black text-ink transition hover:bg-mint/90"
            >
              <Send className="h-5 w-5" />
              Broadcast
            </a>
            {superAdminCount === 0 && (
              <a
                href="/admin/create-super-admin"
                className="inline-flex h-12 items-center gap-2 rounded-md bg-coral px-5 font-black text-white transition hover:bg-coral/90"
              >
                Create Super Admin
              </a>
            )}
            <a
              href="/admin/approved-listings"
              className="inline-flex h-12 items-center gap-2 rounded-md bg-ink px-5 font-black text-white transition hover:bg-stone"
            >
              <Eye className="h-5 w-5" />
              View Approved Listings
            </a>
            <button className="inline-flex h-12 items-center gap-2 rounded-md bg-ink px-5 font-black text-white transition hover:bg-stone">
              <Plus className="h-5 w-5" />
              Add listing
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dashboardStats.map((stat) => (
            <MetricCard key={stat.label} {...stat} />
          ))}
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <section className="rounded-lg border border-ink/10 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-ink/10 p-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-2xl font-black">Lead management</h2>
                <p className="mt-1 text-sm font-semibold text-stone">
                  Assign every enquiry before partners contact the customer.
                </p>
              </div>
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-ink/15 px-4 font-black transition hover:border-coral hover:text-coral">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-left">
                <thead className="bg-ivory text-xs uppercase tracking-[0.14em] text-stone">
                  <tr>
                    <th className="px-5 py-4">Lead</th>
                    <th className="px-5 py-4">Phone</th>
                    <th className="px-5 py-4">Place</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Assigned</th>
                    <th className="px-5 py-4">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-t border-ink/10">
                      <td className="px-5 py-4">
                        <p className="font-black">{lead.name}</p>
                        <p className="text-xs font-bold text-stone">{lead.id}</p>
                      </td>
                      <td className="px-5 py-4 font-semibold text-stone">
                        {lead.phone}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold">{lead.place}</p>
                        <p className="text-xs text-stone">{lead.requirement}</p>
                      </td>
                      <td className="px-5 py-4 font-semibold text-stone">
                        {lead.date}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="px-5 py-4 font-semibold text-stone">
                        {lead.assignedTo}
                      </td>
                      <td className="px-5 py-4 font-black">
                        {formatCurrency(lead.value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="grid gap-6">
            <section className="rounded-lg border border-ink/10 bg-ink p-6 text-ivory">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-coral" />
                <h2 className="text-2xl font-black">Commission snapshot</h2>
              </div>
              <div className="mt-6 grid gap-4">
                <div className="rounded-md bg-white/10 p-4">
                  <p className="text-sm text-white/65">Booking value</p>
                  <p className="mt-1 text-3xl font-black">
                    {formatCurrency(confirmedValue)}
                  </p>
                </div>
                <div className="rounded-md bg-white/10 p-4">
                  <p className="text-sm text-white/65">Road Track commission</p>
                  <p className="mt-1 text-3xl font-black text-mint">
                    {formatCurrency(commission)}
                  </p>
                </div>
                <div className="rounded-md bg-white/10 p-4">
                  <p className="text-sm text-white/65">Amount to partner</p>
                  <p className="mt-1 text-3xl font-black">
                    {formatCurrency(confirmedValue - commission)}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-coral" />
                <h2 className="text-2xl font-black">Approvals</h2>
              </div>
              <div className="mt-5 grid gap-6">
                <AdminPartnerApprovals />
                <AdminResortApprovals />
                <AdminVehicleApprovals />
              </div>
            </section>
          </aside>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <AdminControl
            title="Lead status workflow"
            text="New enquiries move through contacted, confirmed, or cancelled after Road Track verifies the customer requirement."
          />
          <AdminControl
            title="Manual partner assignment"
            text={`${resorts.length} resorts and ${vehicles.length} vehicles are available as the current demo partner pool.`}
          />
          <AdminControl
            title="Audit-ready operations"
            text="Production mutations should write AuditLog rows and re-check role permissions on every server action."
          />
        </div>
      </section>
    </main>
  );
}

function AdminControl({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
      <div className="text-coral">
        <ShieldCheck className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-2xl font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone">{text}</p>
    </article>
  );
}
