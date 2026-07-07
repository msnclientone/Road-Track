"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { buildWhatsAppUrl, formatCurrency, maskRegistrationNo } from "@/lib/utils";
import PhoneInput from "@/components/PhoneInput";

type VehicleData = {
  type: "vehicle";
  vehicleId: string;
  vehicleType: string;
  registrationNo: string;
  destinationName: string | null;
  pricePerKm: number | null;
  pricePerDay: number | null;
  minimumPrice: number | null;
  minimumKm: number | null;
};

type ResortData = {
  type: "resort";
  resortId: string;
  resortName: string;
  destinationName: string | null;
  acPrice: number;
  nonAcPrice: number;
};

type Props = VehicleData | ResortData;

export default function EnquiryButton(props: Props) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please fill in your name.");
      return;
    }
    if (!phone.trim() || phoneError) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const endpoint =
      props.type === "vehicle"
        ? "/api/enquiries/vehicle"
        : "/api/enquiries/resort";

    const payload =
      props.type === "vehicle"
        ? { customerName: name.trim(), customerPhone: phone.trim(), vehicleId: props.vehicleId }
        : { customerName: name.trim(), customerPhone: phone.trim(), resortId: props.resortId };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to submit enquiry.");
        setSubmitting(false);
        return;
      }

      const enquiryId: string = data.enquiryId;

      const message =
        props.type === "vehicle"
          ? buildVehicleMessage(props, enquiryId, name.trim(), phone.trim())
          : buildResortMessage(props, enquiryId, name.trim(), phone.trim());

      setShowModal(false);
      setName("");
      setPhone("");

      window.open(buildWhatsAppUrl(message), "_blank", "noreferrer");
    } catch {
      setError("Unable to submit enquiry.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="block w-full rounded-lg bg-coral px-4 py-3 text-center font-black text-ink transition hover:bg-coral/90"
      >
        Enquire on WhatsApp
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => !submitting && setShowModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-black">
              {props.type === "vehicle" ? "Vehicle Enquiry" : "Resort Enquiry"}
            </h3>
            <p className="mt-1 text-sm text-stone">
              Enter your details to receive a detailed quote on WhatsApp.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
              <label className="grid gap-1.5 text-sm font-black">
                Your Name
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-md border border-ink/15 bg-white px-3 text-base outline-none focus:border-coral"
                  placeholder="Enter your name"
                />
              </label>

              <PhoneInput
                value={phone}
                onChange={setPhone}
                onError={setPhoneError}
                required
                label="Phone Number"
                labelClassName="text-sm font-black"
                wrapperClassName="grid gap-1.5"
              />

              {error && (
                <p className="rounded-md bg-coral/15 p-3 text-sm font-bold text-stone">
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="flex-1 rounded-md border border-ink/15 px-4 py-3 font-black transition hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-md bg-coral px-4 py-3 font-black text-ink transition hover:bg-coral/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  ) : (
                    "Submit Enquiry"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function buildVehicleMessage(
  data: VehicleData,
  enquiryId: string,
  name: string,
  phone: string,
): string {
  return [
    "ROADTRACK VEHICLE ENQUIRY",
    "",
    `Enquiry ID: ${enquiryId}`,
    "",
    "----------------------------------------",
    "",
    "Customer Details",
    `Name: ${name}`,
    `Phone: ${phone}`,
    "",
    "----------------------------------------",
    "",
    "Vehicle Details",
    `Vehicle Type: ${data.vehicleType}`,
    `Vehicle ID: ${data.vehicleId}`,
    `Registration: ${maskRegistrationNo(data.registrationNo)}`,
    `Destination: ${data.destinationName ?? "Not Specified"}`,
    "Pricing",
    `Price Per KM: ${data.pricePerKm != null ? formatCurrency(data.pricePerKm) : "Not Set"}`,
    `Price Per Day: ${data.pricePerDay != null ? formatCurrency(data.pricePerDay) : "Not Set"}`,
    `Minimum Charge: ${data.minimumPrice != null ? formatCurrency(data.minimumPrice) : "Not Set"}`,
    `Minimum Distance: ${data.minimumKm != null ? `${data.minimumKm} KM` : "Not Set"}`,
    "",
    "----------------------------------------",
    "",
    "Customer Requirement",
    "Preferred Travel Date (if available): ",
    "",
    'Message: "I am interested in booking this vehicle. Please contact me."',
  ].join("\n");
}

function buildResortMessage(
  data: ResortData,
  enquiryId: string,
  name: string,
  phone: string,
): string {
  return [
    "ROADTRACK RESORT ENQUIRY",
    "",
    `Enquiry ID: ${enquiryId}`,
    "",
    "----------------------------------------",
    "",
    "Customer Details",
    `Name: ${name}`,
    `Phone: ${phone}`,
    "",
    "----------------------------------------",
    "",
    "Resort Details",
    `Resort Name: ${data.resortName}`,
    `Resort ID: ${data.resortId}`,
    `Destination: ${data.destinationName ?? "Not Specified"}`,
    "Room Prices",
    `AC Price: ${formatCurrency(data.acPrice)}`,
    `Non-AC Price: ${formatCurrency(data.nonAcPrice)}`,
    "",
    "----------------------------------------",
    "",
    "Customer Requirement",
    "Preferred Check-in (if available): ",
    "Preferred Check-out (if available): ",
    "",
    'Message: "I am interested in booking this resort. Please contact me."',
  ].join("\n");
}
