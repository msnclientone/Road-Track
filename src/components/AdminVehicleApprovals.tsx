"use client";

import { useEffect, useState } from "react";

export default function AdminVehicleApprovals() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [pricePerDay, setPricePerDay] = useState<Record<string, number>>({});
  const [pricePerKm, setPricePerKm] = useState<Record<string, number>>({});
  const [availability, setAvailability] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);

    try {
      const res = await fetch("/api/admin/vehicles/pending");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setVehicles(data.vehicles);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(vehicle: any) {
    const res = await fetch(
      "/api/admin/vehicles/update-status",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicleId: vehicle.id,
          status: "APPROVED",
          pricePerDay: pricePerDay[vehicle.id],
          pricePerKm: pricePerKm[vehicle.id],
          availability:
            availability[vehicle.id] ??
            "AVAILABLE",
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    load();
  }

  async function reject(id: string) {
    const res = await fetch(
      "/api/admin/vehicles/update-status",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicleId: id,
          status: "REJECTED",
        }),
      }
    );

    await res.json();

    load();
  }

  if (loading)
    return <div>Loading...</div>;

  if (error)
    return (
      <div className="text-red-600">
        {error}
      </div>
    );

  return (
    <div>

      <h3 className="mb-5 text-2xl font-black">
        Vehicle Submissions
      </h3>

      <div className="grid gap-4">

        {vehicles.length === 0 ? (

          <div className="rounded-md border p-4">
            No pending vehicle requests.
          </div>

        ) : (

          vehicles.map((v) => (

            <div
              key={v.id}
              className="rounded-lg border border-ink/10 bg-white p-5"
            >

              <div className="grid gap-6 lg:grid-cols-2">

                <div className="space-y-2">

                  <h4 className="text-2xl font-black">
                    {v.vehicleType}
                  </h4>

                  <p>
                    <b>Owner :</b>{" "}
                    {v.owner?.name ??
                      v.owner?.email}
                  </p>

                  <p>
                    <b>Driver :</b>{" "}
                    {v.driverName}
                  </p>

                  <p>
                    <b>Phone :</b>{" "}
                    {v.driverPhone}
                  </p>

                  <p>
                    <b>Registration :</b>{" "}
                    {v.registrationNo}
                  </p>

                  <p>
                    <b>Seats :</b>{" "}
                    {v.seatingCapacity}
                  </p>

                </div>

                <div className="space-y-4">
                                    <div>

                    <label className="mb-1 block font-bold">
                      Price Per Day
                    </label>

                    <input
                      type="number"
                      placeholder="₹ Per Day"
                      defaultValue={v.pricePerDay ?? ""}
                      onChange={(e) =>
                        setPricePerDay({
                          ...pricePerDay,
                          [v.id]: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-md border px-3 py-2"
                    />

                  </div>

                  <div>

                    <label className="mb-1 block font-bold">
                      Price Per KM
                    </label>

                    <input
                      type="number"
                      placeholder="₹ Per KM"
                      defaultValue={v.pricePerKm ?? ""}
                      onChange={(e) =>
                        setPricePerKm({
                          ...pricePerKm,
                          [v.id]: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-md border px-3 py-2"
                    />

                  </div>

                  <div>

                    <label className="mb-1 block font-bold">
                      Availability
                    </label>

                    <select
                      defaultValue={v.availability ?? "AVAILABLE"}
                      onChange={(e) =>
                        setAvailability({
                          ...availability,
                          [v.id]: e.target.value,
                        })
                      }
                      className="w-full rounded-md border px-3 py-2"
                    >
                      <option value="AVAILABLE">
                        Available
                      </option>

                      <option value="UNAVAILABLE">
                        Unavailable
                      </option>

                      <option value="SOLD_OUT">
                        Sold Out
                      </option>

                    </select>

                  </div>

                  <div className="flex gap-3 pt-2">
                                        <button
                      onClick={() => approve(v)}
                      className="flex-1 rounded-md bg-green-600 px-4 py-2 font-bold text-white transition hover:bg-green-700"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => reject(v.id)}
                      className="flex-1 rounded-md bg-red-600 px-4 py-2 font-bold text-white transition hover:bg-red-700"
                    >
                      Reject
                    </button>

                  </div>

                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">

                    <p className="font-bold text-amber-700">
                      Before approving:
                    </p>

                    <ul className="mt-2 list-disc pl-5 text-stone">
                      <li>Verify RC details</li>
                      <li>Verify driver's phone number</li>
                      <li>Verify seating capacity</li>
                      <li>Set Price Per Day</li>
                      <li>Set Price Per KM</li>
                      <li>Select availability</li>
                    </ul>

                  </div>

                </div>

              </div>

            </div>

          ))        )}

      </div>

    </div>

  );
}