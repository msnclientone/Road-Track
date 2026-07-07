"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { isValidImageUrl, isGoogleDriveUrl, convertToDirectImageUrl } from "@/lib/placeholders";

type Props = {
  resortId: string;
  initialMedia: { url: string }[];
};

export default function AdminResortImageEditor({ resortId, initialMedia }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>(initialMedia.map((m) => m.url));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addUrl() {
    setImageUrls((prev) => [...prev, ""]);
  }

  function updateUrl(index: number, value: string) {
    setImageUrls((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function removeUrl(index: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    const valid = imageUrls.filter((u) => u.trim());
    if (valid.length === 0) {
      setError("At least one image is required.");
      return;
    }

    for (const url of valid) {
      const resolved = isGoogleDriveUrl(url) ? convertToDirectImageUrl(url) : url;
      if (!isValidImageUrl(resolved)) {
        setError(`Invalid image URL: ${url}`);
        return;
      }
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/resort/update-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resortId, imageUrls: valid }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to update images.");
        return;
      }
      router.refresh();
      setOpen(false);
    } catch {
      setError("Unable to update images.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        onClick={() => {
          setImageUrls(initialMedia.map((m) => m.url));
          setOpen(true);
          setError(null);
        }}
        className="rounded-lg bg-purple-600 px-5 py-3 font-bold text-white hover:bg-purple-700"
      >
        Edit Images
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-black">Manage Images</h3>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 hover:bg-ivory"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {initialMedia.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {initialMedia.map((m, i) => (
                  <div key={i} className="relative h-16 w-20 overflow-hidden rounded-md">
                    <img
                      src={m.url}
                      alt={`Image ${i + 1}`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
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
                    onChange={(e) => updateUrl(index, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="h-10 flex-1 rounded-md border border-ink/15 bg-white px-3 text-sm outline-none focus:border-coral"
                  />
                  {imageUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeUrl(index)}
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
              onClick={addUrl}
              disabled={imageUrls.length >= 6}
              className="mt-2 text-sm font-bold text-coral hover:underline disabled:opacity-40"
            >
              + Add another image
            </button>

            {error && (
              <p className="mt-2 rounded-md bg-coral/15 p-2 text-sm font-bold text-stone">
                {error}
              </p>
            )}

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-purple-600 px-4 font-bold text-white hover:bg-purple-700 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save Images
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md border border-ink/15 px-4 font-bold hover:bg-ivory"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
