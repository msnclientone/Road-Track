import { vehicleImages } from "@/lib/vehicleImages";
import AdminDeleteVehicleButton from "@/components/AdminDeleteVehicleButton";
import Link from "next/link";
import Image from "next/image";

import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";

export default async function ApprovedVehiclesPage() {
  const vehicles = await prisma.vehicle.findMany({
    where: {
      status: "APPROVED",
    },
    include: {
      owner: true,
      destination: true,
    },
    orderBy: {
      createdAt: "desc",
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
            Approved Vehicles
          </h1>

          <p className="mt-2 text-stone">
            Manage all approved vehicles.
          </p>

        </div>

        <div className="grid gap-6">

          {vehicles.map((vehicle) => (

            <div
              key={vehicle.id}
              className="rounded-2xl border bg-white p-6 shadow-sm"
            >

              <div className="flex items-center justify-between">

                <div className="flex gap-5">

                  <Image
  src={
    vehicleImages[vehicle.vehicleType] ??
    "/vehicle-images/default.jpg"
  }
  alt={vehicle.vehicleType}
  width={130}
  height={90}
  className="h-[90px] w-[130px] rounded-lg object-cover"
/>

                  <div>

                    <h2 className="text-2xl font-black">
                      {vehicle.vehicleType}
                    </h2>

                    <p className="text-stone">
                      {vehicle.registrationNo}
                    </p>

                    <p className="mt-3">
                      <span className="font-bold">
                        Owner:
                      </span>{" "}
                      {vehicle.owner?.name ?? "Unknown Owner"}
                    </p>

                    <p>
                      <span className="font-bold">
                        Destination:
                      </span>{" "}
                      {vehicle.destination?.name ?? "Not Assigned"}
                    </p>

                  </div>

                </div>

                <div className="flex gap-3">

                  <Link
                    href={`/vehicle/${vehicle.id}`}
                    className="rounded-lg bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
                  >
                    View
                  </Link>

                  <AdminDeleteVehicleButton vehicleId={vehicle.id} />

                </div>

              </div>

            </div>

          ))}

        </div>

      </section>

    </main>
  );
}