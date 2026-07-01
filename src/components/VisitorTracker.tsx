"use client";

import { useEffect } from "react";

export default function VisitorTracker() {
  useEffect(() => {
    fetch("/api/analytics/view", {
      method: "POST",
    }).catch(() => {});
  }, []);

  return null;
}