"use client";

import { useEffect, useState } from "react";
import WelcomeMessage from "@/components/WelcomeMessage";

type User = {
  email: string;
  name?: string | null;
  role?: string;
};

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) setUser(data.user ?? null);
      } catch {
        // ignore
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <WelcomeMessage userName={user?.name} userEmail={user?.email} userRole={user?.role} />
      {children}
    </>
  );
}
