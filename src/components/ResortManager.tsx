"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Loader2, X } from "lucide-react";
import { isValidImageUrl, isGoogleDriveUrl, convertToDirectImageUrl } from "@/lib/placeholders";

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

  const [editingImagesId, setEditingImagesId] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [savingImages, setSavingImages] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

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

  function openImageEditor(r: any) {
    const urls = r.media?.map((m: any) => m.url) ?? [];
    if (urls.length === 0 && r.imageUrl) urls.push(r.imageUrl);
    setImageUrls(urls.length > 0 ? urls : [""]);
    setEditingImagesId(r.id);
    setImageError(null);
  }

  async function saveImages() {
    const validUrls = imageUrls.filter((u) => u.trim());
    if (validUrls.length === 0) {
      setImageError("At least one image is required.");
      return;
    }

    for (const url of validUrls) {
      const resolved = isGoogleDriveUrl(url) ? convertToDirectImageUrl(url) : url;
      if (!isValidImageUrl(resolved)) {
        setImageError(`Invalid image URL: ${url}`);
        return;
      }
    }

    setSavingImages(true);
    setImageError(null);

    try {
      const res = await fetch("/api/partner/resort/update-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resortId: editingImagesId, imageUrls: validUrls }),
      });
      const data = await res.json();
      if (!res.ok) {
        setImageError(data.error ?? "Failed to update images.");
        return;
      }

      setResorts((old) =>
        old.map((r) =>
          r.id === editingImagesId
            ? { ...r, media: validUrls.map((url, i) => ({ url, order: i })), imageUrl: validUrls[0] }
            : r
        )
      );

      router.refresh();
      setEditingImagesId(null);
      alert("Images updated successfully.");
    } catch {
      setImageError("Unable to update images.");
    } finally {
      setSavingImages(false);
    }
  }

  function updateImageUrl(index: number, value: string) {
    setImageUrls((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function removeImageUrl(index: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }

  function addImageUrl() {
    setImageUrls((prev) => [...prev, ""]);
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

                  <button
                    onClick={() => openImageEditor(r)}
                    className="rounded-md bg-purple-600 px-4 py-2 font-bold text-white hover:bg-purple-700"
                  >
                    Edit Images
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

              {editingImagesId === r.id && (
                <div className="mt-4 rounded-md border border-ink/10 p-4">
                  <h4 className="mb-3 font-black">Manage Images</h4>

                  {r.media && r.media.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {r.media.map((m: any, i: number) => (
                        <div key={i} className="relative h-16 w-20 overflow-hidden rounded-md">
                          <img
                            src={m.url}
                            alt={`${r.name} ${i + 1}`}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=150&fit=crop";
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => updateImageUrl(index, e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="h-10 flex-1 rounded-md border border-ink/15 bg-white px-3 text-sm outline-none focus:border-coral"
                        />
                        {imageUrls.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImageUrl(index)}
                            className="flex h-10 w-10 items-center justify-center rounded-md border border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addImageUrl}
                    disabled={imageUrls.length >= 6}
                    className="mt-2 text-sm font-bold text-coral hover:underline disabled:opacity-40"
                  >
                    + Add another image
                  </button>

                  {imageError && (
                    <p className="mt-2 rounded-md bg-coral/15 p-2 text-sm font-bold text-stone">
                      {imageError}
                    </p>
                  )}

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={saveImages}
                      disabled={savingImages}
                      className="inline-flex h-10 items-center gap-2 rounded-md bg-purple-600 px-4 font-bold text-white hover:bg-purple-700 disabled:opacity-60"
                    >
                      {savingImages ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      Save Images
                    </button>
                    <button
                      onClick={() => setEditingImagesId(null)}
                      className="rounded-md border border-ink/15 px-4 font-bold hover:bg-ivory"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
