import type { LeadStatus as DashboardLeadStatus } from "@/lib/data";

export function formatPanelDate(date: Date | string | null | undefined): string {
  if (!date) {
    return "Flexible";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function toDashboardLeadStatus(status: string): DashboardLeadStatus {
  switch (status) {
    case "CONTACTED":
      return "Contacted";
    case "CONFIRMED":
      return "Confirmed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return "New";
  }
}

export function getWhatsAppPhone(phone: string | null | undefined): string {
  const digits = phone?.replace(/\D/g, "") ?? "";

  if (!digits) {
    return "";
  }

  if (digits.length === 10) {
    return `91${digits}`;
  }

  return digits;
}

export function jsonStringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

