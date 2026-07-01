"use client";

type Props = {
  itemId: string;
};

export default function RemoveFromBucketButton({
  itemId,
}: Props) {
  async function removeItem() {
    const res = await fetch("/api/bucket/remove", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        itemId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    window.location.reload();
  }

  return (
    <button
      onClick={removeItem}
      className="rounded-md bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700"
    >
      Remove
    </button>
  );
}