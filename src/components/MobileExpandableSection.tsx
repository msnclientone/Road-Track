"use client";

import { Children, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode[];
  initialCount: number;
  buttonLabel: string;
};

export default function MobileExpandableSection({
  children,
  initialCount,
  buttonLabel,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const items = Children.toArray(children);
  const visible = expanded ? items : items.slice(0, initialCount);
  const hasMore = items.length > initialCount;

  return (
    <>
      {visible.map((child, i) => (
        <div key={i}>{child}</div>
      ))}
      {hasMore && (
        <div className="max-md:block md:hidden">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-4 w-full rounded-xl border border-ink/10 bg-white py-3 text-center text-sm font-bold text-coral transition hover:bg-coral hover:text-white"
          >
            {expanded ? "View Less" : buttonLabel}
          </button>
        </div>
      )}
    </>
  );
}
