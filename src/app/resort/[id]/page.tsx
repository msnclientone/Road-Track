import { notFound } from "next/navigation";
import Image from "next/image";
import { Mail, Phone, MapPin, IndianRupee } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { prisma } from "@/lib/prisma";
import { buildWhatsAppUrl, formatCurrency } from "@/lib/utils";
import { getSession } from "@/lib/auth/session";
import AddToBucketButton from "@/components/AddToBucketButton";

export async function generateStaticParams() {
  const resorts = await prisma.resort.findMany({
    where: { status: "APPROVED" },
    select: { id: true },
  });

  return resorts.map((resort) => ({
    id: resort.id,
  }));
}

export default async function ResortDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  const resort = await prisma.resort.findUnique({
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

  if (!resort || resort.status !== "APPROVED") {
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
              <a href={`/destinations/${resort.destination.slug}`} className="hover:text-coral">
                {resort.destination.name}
              </a>
              {" / "}
              <span>{resort.name}</span>
            </nav>

            {/* Title and Location */}
            <h1 className="text-5xl font-black tracking-tight sm:text-6xl">
              {resort.name}
            </h1>
            <p className="mt-3 flex items-center gap-2 text-lg font-bold text-stone">
              <MapPin className="h-5 w-5 text-coral" />
              {resort.address}
            </p>

            {/* Image Gallery */}
            <div className="mt-8 rounded-lg overflow-hidden">
              <div className="relative aspect-video">
                <Image
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop"
                  alt={resort.name}
                  fill
                  priority
                  loading="eager"
                  className="object-cover"
                  sizes="(min-width: 1024px) 66vw, 100vw"
                />
              </div>
            </div>

            {/* Description */}
            <div className="mt-8">
              <h2 className="text-2xl font-black">About this resort</h2>
              <p className="mt-4 text-lg leading-8 text-stone">
                {resort.description}
              </p>
            </div>

            {/* Amenities */}
            {Array.isArray(resort.amenities) &&
  resort.amenities.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-black">Amenities</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {(resort.amenities as string[]).map((amenity: string) => (
                    <div
                      key={amenity}
                      className="rounded-lg border border-ink/10 bg-white p-4 text-center font-bold"
                    >
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing */}
            <div className="mt-8 rounded-lg border border-coral/20 bg-coral/5 p-6">
              <h2 className="text-2xl font-black">Pricing</h2>
              <div className="mt-4 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-stone">Starting from</p>
                  <p className="mt-2 text-3xl font-black text-coral">
                    {formatCurrency(resort.priceMin)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-stone">Up to</p>
                  <p className="mt-2 text-3xl font-black text-coral">
                    {formatCurrency(resort.priceMax)}
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
                <p className="mt-1 text-lg font-black">
  {resort.owner?.name ?? "Not Available"}
</p>
              </div>

              {resort.owner?.email && (
                <div>
                  <p className="text-sm font-bold text-stone">Email</p>
                  <a
                    href={`mailto:${resort.owner?.email}`}
                    className="mt-1 flex items-center gap-2 text-coral hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {resort.owner.email}
                  </a>
                </div>
              )}

              {resort.owner?.phone && (
                <div>
                  <p className="text-sm font-bold text-stone">Phone</p>
                  <a
                    href={`tel:${resort.owner?.phone}`}
                    className="mt-1 flex items-center gap-2 text-coral hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    {resort.owner?.phone}
                  </a>
                </div>
              )}

              <div className="pt-4">
                <p className="text-sm text-stone">Destination</p>
                <p className="mt-1 font-bold">{resort.destination.name}</p>
              </div>

              <div className="pt-4">
                <p className="text-sm text-stone">Price Range</p>
                <p className="mt-1 flex items-center gap-2 font-black text-coral">
                  <IndianRupee className="h-4 w-4" />
                  {formatCurrency(resort.priceMin)} - {formatCurrency(resort.priceMax)}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
  {session?.role === "CUSTOMER" && (
  <AddToBucketButton resortId={resort.id} />
)}
  <a
    href={buildWhatsAppUrl(
      `Hello Road Track,\nI'm interested in ${resort.name} in ${resort.destination.name}. Can you provide more details?`
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
