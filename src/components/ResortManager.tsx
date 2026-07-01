"use client";

import { useState } from "react";
import { destinations } from "@/lib/data";

type ResortInput = {
  name: string;
  description: string;
  address?: string;
  acRooms: number;
  nonAcRooms: number;
  amenities?: string | string[];
  destinationId: string;
  imageUrl?: string;
  googleMapsLink?: string;
};

export default function ResortManager({
  initialResorts,
}: {
  initialResorts: any[];
}) {
  const [tab, setTab] = useState<"list" | "add">("list");

  const [resorts, setResorts] = useState<any[]>(
    initialResorts || []
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingPriceId, setEditingPriceId] =
  useState<string | null>(null);

const [nonAcPrice, setNonAcPrice] =
  useState("");

const [acPrice, setAcPrice] =
  useState("");
const [editingAvailabilityId, setEditingAvailabilityId] =
  useState<string | null>(null);

const [availableAcRooms, setAvailableAcRooms] =
  useState("");

const [availableNonAcRooms, setAvailableNonAcRooms] =
  useState("");
  const [form, setForm] =
    useState<ResortInput>({
      name: "",
      description: "",
      address: "",
      acRooms: 0,
      nonAcRooms: 0,
      amenities: "",
      destinationId: "",
      imageUrl: "",
      googleMapsLink: "",
    });

  async function submit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        "/api/partner/resort/create",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok)
        throw new Error(data.error);

      setResorts((old) => [
        data.resort,
        ...old,
      ]);

      setForm({
        name: "",
        description: "",
        address: "",
        acRooms: 0,
        nonAcRooms: 0,
        amenities: "",
        destinationId: "",
        imageUrl: "",
        googleMapsLink: "",
      });

      setTab("list");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function savePrices() {
  const res = await fetch(
    "/api/partner/resort/update-price",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resortId: editingPriceId,
        nonAcPrice: Number(nonAcPrice),
        acPrice: Number(acPrice),
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    alert(data.error);
    return;
  }

  setResorts((old) =>
    old.map((r) =>
      r.id === editingPriceId
        ? data.resort
        : r
    )
  );

  setEditingPriceId(null);
  setNonAcPrice("");
  setAcPrice("");

  alert("Prices updated successfully.");
}
async function saveAvailability() {
  const res = await fetch(
    "/api/partner/resort/update-availability",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resortId: editingAvailabilityId,
        availableAcRooms: Number(
          availableAcRooms
        ),
        availableNonAcRooms: Number(
          availableNonAcRooms
        ),
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    alert(data.error);
    return;
  }

  setResorts((old) =>
    old.map((r) =>
      r.id === editingAvailabilityId
        ? data.resort
        : r
    )
  );

  setEditingAvailabilityId(null);
  setAvailableAcRooms("");
  setAvailableNonAcRooms("");

  alert("Availability updated.");
}
  return (
  <div className="rounded-md border border-ink/10 bg-white p-4">
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        <button
          onClick={() => setTab("list")}
          className={`px-3 py-1 font-bold ${
            tab === "list" ? "bg-ivory" : ""
          }`}
        >
          My Resorts
        </button>

        <button
          onClick={() => setTab("add")}
          className={`px-3 py-1 font-bold ${
            tab === "add" ? "bg-ivory" : ""
          }`}
        >
          Add Resort
        </button>
      </div>
    </div>

    {tab === "list" ? (
      <div className="mt-4 grid gap-4">
        {resorts.length === 0 ? (
          <p className="text-sm text-stone">
            No resorts yet.
          </p>
        ) : (
          resorts.map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-ink/10 p-5"
            >
              <div className="flex items-start justify-between gap-4">

                <div>
                  {r.imageUrl && (
                    <div className="mb-3">
                      <img
                        src={r.imageUrl}
                        alt={r.name}
                        className="h-20 w-28 rounded-lg object-cover"
                      />
                    </div>
                  )}

                  <h3 className="text-xl font-black">
                    {r.name}
                  </h3>

                  <p className="text-sm text-stone">
                    {r.destination?.name ??
                      r.destinationId}
                  </p>

                  <p className="text-sm text-stone">
                    {r.address ??
                      "Address not set"}
                  </p>

                  <div className="mt-3 space-y-1">

                    <p className="font-semibold">
                      Non AC Price :
                      <span className="text-coral">
                        {" "}
                        ₹{r.priceMin}
                      </span>
                    </p>

                    <p className="font-semibold">
                      AC Price :
                      <span className="text-coral">
                        {" "}
                        ₹{r.priceMax}
                      </span>
                    </p>

                    <p className="text-sm text-stone">
                      Status :
                      <span className="font-bold">
                        {" "}
                        {r.status}
                      </span>
                    </p>

                  </div>

                </div>

                <div className="flex flex-col gap-2">

  {r.status === "APPROVED" && (
    <>
      <button
        onClick={() => {
          setEditingPriceId(r.id);
          setNonAcPrice(String(r.priceMin));
          setAcPrice(String(r.priceMax));
        }}
        className="rounded-md bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700"
      >
        Update Prices
      </button>
<button
  onClick={() => {
    setEditingAvailabilityId(r.id);
    setAvailableAcRooms(String(r.availableAcRooms));
    setAvailableNonAcRooms(String(r.availableNonAcRooms));
  }}
  className="rounded-md bg-blue-600 px-4 py-2 font-bold text-white"
>
  Update Availability
</button>

{editingAvailabilityId === r.id && (
  <div className="mt-3 rounded-md border p-3">
    <input
      type="number"
      value={availableAcRooms}
      onChange={(e) => setAvailableAcRooms(e.target.value)}
      className="mb-2 w-full rounded border px-3 py-2"
      placeholder="Available AC Rooms"
    />

    <input
      type="number"
      value={availableNonAcRooms}
      onChange={(e) => setAvailableNonAcRooms(e.target.value)}
      className="mb-2 w-full rounded border px-3 py-2"
      placeholder="Available Non AC Rooms"
    />

    <div className="flex gap-2">
      <button
        onClick={saveAvailability}
        className="rounded bg-blue-600 px-3 py-2 text-white"
      >
        Save Availability
      </button>

      <button
        onClick={() => setEditingAvailabilityId(null)}
        className="rounded border px-3 py-2"
      >
        Cancel
      </button>
    </div>
  </div>
)}

<button
  onClick={async () => {
    if (!confirm("Delete this resort?")) return;

    const res = await fetch(
      "/api/partner/resort/delete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resortId: r.id,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    setResorts((old) =>
      old.filter((x) => x.id !== r.id)
    );
  }}
  className="rounded-md bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700"
>
  Delete Resort
</button>

      {editingPriceId === r.id && (
        <div className="mt-3 rounded-md border p-3">

          <input
            type="number"
            value={nonAcPrice}
            onChange={(e) => setNonAcPrice(e.target.value)}
            className="mb-2 w-full rounded border px-3 py-2"
            placeholder="Non AC Price"
          />

          <input
            type="number"
            value={acPrice}
            onChange={(e) => setAcPrice(e.target.value)}
            className="mb-2 w-full rounded border px-3 py-2"
            placeholder="AC Price"
          />

          <div className="flex gap-2">
            <button
              onClick={savePrices}
              className="rounded bg-green-600 px-3 py-2 text-white"
            >
              Save
            </button>

            <button
              onClick={() => setEditingPriceId(null)}
              className="rounded border px-3 py-2"
            >
              Cancel
            </button>
          </div>

        </div>
      )}
    </>
  )}

</div>

              </div>
            </div>
          ))
        )}
      </div>
    ) : (<form
  onSubmit={submit}
  className="mt-4 grid gap-3"
>
  <label className="grid gap-1 text-sm">
    Resort Name
    <input
      required
      value={form.name}
      onChange={(e) =>
        setForm({
          ...form,
          name: e.target.value,
        })
      }
      className="rounded-md border px-3 py-2"
    />
  </label>

  <label className="grid gap-1 text-sm">
    Destination
    <select
      required
      value={form.destinationId}
      onChange={(e) =>
        setForm({
          ...form,
          destinationId: e.target.value,
        })
      }
      className="rounded-md border px-3 py-2"
    >
      <option value="">
        Select destination
      </option>

      {destinations.map((d) => (
        <option
          key={d.slug}
          value={d.slug}
        >
          {d.name}
        </option>
      ))}
    </select>
  </label>

  <label className="grid gap-1 text-sm">
    Description
    <textarea
      required
      value={form.description}
      onChange={(e) =>
        setForm({
          ...form,
          description: e.target.value,
        })
      }
      className="rounded-md border px-3 py-2"
    />
  </label>

  <label className="grid gap-1 text-sm">
    Address
    <input
      value={form.address ?? ""}
      onChange={(e) =>
        setForm({
          ...form,
          address: e.target.value,
        })
      }
      className="rounded-md border px-3 py-2"
    />
  </label>

  <label className="grid gap-1 text-sm">
    Number of AC Rooms
    <input
      type="number"
      required
      min={0}
      value={form.acRooms}
      onChange={(e) =>
        setForm({
          ...form,
          acRooms: Number(e.target.value),
        })
      }
      className="rounded-md border px-3 py-2"
    />
  </label>

  <label className="grid gap-1 text-sm">
    Number of Non AC Rooms
    <input
      type="number"
      required
      min={0}
      value={form.nonAcRooms}
      onChange={(e) =>
        setForm({
          ...form,
          nonAcRooms: Number(e.target.value),
        })
      }
      className="rounded-md border px-3 py-2"
    />
  </label>

  <label className="grid gap-1 text-sm">
    Amenities
    <input
      placeholder="WiFi, Parking, Swimming Pool..."
      value={
        typeof form.amenities === "string"
          ? form.amenities
          : ""
      }
      onChange={(e) =>
        setForm({
          ...form,
          amenities: e.target.value,
        })
      }
      className="rounded-md border px-3 py-2"
    />
  </label>

  <label className="grid gap-1 text-sm">
    Image URL
    <input
      placeholder="https://example.com/resort-image.jpg"
      value={form.imageUrl ?? ""}
      onChange={(e) =>
        setForm({
          ...form,
          imageUrl: e.target.value,
        })
      }
      className="rounded-md border px-3 py-2"
    />
  </label>

  <label className="grid gap-1 text-sm">
    Google Maps Location Link (optional)
    <input
      placeholder="https://maps.google.com/?q=..."
      value={form.googleMapsLink ?? ""}
      onChange={(e) =>
        setForm({
          ...form,
          googleMapsLink: e.target.value,
        })
      }
      className="rounded-md border px-3 py-2"
    />
  </label>

  <div className="rounded-md bg-yellow-100 p-3 text-sm font-semibold text-yellow-800">
    Initial room prices will be assigned by the Super Admin after approval.
    Once approved, you can update prices anytime.
  </div>

  <div className="flex gap-2">
    <button
      disabled={loading}
      className="rounded-md bg-ink px-4 py-2 font-black text-white"
    >
      {loading
        ? "Saving..."
        : "Save Resort"}
    </button>

    <button
      type="button"
      onClick={() =>
        setTab("list")
      }
      className="rounded-md border px-4 py-2"
    >
      Cancel
    </button>
  </div>

  {error && (
    <p className="text-red-600 font-semibold">
      {error}
    </p>
  )}
</form>
      )}
    </div>
  );
}
