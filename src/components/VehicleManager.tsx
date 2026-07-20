"use client";

import { useState } from "react";
import Image from "next/image";

import PhoneInput from "@/components/PhoneInput";

type VehicleInput = {
  id?: string;
  vehicleType: string;
  seatingCapacity: number;
  driverName?: string;
  driverPhone?: string;
  registrationNo?: string;
  destinationId?: string;
  heroImageUrl?: string;
};

export default function VehicleManager({
  initialVehicles,
  destinationOptions = [],
}: {
  initialVehicles: any[];
  destinationOptions?: { id: string; name: string }[];
}) {
  const [vehicles, setVehicles] = useState(initialVehicles || []);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<VehicleInput>({
    vehicleType: "",
    seatingCapacity: 4,
    driverName: "",
    driverPhone: "",
    registrationNo: "",
    destinationId: "",
    heroImageUrl: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [driverPhoneError, setDriverPhoneError] = useState<string | null>(null);
  const [priceVehicle, setPriceVehicle] = useState<any>(null);
const [pricePerDay, setPricePerDay] = useState("");
const [pricePerKm, setPricePerKm] = useState("");
const [minPriceVehicle, setMinPriceVehicle] = useState<any>(null);
const [minPriceValue, setMinPriceValue] = useState("");
const [minKmVehicle, setMinKmVehicle] = useState<any>(null);
const [minKmValue, setMinKmValue] = useState("");

  function resetForm() {
    setEditingId(null);

    setForm({
      vehicleType: "",
      seatingCapacity: 4,
      driverName: "",
      driverPhone: "",
      registrationNo: "",
      destinationId: "",
      heroImageUrl: "",
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError(null);

    if (driverPhoneError) {
      setError("Please fix the phone number errors before submitting.");
      setLoading(false);
      return;
    }

    try {
      const endpoint = "/api/partner/vehicle/update";

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
      destinationId: vehicle.destinationId ?? "",
      heroImageUrl: vehicle.heroImageUrl ?? "",
    });
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
  } catch (e) {
    console.error("Update Price error:", e);
    alert("Unable to update price.");
  }
}
async function updateMinPrice() {
  try {
    const res = await fetch("/api/partner/vehicle/update-price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicleId: minPriceVehicle.id,
        pricePerDay: minPriceVehicle.pricePerDay ?? 0,
        pricePerKm: minPriceVehicle.pricePerKm ?? 0,
        minimumPrice: minPriceValue ? Number(minPriceValue) : null,
        minimumKm: minPriceVehicle.minimumKm ?? null,
      }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error); return; }
    setVehicles((old: any[]) =>
      old.map((v) => v.id === minPriceVehicle.id ? data.vehicle : v)
    );
    setMinPriceVehicle(null);
  } catch (e) {
    console.error("Update Minimum Price error:", e);
    alert("Unable to update minimum price.");
  }
}
async function updateMinKm() {
  try {
    const res = await fetch("/api/partner/vehicle/update-price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicleId: minKmVehicle.id,
        pricePerDay: minKmVehicle.pricePerDay ?? 0,
        pricePerKm: minKmVehicle.pricePerKm ?? 0,
        minimumKm: minKmValue ? Number(minKmValue) : null,
        minimumPrice: minKmVehicle.minimumPrice ?? null,
      }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error); return; }
    setVehicles((old: any[]) =>
      old.map((v) => v.id === minKmVehicle.id ? data.vehicle : v)
    );
    setMinKmVehicle(null);
  } catch (e) {
    console.error("Update Minimum KM error:", e);
    alert("Unable to update minimum KM.");
  }
}
  return (
    <div className="rounded-md border border-ink/10 bg-white p-4">

      {editingId && (
        <form
          onSubmit={submit}
          className="mb-6 grid gap-3 rounded-lg border border-blue-200 bg-blue-50 p-5"
        >
          <h3 className="text-lg font-black">Edit Vehicle</h3>

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

          <PhoneInput
            value={form.driverPhone ?? ""}
            onChange={(val) => setForm({ ...form, driverPhone: val })}
            onError={setDriverPhoneError}
            required
            label="Driver Phone"
            labelClassName="text-sm"
            wrapperClassName="grid gap-1"
          />

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

          <label className="grid gap-1 text-sm">
            Destination
            <select
              value={form.destinationId ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  destinationId: e.target.value,
                })
              }
              className="rounded-md border px-3 py-2"
            >
              <option value="">
                Select Destination
              </option>
              {destinationOptions.map((dest) => (
                <option
                  key={dest.id}
                  value={dest.id}
                >
                  {dest.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm">
            Hero Image URL (optional)
            <input
              type="url"
              placeholder="https://... or Google Drive share link"
              value={form.heroImageUrl ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  heroImageUrl: e.target.value,
                })
              }
              className="rounded-md border px-3 py-2"
            />
          </label>
          {form.heroImageUrl && (
            <div className="relative aspect-video w-full max-w-[300px] overflow-hidden rounded-md border border-ink/10">
              <Image
                src={form.heroImageUrl}
                alt="Vehicle preview"
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-ink px-5 py-2 font-black text-white"
            >
              {loading ? "Saving..." : "Update Vehicle"}
            </button>

            <button
              type="button"
              onClick={resetForm}
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

      <div className="grid gap-4">
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
                    Destination :
                    <span className="font-semibold">
                      {" "}
                      {vehicle.destination?.name ?? "Not Assigned"}
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
                    <p className="font-bold text-green-700">
                      ₹{vehicle.pricePerDay ?? "--"} / Day
                    </p>
                    <p className="font-bold text-green-700">
                      ₹{vehicle.pricePerKm ?? "--"} / KM
                    </p>
                    {vehicle.minimumPrice != null && (
                      <p className="mt-1 text-sm font-semibold text-stone">
                        Min Charge: ₹{vehicle.minimumPrice}
                      </p>
                    )}
                    {vehicle.minimumKm != null && (
                      <p className="text-sm font-semibold text-stone">
                        Min KM: {vehicle.minimumKm} KM
                      </p>
                    )}
                  </div>

                </div>

                <div className="flex flex-col gap-2">

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

                  <button
                    onClick={() => {
                      setMinPriceVehicle(vehicle);
                      setMinPriceValue(String(vehicle.minimumPrice ?? ""));
                    }}
                    className="rounded-md bg-ink px-4 py-2 font-bold text-white hover:bg-stone"
                  >
                    Update Minimum Price
                  </button>

                  <button
                    onClick={() => {
                      setMinKmVehicle(vehicle);
                      setMinKmValue(String(vehicle.minimumKm ?? ""));
                    }}
                    className="rounded-md bg-cyan-600 px-4 py-2 font-bold text-white hover:bg-cyan-700"
                  >
                    Update Minimum KM
                  </button>

                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {priceVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[400px] max-md:w-[90vw] rounded-lg bg-white p-6 shadow-xl">

            <h2 className="mb-5 text-2xl max-md:text-xl font-black">
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

      {minPriceVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[400px] max-md:w-[90vw] rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-5 text-2xl max-md:text-xl font-black">Update Minimum Price</h2>

            <label className="mb-5 block">
              <p className="mb-1 font-semibold">Minimum Price (₹)</p>
              <input
                type="number"
                min={0}
                value={minPriceValue}
                onChange={(e) => setMinPriceValue(e.target.value)}
                className="w-full rounded-md border px-3 py-2"
              />
            </label>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setMinPriceVehicle(null)}
                className="rounded-md border px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={updateMinPrice}
                className="rounded-md bg-ink px-4 py-2 font-bold text-white hover:bg-stone"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {minKmVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[400px] max-md:w-[90vw] rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-5 text-2xl max-md:text-xl font-black">Update Minimum KM</h2>

            <label className="mb-5 block">
              <p className="mb-1 font-semibold">Minimum KM (KM)</p>
              <input
                type="number"
                min={0}
                value={minKmValue}
                onChange={(e) => setMinKmValue(e.target.value)}
                className="w-full rounded-md border px-3 py-2"
              />
            </label>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setMinKmVehicle(null)}
                className="rounded-md border px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={updateMinKm}
                className="rounded-md bg-cyan-600 px-4 py-2 font-bold text-white hover:bg-cyan-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}