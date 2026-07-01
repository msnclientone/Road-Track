import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { formatCurrency } from "@/lib/utils";
import RemoveFromBucketButton from "@/components/RemoveFromBucketButton";

export default async function BucketPage() {
  const session = await getSession();

  if (!session || session.role !== "CUSTOMER") {
    redirect("/login");
  }

 const bucket = await prisma.bucket.findFirst({
  where: {
    customerId: session.sub,
  },
  include: {
    items: {
      include: {
        resort: {
          include: {
            destination: true,
          },
        },
        vehicle: {
          include: {
            destination: true,
          },
        },
      },
    },
  },
});

  return (
    <main className="min-h-screen bg-ivory">
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-5 py-24 sm:py-28">
        <h1 className="text-4xl font-black sm:text-5xl">
          My Bucket
        </h1>

        {!bucket || bucket.items.length === 0 ? (
  <div className="mt-8 rounded-lg border bg-white p-6 text-center sm:mt-10 sm:p-8">
    <h2 className="text-xl font-black sm:text-2xl">
      Bucket is Empty
    </h2>

    <p className="mt-3 text-sm text-stone sm:text-base">
      Browse resorts and vehicles to add them.
    </p>
  </div>
) : (
  <>
    <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-6">
      {bucket.items.map((item) => (
        <div
          key={item.id}
          className="rounded-lg border bg-white p-5 sm:p-6"
        >
          {item.resort && (
            <>
              <h2 className="text-xl font-black sm:text-2xl">
                {item.resort.name}
              </h2>

              <p className="text-sm text-stone sm:text-base">
                {item.resort.destination.name}
              </p>

              <p className="mt-2 font-black text-coral">
                {formatCurrency(item.resort.priceMin)}
                {" - "}
                {formatCurrency(item.resort.priceMax)}
              </p>
            </>
          )}

          {item.vehicle && (
            <>
              <h2 className="text-xl font-black sm:text-2xl">
                {item.vehicle.vehicleType}
              </h2>

              <p className="text-sm text-stone sm:text-base">
                {item.vehicle.destination?.name}
              </p>

              <p className="mt-2 font-black text-coral">
                {item.vehicle.pricePerDay != null
                  ? formatCurrency(item.vehicle.pricePerDay)
                  : "Not Set"}
                {" / Day"}
              </p>
            </>
          )}

          <div className="mt-4">
  <RemoveFromBucketButton itemId={item.id} />
</div>
        </div>
      ))}
    </div>

    <div className="mt-8 flex justify-end sm:mt-10">
      <a
        href="/planner"
        className="w-full rounded-lg bg-coral px-6 py-3 text-center font-black text-ink hover:bg-coral/90 sm:w-auto"
      >
        Proceed to Trip Planner →
      </a>
    </div>
  </>
)}
   </section>
      <SiteFooter />
    </main>
  );
}