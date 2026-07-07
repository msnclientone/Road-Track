"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Copy,
  ImagePlus,
  Loader2,
  Search,
  Trash2,
  UserPlus,
} from "lucide-react";
import Image from "next/image";
import PhoneInput from "@/components/PhoneInput";

type Props = {
  destinationOptions: { id: string; name: string; slug: string }[];
};

export default function AdminAddResort({ destinationOptions }: Props) {
  const [ownerAssignmentMode, setOwnerAssignmentMode] = useState<"create" | "assign">("create");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerPhoneError, setOwnerPhoneError] = useState<string | null>(null);
  const [ownerSearchQuery, setOwnerSearchQuery] = useState("");
  const [ownerSearchResults, setOwnerSearchResults] = useState<any[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<any | null>(null);
  const [searching, setSearching] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [acRooms, setAcRooms] = useState(0);
  const [nonAcRooms, setNonAcRooms] = useState(0);
  const [amenities, setAmenities] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [additionalImageUrls, setAdditionalImageUrls] = useState<string[]>([""]);
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const [nonAcPrice, setNonAcPrice] = useState(0);
  const [acPrice, setAcPrice] = useState(0);
  const [fileInputs, setFileInputs] = useState<(File | null)[]>([null]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    resortOwnerId: string;
    tempPassword: string;
  } | null>(null);
  const [copied, setCopied] = useState<"id" | "password" | "both" | null>(null);

  useEffect(() => {
    if (ownerAssignmentMode !== "assign" || ownerSearchQuery.trim().length < 2) {
      setOwnerSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/admin/owners/search?q=${encodeURIComponent(ownerSearchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setOwnerSearchResults(data.owners ?? []);
        }
      } catch {
        // ignore
      }
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [ownerSearchQuery, ownerAssignmentMode]);

  function resetForm() {
    setOwnerAssignmentMode("create");
    setOwnerName("");
    setOwnerPhone("");
    setOwnerSearchQuery("");
    setOwnerSearchResults([]);
    setSelectedOwner(null);
    setName("");
    setDescription("");
    setAddress("");
    setAcRooms(0);
    setNonAcRooms(0);
    setAmenities("");
    setDestinationId("");
    setImageUrl("");
    setAdditionalImageUrls([""]);
    setGoogleMapsLink("");
    setNonAcPrice(0);
    setAcPrice(0);
    setFileInputs([null]);
    setImagePreview(null);
  }

  function selectOwner(owner: any) {
    setSelectedOwner(owner);
    setOwnerSearchQuery("");
    setOwnerSearchResults([]);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    if (ownerAssignmentMode === "assign") {
      if (!selectedOwner) {
        setError("Search and select an existing owner.");
        setLoading(false);
        return;
      }
    } else {
      if (ownerPhoneError) {
        setError("Please fix the phone number errors before submitting.");
        setLoading(false);
        return;
      }
    }

    try {
      const body = {
        ...(ownerAssignmentMode === "assign"
          ? { existingOwnerId: selectedOwner.id }
          : { ownerName, ownerPhone }),
        name,
        description,
        address: address || undefined,
        acRooms,
        nonAcRooms,
        amenities: amenities || undefined,
        destinationId: destinationId || null,
        imageUrl: imageUrl || undefined,
        additionalImageUrls: additionalImageUrls.filter(Boolean),
        googleMapsLink: googleMapsLink || undefined,
        nonAcPrice: nonAcPrice || undefined,
        acPrice: acPrice || undefined,
      };

      const res = await fetch("/api/admin/add-resort", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
              Owner Assignment
            </legend>
            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-bold">
                <input
                  type="radio"
                  name="ownerAssignment"
                  checked={ownerAssignmentMode === "create"}
                  onChange={() => {
                    setOwnerAssignmentMode("create");
                    setSelectedOwner(null);
                    setOwnerSearchResults([]);
                  }}
                  className="size-4 accent-coral"
                />
                Create New Owner
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-bold">
                <input
                  type="radio"
                  name="ownerAssignment"
                  checked={ownerAssignmentMode === "assign"}
                  onChange={() => {
                    setOwnerAssignmentMode("assign");
                    setOwnerSearchResults([]);
                  }}
                  className="size-4 accent-coral"
                />
                Assign to Existing Owner
              </label>
            </div>
          </fieldset>

          {ownerAssignmentMode === "create" ? (
            <fieldset className="rounded-md border border-ink/10 bg-ivory/50 p-4">
              <legend className="px-2 text-sm font-black text-stone">
                New Owner Details
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
          ) : (
            <fieldset className="rounded-md border border-ink/10 bg-ivory/50 p-4">
              <legend className="px-2 text-sm font-black text-stone">
                Existing Owner
              </legend>
              {selectedOwner ? (
                <div className="space-y-3">
                  <div className="rounded-md border border-mint/30 bg-mint/10 p-3">
                    <p className="font-bold">{selectedOwner.name}</p>
                    <p className="text-sm text-stone">
                      Login ID: {selectedOwner.vehicleOwnerId || selectedOwner.resortOwnerId || "—"}
                    </p>
                    <p className="text-sm text-stone">Phone: {selectedOwner.phone}</p>
                    <p className="text-sm text-stone">Email: {selectedOwner.email}</p>
                    <p className="text-sm text-stone">
                      Vehicles Owned: {selectedOwner._count?.vehicles ?? 0} | Resorts Owned: {selectedOwner._count?.resorts ?? 0}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedOwner(null)}
                    className="text-sm font-bold text-coral hover:underline"
                  >
                    Change owner
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="grid gap-1.5 text-sm font-black">
                    <span>Search Existing Owner</span>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-stone" />
                      <input
                        value={ownerSearchQuery}
                        onChange={(e) => setOwnerSearchQuery(e.target.value)}
                        placeholder="Search by name, ID, phone, or email..."
                        className="h-11 w-full rounded-md border border-ink/15 bg-white pl-10 pr-3 text-base outline-none focus:border-coral"
                      />
                      {searching && (
                        <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-stone" />
                      )}
                    </div>
                  </label>
                  {ownerSearchResults.length > 0 && (
                    <div className="max-h-48 overflow-y-auto rounded-md border border-ink/10 bg-white">
                      {ownerSearchResults.map((owner) => (
                        <button
                          key={owner.id}
                          type="button"
                          onClick={() => selectOwner(owner)}
                          className="flex w-full items-start gap-3 border-b border-ink/5 p-3 text-left transition hover:bg-ivory last:border-b-0"
                        >
                          <div className="flex-1">
                            <p className="font-bold">{owner.name}</p>
                            <p className="text-xs text-stone">
                              {owner.vehicleOwnerId && `Vehicle: ${owner.vehicleOwnerId}`}
                              {owner.resortOwnerId && ` Resort: ${owner.resortOwnerId}`}
                            </p>
                            <p className="text-xs text-stone">{owner.phone} | {owner.email}</p>
                            <p className="text-xs text-stone">
                              Vehicles: {owner._count?.vehicles ?? 0} | Resorts: {owner._count?.resorts ?? 0}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {ownerSearchQuery.trim().length >= 2 && ownerSearchResults.length === 0 && !searching && (
                    <p className="text-sm text-stone">No owners found.</p>
                  )}
                </div>
              )}
            </fieldset>
          )}

          <fieldset className="rounded-md border border-ink/10 bg-ivory/50 p-4">
            <legend className="px-2 text-sm font-black text-stone">
              Resort Details
            </legend>
            <div className="grid gap-4">
              <label className="grid gap-1.5 text-sm font-black">
                Resort Name
                <input
                  required
                  placeholder="e.g. Mountain View Resort"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-md border border-ink/15 bg-white px-3 text-base outline-none focus:border-coral"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-black">
                Description
                <textarea
                  required
                  maxLength={2000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-[100px] resize-y rounded-md border border-ink/15 bg-white px-3 py-2 text-base outline-none focus:border-coral"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-black">
                Address
                <textarea
                  maxLength={500}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-[60px] resize-y rounded-md border border-ink/15 bg-white px-3 py-2 text-base outline-none focus:border-coral"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-black">
                  AC Rooms
                  <input
                    type="number"
                    min={0}
                    value={acRooms}
                    onChange={(e) => setAcRooms(Number(e.target.value))}
                    className="h-11 rounded-md border border-ink/15 bg-white px-3 text-base outline-none focus:border-coral"
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-black">
                  Non-AC Rooms
                  <input
                    type="number"
                    min={0}
                    value={nonAcRooms}
                    onChange={(e) => setNonAcRooms(Number(e.target.value))}
                    className="h-11 rounded-md border border-ink/15 bg-white px-3 text-base outline-none focus:border-coral"
                  />
                </label>
              </div>

              <label className="grid gap-1.5 text-sm font-black">
                Amenities (comma-separated)
                <input
                  placeholder="e.g. Parking, WiFi, Swimming Pool"
                  value={amenities}
                  onChange={(e) => setAmenities(e.target.value)}
                  className="h-11 rounded-md border border-ink/15 bg-white px-3 text-base outline-none focus:border-coral"
                />
              </label>

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

              <label className="grid gap-1.5 text-sm font-black">
                Main Image URL (optional)
                <input
                  type="url"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="h-11 rounded-md border border-ink/15 bg-white px-3 text-base outline-none focus:border-coral"
                />
              </label>
              {imageUrl && (
                <div className="relative aspect-video w-full max-w-[300px] overflow-hidden rounded-md border border-ink/10">
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                    onError={() => setImagePreview(null)}
                    onLoad={() => setImagePreview(imageUrl)}
                  />
                </div>
              )}

              <fieldset className="rounded-md border border-ink/10 bg-ivory/50 p-4">
                <legend className="px-2 text-sm font-black text-stone">
                  Additional Images (optional, max 5)
                </legend>
                <div className="grid gap-3">
                  {additionalImageUrls.map((url, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder={`Additional image ${index + 1}`}
                        value={url}
                        onChange={(e) => {
                          const next = [...additionalImageUrls];
                          next[index] = e.target.value;
                          setAdditionalImageUrls(next);
                        }}
                        className="h-11 flex-1 rounded-md border border-ink/15 bg-white px-3 text-base outline-none focus:border-coral"
                      />
                      {additionalImageUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setAdditionalImageUrls(additionalImageUrls.filter((_, i) => i !== index))
                          }
                          className="text-coral hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {additionalImageUrls.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setAdditionalImageUrls([...additionalImageUrls, ""])}
                      className="inline-flex h-10 items-center gap-2 self-start rounded-md border border-ink/15 px-3 text-sm font-black transition hover:border-coral hover:text-coral"
                    >
                      <ImagePlus className="h-4 w-4" />
                      Add Another Image
                    </button>
                  )}
                </div>
              </fieldset>

              <label className="grid gap-1.5 text-sm font-black">
                Google Maps Link (optional)
                <input
                  type="url"
                  placeholder="https://maps.google.com/..."
                  value={googleMapsLink}
                  onChange={(e) => setGoogleMapsLink(e.target.value)}
                  className="h-11 rounded-md border border-ink/15 bg-white px-3 text-base outline-none focus:border-coral"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-black">
                  Non-AC Price (₹)
                  <input
                    type="number"
                    min={0}
                    value={nonAcPrice}
                    onChange={(e) => setNonAcPrice(Number(e.target.value))}
                    className="h-11 rounded-md border border-ink/15 bg-white px-3 text-base outline-none focus:border-coral"
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-black">
                  AC Price (₹)
                  <input
                    type="number"
                    min={0}
                    value={acPrice}
                    onChange={(e) => setAcPrice(Number(e.target.value))}
                    className="h-11 rounded-md border border-ink/15 bg-white px-3 text-base outline-none focus:border-coral"
                  />
                </label>
              </div>
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
            <p className="font-black text-mint">
              {result.resortOwnerId ? "Resort and owner created successfully" : "Resort added successfully"}
            </p>
          </div>
          {result.resortOwnerId && (
            <>
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
            </>
          )}
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
