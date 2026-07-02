"use client";

import { useEffect, useRef } from "react";

const SESSION_KEY = "rt_visit_counted";

export default function VisitorTracker() {
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    called.current = true;

    fetch("/api/analytics/view", { method: "POST" })
      .then(() => {
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          // storage unavailable
        }
      })
      .catch(() => {});
  }, []);

  return null;
}