"use client";

import { memo, useState } from "react";

type Props = {
  resortId?: string;
  vehicleId?: string;
  alreadyInBucket?: boolean;
};

function AddToBucketButton({
  resortId,
  vehicleId,
  alreadyInBucket = false,
}: Props) {
  const [added, setAdded] = useState(alreadyInBucket);
  const [loading, setLoading] = useState(false);

  async function addToBucket() {
    if (added) return;

    setLoading(true);

    const res = await fetch("/api/bucket/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resortId,
        vehicleId,
      }),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      alert(data.error);
      return;
    }

    setAdded(true);
  }

  return (
    <button
      onClick={addToBucket}
      disabled={loading || added}
      className={`w-full rounded-lg px-4 py-3 font-black transition ${
        added
          ? "bg-green-600 text-white cursor-default"
          : "bg-emerald-600 text-white hover:bg-emerald-700"
      }`}
    >
      {loading
        ? "Adding..."
        : added
        ? "✓ Added to Bucket"
        : "Add to Bucket"}
    </button>
  );
}

export default memo(AddToBucketButton);