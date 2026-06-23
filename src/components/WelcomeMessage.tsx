"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2 } from "lucide-react";

type WelcomeMessageProps = {
  userName?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
};

export default function WelcomeMessage({ userName, userEmail, userRole }: WelcomeMessageProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if user just logged in (via session storage flag)
    const justLoggedIn = sessionStorage.getItem("justLoggedIn");
    if (justLoggedIn) {
      setVisible(true);
      sessionStorage.removeItem("justLoggedIn");
    }
  }, []);

  if (!visible) return null;

  const roleMessages: { [key: string]: string } = {
    SUPER_ADMIN: "Welcome to the Road Track Admin Panel!",
    RESORT_OWNER: "Welcome to your Resort Owner Dashboard!",
    VEHICLE_OWNER: "Welcome to your Vehicle Owner Dashboard!",
    GUIDE: "Welcome to the Road Track Guide Portal!",
    CUSTOMER: "Welcome to Road Track - Let's plan your perfect trip!",
  };

  const roleDescriptions: { [key: string]: string } = {
    SUPER_ADMIN: "Manage partners, approvals, and view all approved listings.",
    RESORT_OWNER: "Manage your resort listings, pending approvals, and bookings.",
    VEHICLE_OWNER: "Manage your vehicle listings, pending approvals, and bookings.",
    GUIDE: "Connect with customers and manage your guide services.",
    CUSTOMER: "Browse destinations, resorts, and vehicles to plan your next adventure.",
  };

  const role = userRole || "CUSTOMER";
  const title = roleMessages[role] || "Welcome to Road Track!";
  const description = roleDescriptions[role] || "Thank you for using Road Track.";

  return (
    <div className="fixed inset-x-0 top-24 z-40 mx-auto max-w-2xl px-5">
      <div className="rounded-lg border border-emerald-200 bg-gradient-to-r from-mint/10 to-emerald-50 p-5 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="mt-1 h-6 w-6 flex-shrink-0 text-emerald-600" />
            <div>
              <h3 className="text-lg font-black text-emerald-900">{title}</h3>
              <p className="mt-2 text-sm text-emerald-800">{description}</p>
              {userName && (
                <p className="mt-3 text-xs font-bold text-emerald-700">
                  Logged in as: <span className="font-black">{userName}</span>
                  {userEmail && <> ({userEmail})</>}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="text-emerald-600 hover:text-emerald-900 transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
