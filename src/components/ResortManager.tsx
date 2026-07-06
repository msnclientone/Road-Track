"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResortManager({
  initialResorts,
}: {
  initialResorts: any[];
}) {
  const router = useRouter();

  const [resorts, setResorts] = useState<any[]>(
    initialResorts || []
  );

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

  router.refresh();

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

  router.refresh();

  setEditingAvailabilityId(null);
  setAvailableAcRooms("");
  setAvailableNonAcRooms("");

  alert("Availability updated.");
}
  return (
    <div className="rounded-md border border-ink/10 bg-white p-4">
      <div className="grid gap-4">
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
                    {r.destination?.name ?? r.destinationId}
                  </p>

                  <p className="text-sm text-stone">
                    {r.address ?? "Address not set"}
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
                  </div>
                </div>

                <div className="flex flex-col gap-2">
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
                      const res = await fetch("/api/partner/resort/delete", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ resortId: r.id }),
                      });
                      const data = await res.json();
                      if (!res.ok) { alert(data.error); return; }
                      setResorts((old) => old.filter((x) => x.id !== r.id));
                      router.refresh();
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
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
