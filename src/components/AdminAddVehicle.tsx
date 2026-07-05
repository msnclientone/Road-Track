"use client";

import { useState } from "react";
import { Car, CheckCircle2, Copy, Loader2, UserPlus } from "lucide-react";

import PhoneInput from "@/components/PhoneInput";

type Props = {
  destinationOptions: { id: string; name: string; slug: string }[];
};

export default function AdminAddVehicle({ destinationOptions }: Props) {
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerPhoneError, setOwnerPhoneError] = useState<string | null>(null);
  const [vehicleType, setVehicleType] = useState("");
  const [seatingCapacity, setSeatingCapacity] = useState(4);
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [driverPhoneError, setDriverPhoneError] = useState<string | null>(null);
  const [registrationNo, setRegistrationNo] = useState("");
  const [pricePerKm, setPricePerKm] = useState(0);
  const [pricePerDay, setPricePerDay] = useState(0);
  const [destinationId, setDestinationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    vehicleOwnerId: string;
    tempPassword: string;
  } | null>(null);
  const [copied, setCopied] = useState<"id" | "password" | "both" | null>(null);

  function resetForm() {
    setOwnerName("");
    setOwnerPhone("");
    setVehicleType("");
    setSeatingCapacity(4);
    setDriverName("");
    setDriverPhone("");
    setRegistrationNo("");
    setPricePerKm(0);
    setPricePerDay(0);
    setDestinationId("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    if (ownerPhoneError || driverPhoneError) {
      setError("Please fix the phone number errors before submitting.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/add-vehicle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerName,
          ownerPhone,
          vehicleType,
          seatingCapacity,
          driverName,
          driverPhone,
          registrationNo,
          pricePerKm: pricePerKm || undefined,
          pricePerDay: pricePerDay || undefined,
          destinationId: destinationId || null,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to add vehicle.");
        return;
      }

      setResult({
        vehicleOwnerId: data.vehicleOwnerId,
        tempPassword: data.tempPassword,
      });
      resetForm();
    } catch {
      setError("Unable to add vehicle.");
    } finally {
      setLoading(false);
    }
  }

  async function copy(text: string, type: "id" | "password" | "both") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // fallback
    }
  }

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <Car className="h-6 w-6 text-coral" />
        <h2 className="text-2xl font-black">Add Vehicle</h2>
      </div>
      <p className="mt-1 text-sm font-semibold text-stone">
        Create a vehicle listing and auto-generate a Vehicle Owner account.
      </p>

      {!result ? (
        <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
          <fieldset className="rounded-md border border-ink/10 bg-ivory/50 p-4">
            <legend className="px-2 text-sm font-black text-stone">
              Owner Details
            </legend>
            <div className="grid gap-4">
              <label className="grid gap-1.5 text-sm font-black">
                Owner Name
                <input
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                  className="h-11 rounded-md border border-ink/15 bg-white px-3 text-base outline-none focus:border-coral"
                />
              </label>
              <PhoneInput
                value={ownerPhone}
                onChange={setOwnerPhone}
                onError={setOwnerPhoneError}
                required
                label="Phone Number"
                labelClassName="text-sm font-black"
                wrapperClassName="grid gap-1.5"
              />
            </div>
          </fieldset>

          <fieldset className="rounded-md border border-ink/10 bg-ivory/50 p-4">
            <legend className="px-2 text-sm font-black text-stone">
              Vehicle Details
            </legend>
            <div className="grid gap-4">
              <label className="grid gap-1.5 text-sm font-black">
                Vehicle Type
                <select
                  required
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="h-11 rounded-md border border-ink/15 bg-white px-3 text-base outline-none focus:border-coral"
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

              <label className="grid gap-1.5 text-sm font-black">
                Seating Capacity
                <input
                  required
                  type="number"
                  value={seatingCapacity}
                  onChange={(e) => setSeatingCapacity(Number(e.target.value))}
                  className="h-11 rounded-md border border-ink/15 bg-white px-3 text-base outline-none focus:border-coral"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-black">
                Driver Name
                <input
                  required
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="h-11 rounded-md border border-ink/15 bg-white px-3 text-base outline-none focus:border-coral"
                />
              </label>

              <PhoneInput
                value={driverPhone}
                onChange={setDriverPhone}
                onError={setDriverPhoneError}
                required
                label="Driver Phone"
                labelClassName="text-sm font-black"
                wrapperClassName="grid gap-1.5"
              />

              <label className="grid gap-1.5 text-sm font-black">
                Registration Number
                <input
                  required
                  placeholder="KA19AB1234"
                  maxLength={10}
                  value={registrationNo}
                  onChange={(e) =>
                    setRegistrationNo(
                      e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10),
                    )
                  }
                  className="h-11 rounded-md border border-ink/15 bg-white px-3 text-base outline-none focus:border-coral"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-black">
                  Price Per Km
                  <input
                    type="number"
                    min={0}
                    value={pricePerKm}
                    onChange={(e) => setPricePerKm(Number(e.target.value))}
                    className="h-11 rounded-md border border-ink/15 bg-white px-3 text-base outline-none focus:border-coral"
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-black">
                  Price Per Day
                  <input
                    type="number"
                    min={0}
                    value={pricePerDay}
                    onChange={(e) => setPricePerDay(Number(e.target.value))}
                    className="h-11 rounded-md border border-ink/15 bg-white px-3 text-base outline-none focus:border-coral"
                  />
                </label>
              </div>

              <label className="grid gap-1.5 text-sm font-black">
                Destination
                <select
                  value={destinationId}
                  onChange={(e) => setDestinationId(e.target.value)}
                  className="h-11 rounded-md border border-ink/15 bg-white px-3 text-base outline-none focus:border-coral"
                >
                  <option value="">Select Destination</option>
                  {destinationOptions.map((dest) => (
                    <option key={dest.id} value={dest.id}>
                      {dest.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </fieldset>

          {error ? (
            <p className="rounded-md bg-coral/15 p-3 text-sm font-bold text-stone">
              {error}
            </p>
          ) : null}

          <button
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 font-black text-white transition hover:bg-stone disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <UserPlus className="h-5 w-5" />
            )}
            Add Vehicle
          </button>
        </form>
      ) : (
        <div className="mt-5 rounded-md border border-mint/30 bg-mint/10 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-mint" />
            <p className="font-black text-mint">Vehicle created successfully</p>
          </div>
          <div className="mt-3 grid gap-2 text-sm">
            <div className="rounded-md bg-white p-3 font-mono font-bold">
              <span className="text-stone">Vehicle Owner ID: </span>
              {result.vehicleOwnerId}
            </div>
            <div className="rounded-md bg-white p-3 font-mono font-bold">
              <span className="text-stone">Temporary Password: </span>
              {result.tempPassword}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => copy(result.vehicleOwnerId, "id")}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 font-black text-white transition hover:bg-stone"
            >
              <Copy className="h-4 w-4" />
              {copied === "id" ? "Copied!" : "Copy ID"}
            </button>
            <button
              onClick={() => copy(result.tempPassword, "password")}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 font-black text-white transition hover:bg-stone"
            >
              <Copy className="h-4 w-4" />
              {copied === "password" ? "Copied!" : "Copy Password"}
            </button>
            <button
              onClick={() =>
                copy(
                  `Vehicle Owner ID: ${result.vehicleOwnerId}\nTemporary Password: ${result.tempPassword}`,
                  "both",
                )
              }
              className="inline-flex h-10 items-center gap-2 rounded-md border border-ink/15 px-4 font-black transition hover:border-coral hover:text-coral"
            >
              <Copy className="h-4 w-4" />
              {copied === "both" ? "Copied!" : "Copy Both"}
            </button>
          </div>
          <button
            onClick={() => setResult(null)}
            className="mt-3 text-sm font-bold text-coral hover:underline"
          >
            Add another vehicle
          </button>
        </div>
      )}
    </section>
  );
}
