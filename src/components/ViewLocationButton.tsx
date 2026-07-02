"use client";

export default function ViewLocationButton({ href }: { href: string }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        window.open(href, "_blank", "noreferrer");
      }}
      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-coral/40 px-3 py-2 text-sm font-bold text-coral transition hover:bg-coral hover:text-ink"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      View Location
    </button>
  );
}