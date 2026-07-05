"use client";

import { useState } from "react";
import { Building2, CheckCircle2, Copy, Loader2, UserPlus } from "lucide-react";

import PhoneInput from "@/components/PhoneInput";
import { isValidImageUrl } from "@/lib/placeholders";

type Props = {
  destinationOptions: { id: string; name: string; slug: string }[];
};

export default function AdminAddResort({ destinationOptions }: Props) {
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerPhoneError, setOwnerPhoneError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [acRooms, setAcRooms] = useState(0);
  const [nonAcRooms, setNonAcRooms] = useState(0);
  const [nonAcPrice, setNonAcPrice] = useState(0);
  const [acPrice, setAcPrice] = useState(0);
  const [amenities, setAmenities] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUrlError, setImageUrlError] = useState<string | null>(null);
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    resortOwnerId: string;
    tempPassword: string;
  } | null>(null);
  const [copied, setCopied] = useState<"id" | "password" | "both" | null>(null);

  function resetForm() {
    setOwnerName("");
    setOwnerPhone("");
    setName("");
    setDescription("");
    setAddress("");
    setAcRooms(0);
    setNonAcRooms(0);
    setNonAcPrice(0);
    setAcPrice(0);
    setAmenities("");
    setDestinationId("");
    setImageUrl("");
    setGoogleMapsLink("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    if (imageUrl && !isValidImageUrl(imageUrl)) {
      setError("Please enter a valid direct image URL. Search engine image links (Bing, Google Images, Yahoo, etc.) are not supported.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/add-resort", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerName,
          ownerPhone,
          name,
          description,
          address,
          acRooms,
          nonAcRooms,
          nonAcPrice: nonAcPrice || undefined,
          acPrice: acPrice || undefined,
          amenities,
          destinationId,
          imageUrl: imageUrl || undefined,
          googleMapsLink,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to add resort.");
        return;
      }

      setResult({
        resortOwnerId: data.resortOwnerId,
        tempPassword: data.tempPassword,
      });
      resetForm();
    } catch {
      setError("Unable to add resort.");
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
        <Building2 className="h-6 w-6 text-coral" />
        <h2 className="text-2xl font-black">Add Resort</h2>
      </div>
      <p className="mt-1 text-sm font-semibold text-stone">
        Create a resort listing and auto-generate a Resort Owner account.
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
              Resort Details
            </legend>
            <div className="grid gap-4">
              <label className="grid gap-1.5 text-sm font-black">
                Resort Name
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-md border border-ink/15 bg-white px-3 text-base outline-none focus:border-coral"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-black">
                Destination
                <select
                  required
                  value={destinationId}
                  onChange={(e) => setDestinationId(e.target.value)}
                  className="h-11 rounded-md border border-ink/15 bg-white px-3 text-base outline-none focus:border-coral"
                >
                  <option value="">Select destination</option>
                  {destinationOptions.map((d) => (
                    <option key={d.slug} value={d.slug}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5 text-sm font-black">
                Description
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-24 rounded-md border border-ink/15 bg-white px-3 py-2 text-base outline-none focus:border-coral"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-black">
                Address
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-11 rounded-md border border-ink/15 bg-white px-3 text-base outline-none focus:border-coral"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-black">
                  Number of AC Rooms
                  <input
                    type="number"
                    required
                    min={0}
                    value={acRooms}
                    onChange={(e) => setAcRooms(Number(e.target.value))}
                    className="h-11 rounded-md border border-ink/15 bg-white px-3 text-base outline-none focus:border-coral"
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-black">
                  Number of Non AC Rooms
                  <input
                    type="number"
                    required
                    min={0}
                    value={nonAcRooms}
                    onChange={(e) => setNonAcRooms(Number(e.target.value))}
                    className="h-11 rounded-md border border-ink/15 bg-white px-3 text-base outline-none focus:border-coral"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-black">
                  AC Room Price
                  <input
                    type="number"
                    min={0}
                    value={acPrice}
                    onChange={(e) => setAcPrice(Number(e.target.value))}
                    className="h-11 rounded-md border border-ink/15 bg-white px-3 text-base outline-none focus:border-coral"
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-black">
                  Non AC Room Price
                  <input
                    type="number"
                    min={0}
                    value={nonAcPrice}
                    onChange={(e) => setNonAcPrice(Number(e.target.value))}
                    className="h-11 rounded-md border border-ink/15 bg-white px-3 text-base outline-none focus:border-coral"
                  />
                </label>
              </div>

              <label className="grid gap-1.5 text-sm font-black">
                Amenities
                <input
                  placeholder="WiFi, Parking, Swimming Pool..."
                  value={amenities}
                  onChange={(e) => setAmenities(e.target.value)}
                  className="h-11 rounded-md border border-ink/15 bg-white px-3 text-base outline-none focus:border-coral"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-black">
                Image URL
                <input
                  placeholder="https://example.com/resort-image.jpg"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImageUrlError(null);
                  }}
                  className="h-11 rounded-md border border-ink/15 bg-white px-3 text-base outline-none focus:border-coral"
                />
                {imageUrlError ? (
                  <p className="text-xs font-semibold text-coral">{imageUrlError}</p>
                ) : null}
              </label>

              <label className="grid gap-1.5 text-sm font-black">
                Google Maps Location Link
                <input
                  placeholder="https://maps.google.com/?q=..."
                  value={googleMapsLink}
                  onChange={(e) => setGoogleMapsLink(e.target.value)}
                  className="h-11 rounded-md border border-ink/15 bg-white px-3 text-base outline-none focus:border-coral"
                />
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
            Add Resort
          </button>
        </form>
      ) : (
        <div className="mt-5 rounded-md border border-mint/30 bg-mint/10 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-mint" />
            <p className="font-black text-mint">Resort created successfully</p>
          </div>
          <div className="mt-3 grid gap-2 text-sm">
            <div className="rounded-md bg-white p-3 font-mono font-bold">
              <span className="text-stone">Resort Owner ID: </span>
              {result.resortOwnerId}
            </div>
            <div className="rounded-md bg-white p-3 font-mono font-bold">
              <span className="text-stone">Temporary Password: </span>
              {result.tempPassword}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => copy(result.resortOwnerId, "id")}
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
                  `Resort Owner ID: ${result.resortOwnerId}\nTemporary Password: ${result.tempPassword}`,
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
            Add another resort
          </button>
        </div>
      )}
    </section>
  );
}
