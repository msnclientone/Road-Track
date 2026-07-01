import AdminDeleteResortButton from "@/components/AdminDeleteResortButton";
import Link from "next/link";
import Image from "next/image";

import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";

export default async function ApprovedResortsPage() {
  const resorts = await prisma.resort.findMany({
    where: {
      status: "APPROVED",
    },
    include: {
      owner: true,
      destination: true,
    },
  });

  return (
    <main className="min-h-screen bg-ivory text-ink">

      <SiteHeader />

      <section className="mx-auto max-w-7xl px-6 pt-28 pb-20">

        <div className="mb-8">

          <Link
            href="/admin"
            className="font-bold text-coral"
          >
            ← Back to Dashboard
          </Link>

          <h1 className="mt-4 text-5xl font-black">
            Approved Resorts
          </h1>

          <p className="mt-2 text-stone">
            Manage all approved resorts.
          </p>

        </div>

        <div className="grid gap-6">

          {resorts.map((resort) => (

            <div
              key={resort.id}
              className="rounded-2xl border bg-white p-6 shadow-sm"
            >

              <div className="flex items-center justify-between">

                <div className="flex gap-5">

                  <Image
                    src="/images/kapu-beach.jpg"
                    alt={resort.name}
                    width={130}
                    height={90}
                    className="h-[90px] w-[130px] rounded-lg object-cover"
                  />

                  <div>

                    <h2 className="text-2xl font-black">
                      {resort.name}
                    </h2>

                    <p className="text-stone">
                      {resort.address}
                    </p>

                    <p className="mt-3">
                      <span className="font-bold">
                        Owner:
                      </span>{" "}
                      {resort.owner?.name ?? "Unknown"}
                    </p>

                    <p>
                      <span className="font-bold">
                        Destination:
                      </span>{" "}
                      {resort.destination?.name ?? "Not Assigned"}
                    </p>

                  </div>

                </div>

                <div className="flex gap-3">

                  <Link
                    href={`/resort/${resort.id}`}
                    className="rounded-lg bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
                  >
                    View
                  </Link>

                  <AdminDeleteResortButton
  resortId={resort.id}
/>

                </div>

              </div>

            </div>

          ))}

        </div>

      </section>

    </main>
  );
}