"use client";

import { useEffect, useState } from "react";

export default function DestinationManager() {
  const [destinations, setDestinations] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
const [bestTimeToVisit, setBestTimeToVisit] = useState("");
const [estTripCostMin, setEstTripCostMin] = useState("");
const [estTripCostMax, setEstTripCostMax] = useState("");
const [published, setPublished] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);
  const [nearbyDestinationId, setNearbyDestinationId] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  
  async function loadDestinations() {
    const res = await fetch("/api/admin/destinations");
    const data = await res.json();
    setDestinations(data);
  }
async function loadNearbyPlaces() {
  const res = await fetch("/api/admin/nearby-places");
  const data = await res.json();

  setNearbyPlaces(data);
}
function editDestination(destination: any) {
  setEditingId(destination.id);

  setName(destination.name);
  setSlug(destination.slug);
  setDescription(destination.description ?? "");
  setHeroImageUrl(destination.heroImageUrl ?? "");
  setBestTimeToVisit(destination.bestTimeToVisit ?? "");

  setEstTripCostMin(
    destination.estTripCostMin?.toString() ?? ""
  );

  setEstTripCostMax(
    destination.estTripCostMax?.toString() ?? ""
  );

  setPublished(destination.published);
}
  useEffect(() => {
  loadDestinations();
  loadNearbyPlaces();
}, []);
const [editingId, setEditingId] = useState<string | null>(null);

  async function saveDestination() {
    const res = await fetch(
  editingId
    ? `/api/admin/destinations/${editingId}`
    : "/api/admin/destinations",
  {
    method: editingId ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      slug,
      description,
      heroImageUrl,
      bestTimeToVisit,
      estTripCostMin: Number(estTripCostMin),
      estTripCostMax: Number(estTripCostMax),
      published,
    }),
  }
);

    if (!res.ok) {
      alert("Failed");
      return;
    }

    setName("");
    setSlug("");
    setDescription("");
    setHeroImageUrl("");
setBestTimeToVisit("");
setEstTripCostMin("");
setEstTripCostMax("");
setPublished(true);
setEditingId(null);
    loadDestinations();
  }

async function deleteDestination(id: string) {

  const confirmed = window.confirm(
    "Are you sure you want to delete this destination?"
  );

  if (!confirmed) return;

  const res = await fetch(
    `/api/admin/destinations/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    const error = await res.json();

    alert(error.error);

    return;
  }

  loadDestinations();
  loadNearbyPlaces();
}

  async function addNearbyPlace() {
  if (!selectedDestination) return;

  const res = await fetch("/api/admin/nearby-places", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      destinationId: selectedDestination.id,
      nearbyDestinationId,
      distanceKm,
    }),
  });

  if (!res.ok) {
    alert("Failed");
    return;
  }

  setNearbyDestinationId("");
  setDistanceKm("");

  loadNearbyPlaces();
}

async function deleteNearbyPlace(id: string) {
  const confirmed = window.confirm(
    "Delete this nearby place?"
  );

  if (!confirmed) return;

  const res = await fetch(
    `/api/admin/nearby-places/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    alert("Failed to delete.");
    return;
  }

  loadNearbyPlaces();
}

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">

      <h2 className="text-2xl font-black">
        Destination Management
      </h2>

      <div className="mt-6 grid gap-3">

        <input
          placeholder="Destination Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded border p-2"
        />

        <input
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="rounded border p-2"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded border p-2"
        />
        <input
  placeholder="Hero Image URL"
  value={heroImageUrl}
  onChange={(e) => setHeroImageUrl(e.target.value)}
  className="w-full rounded border p-3"
/>

<input
  placeholder="Best Time To Visit"
  value={bestTimeToVisit}
  onChange={(e) => setBestTimeToVisit(e.target.value)}
  className="mt-3 w-full rounded border p-3"
/>

<div className="mt-3 grid grid-cols-2 gap-3">
  <input
    type="number"
    placeholder="Minimum Trip Cost"
    value={estTripCostMin}
    onChange={(e) => setEstTripCostMin(e.target.value)}
    className="rounded border p-3"
  />

  <input
    type="number"
    placeholder="Maximum Trip Cost"
    value={estTripCostMax}
    onChange={(e) => setEstTripCostMax(e.target.value)}
    className="rounded border p-3"
  />
</div>

<label className="mt-3 flex items-center gap-2">
  <input
    type="checkbox"
    checked={published}
    onChange={(e) => setPublished(e.target.checked)}
  />
  Publish this destination
</label>

        <button
  onClick={saveDestination}
  className="rounded bg-coral px-4 py-2 font-bold"
>
  {editingId ? "Update Destination" : "Add Destination"}
</button>

      </div>

      <div className="mt-8 space-y-4">

        {destinations.map((destination) => (

  <div
    key={destination.id}
    className="rounded-lg border p-4"
  >

    <div className="flex items-center justify-between">

      <div>
        <h3 className="text-xl font-black">
          {destination.name}
        </h3>

        <p className="text-sm text-stone">
          {destination.slug}
        </p>
      </div>

      <div className="flex gap-2">
  <button
    onClick={() => editDestination(destination)}
    className="rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
  >
    Edit
  </button>

   <button
    onClick={() => deleteDestination(destination.id)}
    className="rounded bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700"
  >
    Delete
  </button>

  <button
    onClick={() => setSelectedDestination(destination)}
    className="rounded bg-coral px-4 py-2 font-bold text-white"
  >
    Nearby Places
  </button>
</div>

    </div>

    {selectedDestination?.id === destination.id && (

      <div className="mt-6 rounded-lg bg-gray-50 p-4">

        <h4 className="mb-3 font-black">
          Nearby Places
        </h4>

        <select
          value={nearbyDestinationId}
          onChange={(e) => setNearbyDestinationId(e.target.value)}
          className="mb-3 w-full rounded border p-2"
        >
          <option value="">
            Select Nearby Destination
          </option>

          {destinations
            .filter((d) => d.id !== destination.id)
            .map((d) => (

              <option
                key={d.id}
                value={d.id}
              >
                {d.name}
              </option>

          ))}

        </select>

        <input
          type="number"
          placeholder="Distance (KM)"
          value={distanceKm}
          onChange={(e) => setDistanceKm(e.target.value)}
          className="mb-3 w-full rounded border p-2"
        />

       <button
  onClick={addNearbyPlace}
  className="rounded bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700"
>
  Add Nearby Place
</button>

        <div className="mt-5 space-y-2">

          {nearbyPlaces
            .filter(
              (item) =>
                item.destinationId === destination.id
            )
            .map((item) => (

              <div
  key={item.id}
  className="flex items-center justify-between rounded border bg-white p-3"
>
  <div>
    <p className="font-semibold">
      {item.nearbyDestination.name}
    </p>

    <p className="text-sm text-stone">
      {item.distanceKm} km
    </p>
  </div>

  <button
    onClick={() => deleteNearbyPlace(item.id)}
    className="rounded bg-red-600 px-3 py-2 text-sm font-bold text-white hover:bg-red-700"
  >
    Delete
  </button>
</div>

          ))}

        </div>

      </div>

    )}

  </div>

))}

      </div>

    </section>
  );
}