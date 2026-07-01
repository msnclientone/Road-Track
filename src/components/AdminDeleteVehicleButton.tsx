"use client";

import { useRouter } from "next/navigation";

export default function AdminDeleteVehicleButton({
  vehicleId,
}: {
  vehicleId: string;
}) {
  const router = useRouter();

  async function deleteVehicle() {
    const confirmed = window.confirm(
      "Delete this vehicle permanently?"
    );

    if (!confirmed) return;

    const res = await fetch("/api/admin/vehicles/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  id: vehicleId,
}),
    });

    if (!res.ok) {
      alert("Failed to delete vehicle.");
      return;
    }

    alert("Vehicle deleted successfully.");

    router.refresh();
  }

  return (
    <button
      onClick={deleteVehicle}
      className="rounded-lg bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700"
    >
      Delete
    </button>
  );
}