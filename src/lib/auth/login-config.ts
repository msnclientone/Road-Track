import type { UserRole } from "@prisma/client";

export type LoginPortal = "customer" | "admin" | "resort-owner" | "vehicle-owner";

export type LoginPortalConfig = {
  portal: LoginPortal;
  path: string;
  allowedRoles: UserRole[];
  redirectTo: string;
  pendingRedirectTo?: string;
  canSelfRegister: boolean;
  eyebrow: string;
  title: string;
  description: string;
  emailPlaceholder: string;
};

export const LOGIN_PORTALS: Record<LoginPortal, LoginPortalConfig> = {
  customer: {
    portal: "customer",
    path: "/login",
    allowedRoles: ["CUSTOMER"],
    redirectTo: "/",
    canSelfRegister: true,
    eyebrow: "Customer Login",
    title: "Sign in with your email and password.",
    description:
      "Customers can browse without login. Create an account once, then sign in with your credentials for enquiries and faster bookings.",
    emailPlaceholder: "customer@example.com",
  },
  admin: {
    portal: "admin",
    path: "/login/admin",
    allowedRoles: ["SUPER_ADMIN"],
    redirectTo: "/admin",
    canSelfRegister: false,
    eyebrow: "Super Admin Login",
    title: "Platform command center access.",
    description:
      "Sign in with your Super Admin email and password. If no admin exists yet, use Sign up to create the first account.",
    emailPlaceholder: "admin@roadtrack.in",
  },
  "resort-owner": {
    portal: "resort-owner",
    path: "/login/resort-owner",
    allowedRoles: ["RESORT_OWNER"],
    redirectTo: "/resort-owner",
    pendingRedirectTo: "/resort-owner/pending",
    canSelfRegister: true,
    eyebrow: "Resort Owner Login",
    title: "Manage your resort listings and leads.",
    description:
      "Resort owner accounts are created after Super Admin approval. You can request access by signing up; a Super Admin will approve your account.",
    emailPlaceholder: "owner@yourresort.com",
  },
  "vehicle-owner": {
    portal: "vehicle-owner",
    path: "/login/vehicle-owner",
    allowedRoles: ["VEHICLE_OWNER"],
    redirectTo: "/vehicle-owner",
    pendingRedirectTo: "/vehicle-owner/pending",
    canSelfRegister: true,
    eyebrow: "Vehicle Owner Login",
    title: "Manage fleet availability and assigned leads.",
    description:
      "Vehicle owner accounts are created after Super Admin approval. You can request access by signing up; a Super Admin will approve your account.",
    emailPlaceholder: "owner@yourfleet.com",
  },
};

export function getLoginPortalConfig(portal: LoginPortal): LoginPortalConfig {
  return LOGIN_PORTALS[portal];
}

export function getLoginPortalFromPath(pathname: string): LoginPortal | null {
  if (pathname === "/login") {
    return "customer";
  }

  if (pathname === "/login/admin") {
    return "admin";
  }

  if (pathname === "/login/resort-owner") {
    return "resort-owner";
  }

  if (pathname === "/login/vehicle-owner") {
    return "vehicle-owner";
  }

  return null;
}

export function getRedirectForUser(
  portal: LoginPortal,
  partnerStatus: string | null | undefined,
): string {
  const config = LOGIN_PORTALS[portal];

  if (
    config.pendingRedirectTo &&
    partnerStatus &&
    partnerStatus !== "APPROVED"
  ) {
    return config.pendingRedirectTo;
  }

  return config.redirectTo;
}
