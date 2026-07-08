"use client";

import { useState } from "react";

type Props = {
  text: string;
};

export default function ExpandableDescription({ text }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <p
        className={`mt-4 text-base leading-7 text-stone sm:mt-6 sm:text-lg sm:leading-8 ${
          !expanded ? "max-md:line-clamp-3" : ""
        }`}
      >
        {text}
      </p>
      {text.length > 150 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="md:hidden mt-2 text-sm font-bold text-coral hover:underline"
        >
          {expanded ? "Show Less" : "Read More"}
        </button>
      )}
    </div>
  );
}
