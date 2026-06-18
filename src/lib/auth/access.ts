import type { UserRole } from "@prisma/client";

import {
  getLoginPortalConfig,
  type LoginPortal,
} from "@/lib/auth/login-config";

export function roleMatchesPortal(
  role: UserRole,
  portal: LoginPortal,
): boolean {
  const config = getLoginPortalConfig(portal);
  return config.allowedRoles.includes(role);
}

export function getPortalMismatchMessage(portal: LoginPortal): string {
  const config = getLoginPortalConfig(portal);

  switch (portal) {
    case "admin":
      return "This email is not registered as a Super Admin. Contact platform support.";
    case "resort-owner":
      return "This email is not registered as a resort owner. Use customer login or wait for admin approval.";
    case "vehicle-owner":
      return "This email is not registered as a vehicle owner. Use customer login or wait for admin approval.";
    default:
      return `This account cannot sign in through ${config.eyebrow.toLowerCase()}.`;
  }
}

export function getRequiredRoleForPath(pathname: string): UserRole | null {
  if (pathname.startsWith("/admin")) {
    return "SUPER_ADMIN";
  }

  if (pathname.startsWith("/resort-owner")) {
    return "RESORT_OWNER";
  }

  if (pathname.startsWith("/vehicle-owner")) {
    return "VEHICLE_OWNER";
  }

  return null;
}

export function getLoginPathForRole(role: UserRole): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "/login/admin";
    case "RESORT_OWNER":
      return "/login/resort-owner";
    case "VEHICLE_OWNER":
      return "/login/vehicle-owner";
    default:
      return "/login";
  }
}
