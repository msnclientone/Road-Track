"use client";

import { useState } from "react";

type VehicleInput = {
  id?: string;
  vehicleType: string;
  seatingCapacity: number;
  driverName?: string;
  driverPhone?: string;
  registrationNo?: string;
};

export default function VehicleManager({
  initialVehicles,
}: {
  initialVehicles: any[];
}) {
  const [tab, setTab] = useState<"list" | "add">("list");
  const [vehicles, setVehicles] = useState(initialVehicles || []);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<VehicleInput>({
    vehicleType: "",
    seatingCapacity: 4,
    driverName: "",
    driverPhone: "",
    registrationNo: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [priceVehicle, setPriceVehicle] = useState<any>(null);
const [pricePerDay, setPricePerDay] = useState("");
const [pricePerKm, setPricePerKm] = useState("");

  function resetForm() {
    setEditingId(null);

    setForm({
      vehicleType: "",
      seatingCapacity: 4,
      driverName: "",
      driverPhone: "",
      registrationNo: "",
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError(null);

    if (!/^[0-9]{10}$/.test(form.driverPhone ?? "")) {
      setError("Driver phone must contain exactly 10 digits.");
      setLoading(false);
      return;
    }

    try {
      const endpoint = editingId
        ? "/api/partner/vehicle/update"
        : "/api/partner/vehicle/create";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          id: editingId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      if (editingId) {
        setVehicles((old: any[]) =>
          old.map((v) =>
            v.id === editingId ? data.vehicle : v
          )
        );
      } else {
        setVehicles((old: any[]) => [
          data.vehicle,
          ...old,
        ]);
      }

      resetForm();

      setTab("list");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteVehicle(id: string) {
    if (!confirm("Delete this vehicle?")) return;

    try {
      const res = await fetch(
        "/api/partner/vehicle/delete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setVehicles((old: any[]) =>
        old.filter((v) => v.id !== id)
      );
    } catch (err: any) {
      alert(err.message);
    }
  }

  function editVehicle(vehicle: any) {
    setEditingId(vehicle.id);

    setForm({
      vehicleType: vehicle.vehicleType,
      seatingCapacity: vehicle.seatingCapacity,
      driverName: vehicle.driverName,
      driverPhone: vehicle.driverPhone,
      registrationNo: vehicle.registrationNo,
    });

    setTab("add");
  }
async function updatePrice() {
  try {
    const res = await fetch("/api/partner/vehicle/update-price", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vehicleId: priceVehicle.id,
        driverName: priceVehicle.driverName,
        driverPhone: priceVehicle.driverPhone,
        availability: priceVehicle.availability,
        pricePerDay: Number(pricePerDay),
        pricePerKm: Number(pricePerKm),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    setVehicles((old: any[]) =>
      old.map((v) =>
        v.id === priceVehicle.id ? data.vehicle : v
      )
    );

    setPriceVehicle(null);
  } catch {
    alert("Unable to update price.");
  }
}
  return (
    <div className="rounded-md border border-ink/10 bg-white p-4">

      <div className="flex items-center justify-between">

        <div className="flex gap-2">

          <button
            onClick={() => {
              resetForm();
              setTab("list");
            }}
            className={`px-3 py-1 font-bold ${
              tab === "list" ? "bg-ivory" : ""
            }`}
          >
            My Vehicles
          </button>

          <button
            onClick={() => {
              resetForm();
              setTab("add");
            }}
            className={`px-3 py-1 font-bold ${
              tab === "add" ? "bg-ivory" : ""
            }`}
          >
            {editingId ? "Edit Vehicle" : "Add Vehicle"}
          </button>

        </div>

      </div>
            {tab === "list" ? (
        <div className="mt-5 grid gap-4">
          {vehicles.length === 0 ? (
            <p className="text-center text-stone">
              No vehicles added yet.
            </p>
          ) : (
            vehicles.map((vehicle: any) => (
              <div
                key={vehicle.id}
                className="rounded-lg border border-ink/10 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                  <div>

                    <h3 className="text-xl font-black">
                      {vehicle.vehicleType}
                    </h3>

                    <p className="mt-1 text-sm text-stone">
                      Registration :
                      <span className="font-semibold">
                        {" "}
                        {vehicle.registrationNo}
                      </span>
                    </p>

                    <p className="text-sm text-stone">
                      Driver :
                      <span className="font-semibold">
                        {" "}
                        {vehicle.driverName}
                      </span>
                    </p>

                    <p className="text-sm text-stone">
                      Phone :
                      <span className="font-semibold">
                        {" "}
                        {vehicle.driverPhone}
                      </span>
                    </p>

                    <p className="text-sm text-stone">
                      Seats :
                      <span className="font-semibold">
                        {" "}
                        {vehicle.seatingCapacity}
                      </span>
                    </p>

                    <div className="mt-3">

                      {vehicle.status === "APPROVED" ? (
                        <>

                          <p className="text-green-700 font-bold">
                            ₹{vehicle.pricePerDay ?? "--"} / Day
                          </p>

                          <p className="text-green-700 font-bold">
                            ₹{vehicle.pricePerKm ?? "--"} / KM
                          </p>

                        </>
                      ) : (
                        <p className="font-semibold text-amber-600">
                          Waiting for Super Admin Approval & Pricing
                        </p>
                      )}

                    </div>

                  </div>

                  <div className="flex flex-col gap-2">

                    <span
                      className={`rounded-md px-3 py-2 text-center font-bold ${
                        vehicle.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : vehicle.status === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {vehicle.status}
                    </span>

                    <button
                      onClick={() => editVehicle(vehicle)}
                      className="rounded-md bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
                    >
                      Edit Details
                    </button>

                    <button
                      onClick={() => deleteVehicle(vehicle.id)}
                      className="rounded-md bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700"
                    >
                      Delete Vehicle
                    </button>

                    {vehicle.status === "APPROVED" && (
                      <button
  onClick={() => {
    setPriceVehicle(vehicle);
    setPricePerDay(String(vehicle.pricePerDay ?? ""));
    setPricePerKm(String(vehicle.pricePerKm ?? ""));
  }}
  className="rounded-md bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700"
>
  Request Price Update
</button>
                    )}

                  </div>

                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <form
          onSubmit={submit}
          className="mt-5 grid gap-3"
        >
                    <label className="grid gap-1 text-sm">
            Vehicle Type
            <select
              required
              value={form.vehicleType}
              onChange={(e) =>
                setForm({
                  ...form,
                  vehicleType: e.target.value,
                })
              }
              className="rounded-md border px-3 py-2"
            >
              <option value="">Select Vehicle Type</option>
              <option>Bike</option>
              <option>Scooter</option>
              <option>Hatchback</option>
              <option>Sedan</option>
              <option>SUV</option>
              <option>MUV</option>
              <option>Luxury Car</option>
              <option>Tempo Traveller</option>
              <option>Mini Bus</option>
              <option>Bus</option>
              <option>Pickup</option>
              <option>Truck</option>
            </select>
          </label>

          <label className="grid gap-1 text-sm">
            Seating Capacity
            <input
              required
              type="number"
              value={form.seatingCapacity}
              onChange={(e) =>
                setForm({
                  ...form,
                  seatingCapacity: Number(e.target.value),
                })
              }
              className="rounded-md border px-3 py-2"
            />
          </label>

          <label className="grid gap-1 text-sm">
            Driver Name
            <input
              required
              value={form.driverName ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  driverName: e.target.value,
                })
              }
              className="rounded-md border px-3 py-2"
            />
          </label>

          <label className="grid gap-1 text-sm">
            Driver Phone
            <input
              required
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="9876543210"
              value={form.driverPhone ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  driverPhone: e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10),
                })
              }
              className="rounded-md border px-3 py-2"
            />
          </label>

          <label className="grid gap-1 text-sm">
            Registration Number
            <input
              required
              placeholder="KA19AB1234"
              maxLength={10}
              value={form.registrationNo ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  registrationNo: e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "")
                    .slice(0, 10),
                })
              }
              className="rounded-md border px-3 py-2"
            />
          </label>

          <div className="flex gap-3 pt-2">

            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-ink px-5 py-2 font-black text-white"
            >
              {loading
                ? "Saving..."
                : editingId
                ? "Update Vehicle"
                : "Add Vehicle"}
            </button>

            <button
              type="button"
              onClick={() => {
                resetForm();
                setTab("list");
              }}
              className="rounded-md border px-5 py-2"
            >
              Cancel
            </button>

          </div>

          {error && (
            <p className="font-semibold text-red-600">
              {error}
            </p>
          )}
               </form>
      )}

      {priceVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[400px] rounded-lg bg-white p-6 shadow-xl">

            <h2 className="mb-5 text-2xl font-black">
              Update Vehicle Price
            </h2>

            <label className="mb-4 block">
              <p className="mb-1 font-semibold">
                Price Per Day
              </p>

              <input
                type="number"
                value={pricePerDay}
                onChange={(e) =>
                  setPricePerDay(e.target.value)
                }
                className="w-full rounded-md border px-3 py-2"
              />
            </label>

            <label className="mb-5 block">
              <p className="mb-1 font-semibold">
                Price Per KM
              </p>

              <input
                type="number"
                value={pricePerKm}
                onChange={(e) =>
                  setPricePerKm(e.target.value)
                }
                className="w-full rounded-md border px-3 py-2"
              />
            </label>

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setPriceVehicle(null)}
                className="rounded-md border px-4 py-2"
              >
                Cancel
              </button>

              <button
                onClick={updatePrice}
                className="rounded-md bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700"
              >
                Update Price
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}