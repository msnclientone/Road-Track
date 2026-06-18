import { roadTrackPhone } from "@/lib/data";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function calculateQuote(input: {
  people: number;
  days: number;
  vehicleRate: number;
  roomRate: number;
  rooms: number;
}) {
  const basePlanningFee = 1200;
  const vehicleTotal = input.vehicleRate * input.days;
  const roomTotal = input.roomRate * input.rooms * input.days;
  const serviceBuffer = Math.ceil((vehicleTotal + roomTotal) * 0.08);

  return basePlanningFee + vehicleTotal + roomTotal + serviceBuffer;
}

export function buildWhatsAppUrl(message: string, phone = roadTrackPhone) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildLeadMessage(input: {
  name: string;
  phone: string;
  destination: string;
  date: string;
  people: number;
  vehicleRequired: boolean;
  resortRequired: boolean;
  quote?: number;
}) {
  return [
    "Hello Road Track,",
    "",
    "I am interested in:",
    `Destination: ${input.destination}`,
    `Travel Date: ${input.date || "Flexible"}`,
    `No of People: ${input.people}`,
    `Vehicle Required: ${input.vehicleRequired ? "yes" : "no"}`,
    `Hotel Required: ${input.resortRequired ? "yes" : "no"}`,
    input.quote ? `Approx Quote: ${formatCurrency(input.quote)}` : "",
    "",
    "Please contact me.",
    `Name: ${input.name || "Guest"}`,
    `Phone: ${input.phone || "Not provided"}`,
  ]
    .filter(Boolean)
    .join("\n");
}
