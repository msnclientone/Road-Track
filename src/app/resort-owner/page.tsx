/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BedDouble,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Hotel,
  IndianRupee,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  ShieldCheck,
} from "lucide-react";

import { MetricCard, StatusBadge } from "@/components/DashboardBits";
import { SiteHeader } from "@/components/SiteHeader";
import { getSession } from "@/lib/auth/session";
import {
  formatPanelDate,
  getWhatsAppPhone,
  jsonStringList,
  toDashboardLeadStatus,
} from "@/lib/partner-dashboard";
import { prisma } from "@/lib/prisma";
import { buildWhatsAppUrl, formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

const fallbackResortImage =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";

export default async function ResortOwnerDashboardPage() {
  const session = await getSession();

  if (!session || session.role !== "RESORT_OWNER") {
    redirect("/login/resort-owner");
  }

  if (session.partnerStatus !== "APPROVED") {
    redirect("/resort-owner/pending");
  }

  const [owner, resorts, assignedLeads, bookings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.sub },
      select: {
        name: true,
        email: true,
        phone: true,
        partnerStatus: true,
      },
    }),
    prisma.resort.findMany({
      where: { ownerId: session.sub },
      include: {
        destination: {
          select: {
            name: true,
          },
        },
        media: {
          orderBy: { order: "asc" },
          take: 1,
        },
        rooms: {
          orderBy: { pricePerNight: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.enquiry.findMany({
      where: {
        assignedResort: {
          is: {
            ownerId: session.sub,
          },
        },
      },
      include: {
        assignedResort: {
          select: {
            name: true,
          },
        },
        destination: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.booking.findMany({
      where: {
        resort: {
          is: {
            ownerId: session.sub,
          },
        },
      },
      include: {
        enquiry: {
          select: {
            customerName: true,
            travelDate: true,
          },
        },
        resort: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const totalRooms = resorts.reduce(
    (sum, resort) => sum + resort.rooms.length,
    0,
  );
  const availableRooms = resorts.reduce(
    (sum, resort) =>
      sum +
      resort.rooms.filter((room) => room.availability === "AVAILABLE").length,
    0,
  );
  const activeLeadCount = assignedLeads.filter(
    (lead) => lead.status !== "CANCELLED",
  ).length;
  const confirmedBookingValue = bookings
    .filter((booking) => booking.status === "CONFIRMED")
    .reduce((sum, booking) => sum + booking.bookingValue, 0);
  const payoutDue = bookings
    .filter((booking) => booking.status === "CONFIRMED")
    .reduce((sum, booking) => sum + booking.payoutAmt, 0);

  const partnerName = owner?.name ?? session.email;

  return (
    <main className="min-h-screen bg-ivory text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-none px-5 pb-20 pt-28 sm:px-8 lg:px-10 2xl:px-12">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-coral">
              Resort Owner Panel
            </p>
            <h1 className="mt-3 text-5xl font-black tracking-tight sm:text-6xl">
              Welcome, {partnerName}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-stone">
              Track resort availability, assigned enquiries, room inventory,
              bookings, and payout value from your partner workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={buildWhatsAppUrl(
                "Hello Road Track, I want to update my resort listing or room availability.",
              )}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-md bg-mint px-5 font-black text-ink transition hover:bg-mint/90"
            >
              <MessageCircle className="h-5 w-5" />
              Contact admin
            </a>
            <Link
              href="/login/resort-owner"
              className="inline-flex h-12 items-center gap-2 rounded-md border border-ink/15 bg-white px-5 font-black transition hover:border-coral hover:text-coral"
            >
              <ShieldCheck className="h-5 w-5" />
              Switch account
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Listed resorts"
            value={String(resorts.length)}
            change={`${availableRooms}/${totalRooms} rooms open`}
          />
          <MetricCard
            label="Assigned leads"
            value={String(activeLeadCount)}
            change={`${assignedLeads.length} total`}
          />
          <MetricCard
            label="Confirmed value"
            value={formatCurrency(confirmedBookingValue)}
            change="Bookings"
          />
          <MetricCard
            label="Payout due"
            value={formatCurrency(payoutDue)}
            change="After commission"
          />
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-lg border border-ink/10 bg-white shadow-sm">
            <PanelHeader
              icon={Hotel}
              title="Your resort listings"
              text="Room availability, destination, pricing, and approval status."
            />

            {resorts.length > 0 ? (
              <div className="grid gap-4 p-5 lg:grid-cols-2">
                {resorts.map((resort) => {
                  const amenities = jsonStringList(resort.amenities);
                  const openRooms = resort.rooms.filter(
                    (room) => room.availability === "AVAILABLE",
                  ).length;
                  const image = resort.media[0]?.url ?? fallbackResortImage;

                  return (
                    <article
                      key={resort.id}
                      className="overflow-hidden rounded-lg border border-ink/10"
                    >
                      <div className="aspect-[16/9] overflow-hidden bg-ivory">
                        <img
                          src={image}
                          alt={resort.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-2xl font-black">
                              {resort.name}
                            </h3>
                            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-stone">
                              <MapPin className="h-4 w-4 text-coral" />
                              {resort.destination.name}
                            </p>
                          </div>
                          <span className="rounded-full bg-mint/20 px-3 py-1 text-xs font-black text-emerald-700">
                            {resort.status}
                          </span>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <MiniStat
                            icon={IndianRupee}
                            label="Starting price"
                            value={formatCurrency(resort.priceMin)}
                          />
                          <MiniStat
                            icon={BedDouble}
                            label="Open rooms"
                            value={`${openRooms}/${resort.rooms.length}`}
                          />
                        </div>

                        {amenities.length > 0 ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {amenities.slice(0, 4).map((amenity) => (
                              <span
                                key={amenity}
                                className="rounded-full bg-ivory px-3 py-1 text-xs font-black text-stone"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        {resort.rooms.length > 0 ? (
                          <div className="mt-5 grid gap-2">
                            {resort.rooms.slice(0, 3).map((room) => (
                              <div
                                key={room.id}
                                className="flex items-center justify-between rounded-md bg-ivory px-3 py-2 text-sm"
                              >
                                <span className="font-black">{room.name}</span>
                                <span className="font-semibold text-stone">
                                  {room.availability} -{" "}
                                  {formatCurrency(room.pricePerNight)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-5 rounded-md bg-coral/15 p-3 text-sm font-bold text-stone">
                            Add room types through Super Admin to publish live
                            inventory.
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={Plus}
                title="No resort listing assigned"
                text="Ask Super Admin to create or assign your first resort listing. It will appear here after approval."
              />
            )}
          </section>

          <aside className="grid gap-6">
            <section className="rounded-lg border border-ink/10 bg-ink p-6 text-ivory">
              <div className="flex items-center gap-3">
                <IndianRupee className="h-6 w-6 text-mint" />
                <h2 className="text-2xl font-black">Booking payout</h2>
              </div>
              <div className="mt-6 grid gap-4">
                <PayoutRow label="Confirmed bookings" value={bookings.length} />
                <PayoutRow
                  label="Gross booking value"
                  value={formatCurrency(confirmedBookingValue)}
                />
                <PayoutRow
                  label="Estimated payout"
                  value={formatCurrency(payoutDue)}
                />
              </div>
            </section>

            <section className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-coral" />
                <h2 className="text-2xl font-black">Partner profile</h2>
              </div>
              <div className="mt-5 grid gap-3 text-sm font-semibold text-stone">
                <ProfileLine icon={Mail} label={session.email} />
                <ProfileLine icon={Phone} label={owner?.phone ?? "Phone not set"} />
                <ProfileLine
                  icon={CheckCircle2}
                  label={`Status: ${owner?.partnerStatus ?? session.partnerStatus}`}
                />
              </div>
            </section>
          </aside>
        </div>

        <section className="mt-10 rounded-lg border border-ink/10 bg-white shadow-sm">
          <PanelHeader
            icon={ClipboardList}
            title="Assigned enquiries"
            text="Customer leads assigned to your resort listings by Road Track."
          />

          {assignedLeads.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead className="bg-ivory text-xs uppercase tracking-[0.14em] text-stone">
                  <tr>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Trip</th>
                    <th className="px-5 py-4">Requirement</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Assigned resort</th>
                    <th className="px-5 py-4">Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedLeads.map((lead) => {
                    const phone = getWhatsAppPhone(lead.customerPhone);
                    const destination =
                      lead.destination?.name ?? "Destination not set";

                    return (
                      <tr key={lead.id} className="border-t border-ink/10">
                        <td className="px-5 py-4">
                          <p className="font-black">{lead.customerName}</p>
                          <p className="text-xs font-bold text-stone">
                            {lead.customerEmail ?? lead.customerPhone}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold">{destination}</p>
                          <p className="text-xs font-semibold text-stone">
                            {formatPanelDate(lead.travelDate)} -{" "}
                            {lead.numPeople ?? 1} people
                          </p>
                        </td>
                        <td className="px-5 py-4 font-semibold text-stone">
                          {lead.message ?? "Resort stay enquiry"}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge
                            status={toDashboardLeadStatus(lead.status)}
                          />
                        </td>
                        <td className="px-5 py-4 font-semibold text-stone">
                          {lead.assignedResort?.name ?? "Not assigned"}
                        </td>
                        <td className="px-5 py-4">
                          {phone ? (
                            <a
                              href={buildWhatsAppUrl(
                                `Hello ${lead.customerName}, this is ${partnerName} from Road Track regarding your ${destination} stay enquiry.`,
                                phone,
                              )}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex h-10 items-center gap-2 rounded-md bg-mint px-3 text-sm font-black text-ink transition hover:bg-mint/90"
                            >
                              <MessageCircle className="h-4 w-4" />
                              WhatsApp
                            </a>
                          ) : (
                            <span className="text-sm font-semibold text-stone">
                              No phone
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={CalendarClock}
              title="No assigned enquiries yet"
              text="New resort leads will appear here after Road Track assigns them to your property."
            />
          )}
        </section>
      </section>
    </main>
  );
}

function PanelHeader({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Hotel;
  title: string;
  text: string;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-ink/10 p-5 sm:flex-row sm:items-center">
      <div className="flex items-start gap-3">
        <Icon className="mt-1 h-6 w-6 text-coral" />
        <div>
          <h2 className="text-2xl font-black">{title}</h2>
          <p className="mt-1 text-sm font-semibold text-stone">{text}</p>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BedDouble;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md bg-ivory p-3">
      <div className="flex items-center gap-2 text-coral">
        <Icon className="h-4 w-4" />
        <p className="text-xs font-black uppercase tracking-[0.12em]">
          {label}
        </p>
      </div>
      <p className="mt-2 text-lg font-black">{value}</p>
    </div>
  );
}

function PayoutRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-md bg-white/10 p-4">
      <p className="text-sm text-white/65">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function ProfileLine({
  icon: Icon,
  label,
}: {
  icon: typeof Mail;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-ivory p-3">
      <Icon className="h-4 w-4 text-coral" />
      <span>{label}</span>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Plus;
  title: string;
  text: string;
}) {
  return (
    <div className="p-8">
      <div className="rounded-lg border border-dashed border-ink/20 bg-ivory p-8 text-center">
        <Icon className="mx-auto h-9 w-9 text-coral" />
        <h3 className="mt-4 text-2xl font-black">{title}</h3>
        <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-stone">
          {text}
        </p>
      </div>
    </div>
  );
}
