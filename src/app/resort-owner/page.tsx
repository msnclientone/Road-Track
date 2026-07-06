/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BedDouble,
  Edit3,
  Hotel,
  IndianRupee,
  Mail,
  MapPinned,
  MessageCircle,
  Phone,
  Plus,
  ShieldCheck,
} from "lucide-react";

import PasswordChangeGuard from "@/components/PasswordChangeGuard";
import { SiteHeader } from "@/components/SiteHeader";
import { getSession } from "@/lib/auth/session";
import { jsonStringList } from "@/lib/partner-dashboard";
import { prisma } from "@/lib/prisma";
import { buildWhatsAppUrl, formatCurrency } from "@/lib/utils";
import ResortManager from "@/components/ResortManager";

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

  const [owner, resorts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.sub },
      select: {
        name: true,
        email: true,
        phone: true,
        partnerStatus: true,
        mustChangePassword: true,
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
  ]);

  const partnerName = owner?.name ?? session.email;

  return (
    <PasswordChangeGuard mustChangePassword={owner?.mustChangePassword ?? false}>
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
              Manage your resort listings, room availability, pricing, and
              partner profile from one panel.
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

        <div className="mt-10 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="order-2 rounded-lg border border-ink/10 bg-white shadow-sm xl:order-none">
            <PanelHeader
              icon={Hotel}
              title="Your resort listings"
              text="Room availability, destination, pricing, and approval status."
            />

            <div className="p-5">
              <ResortManager initialResorts={resorts.map((resort) => ({
                id: resort.id,
                name: resort.name,
                slug: resort.slug,
                description: resort.description,
                destinationId: resort.destinationId,
                destination: resort.destination,
                address: resort.address,
                priceMin: resort.priceMin,
                priceMax: resort.priceMax,
                availableAcRooms: resort.availableAcRooms,
                availableNonAcRooms: resort.availableNonAcRooms,
                imageUrl: resort.media[0]?.url ?? null,
                status: resort.status,
              }))} />
            </div>

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
                              <MapPinned className="h-4 w-4 text-coral" />
                              {resort.destination.name}
                            </p>
                          </div>
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

          <aside className="order-1 grid gap-6 xl:order-none">
            <section className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm">
              <div className="bg-gradient-to-br from-coral/[0.07] to-ivory px-6 pb-5 pt-7 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-coral text-2xl font-black text-white shadow-md">
                  {partnerName.charAt(0).toUpperCase()}
                </div>
                <h3 className="mt-3 text-xl font-black">{partnerName}</h3>
                <p className="text-sm font-semibold text-stone">Resort Owner</p>
                <div className="mt-3 flex justify-center">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${
                      owner?.partnerStatus === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        owner?.partnerStatus === "APPROVED"
                          ? "bg-green-500"
                          : "bg-amber-500"
                      }`}
                    />
                    {owner?.partnerStatus === "APPROVED" ? "Approved" : "Pending"}
                  </span>
                </div>
              </div>

              <div className="border-t border-ink/10 px-6 py-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 shrink-0 text-coral" />
                    <span className="truncate font-semibold text-stone">
                      {session.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 shrink-0 text-coral" />
                    <span className="font-semibold text-stone">
                      {owner?.phone ?? "Not set"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-ink/10 p-4">
                <Link
                  href="/profile"
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-black text-white transition hover:bg-stone"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </Link>
              </div>
            </section>
          </aside>
        </div>


      </section>
    </main>
    </PasswordChangeGuard>
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
