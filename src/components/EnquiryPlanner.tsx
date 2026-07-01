"use client";

import {
  CalendarDays,
  Loader2,
  Send,
  Users,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { buildLeadMessage, buildWhatsAppUrl } from "@/lib/utils";

const labelClass = "grid gap-1 text-[11px] font-semibold";
const inputClass =
  "h-9 rounded-md border border-white/15 bg-white/10 px-2.5 text-xs text-white outline-none transition focus:border-coral";
const iconInputClass =
  "h-9 w-full rounded-md border border-white/15 bg-white/10 px-2.5 pl-8 text-xs text-white outline-none transition focus:border-coral";
const iconClass =
  "pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-white/55";

export function EnquiryPlanner() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [people, setPeople] = useState(4);
  const [days, setDays] = useState(2);
  const [vehicleRequired, setVehicleRequired] = useState(true);
  const [resortRequired, setResortRequired] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [plannerData, setPlannerData] = useState<any>(null);
  const selectedResort = plannerData?.items?.find(
  (item: any) => item.resort
)?.resort;

const selectedVehicle = plannerData?.items?.find(
  (item: any) => item.vehicle
)?.vehicle;
const resortCost =
  selectedResort && resortRequired
    ? selectedResort.priceMin * days
    : 0;

const vehicleCost =
  selectedVehicle && vehicleRequired
    ? selectedVehicle.pricePerDay * days
    : 0;

const totalCost = resortCost + vehicleCost;

const perHeadCost =
  people > 0 ? Math.ceil(totalCost / people) : 0;
useEffect(() => {
  async function loadPlanner() {
    const res = await fetch("/api/planner");

    if (!res.ok) return;

    const data = await res.json();

    setPlannerData(data);
  }

  loadPlanner();
}, []);

  const leadMessage = `
*ROAD TRACK TRIP ENQUIRY*

 Name: ${name}
 Phone: ${phone}

 Destination: ${
  selectedResort?.destination?.name ?? "Udupi"
}

 Resort: ${
  selectedResort?.name ?? "Not Selected"
}

 Vehicle: ${
  selectedVehicle?.vehicleType ?? "Not Selected"
}

 People: ${people}
 Days: ${days}

 Resort Cost: ₹${resortCost}
 Vehicle Cost: ₹${vehicleCost}

 Total Trip Cost: ₹${totalCost}

`;

  async function saveLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    if (!name.trim() || !phone.trim()) {
      setNotice("Enter name and phone before saving the enquiry.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  name,
  phone,
  destination: selectedResort?.destination?.name ?? "",
  destinationSlug: "",
  people,
  date,
  vehicleRequired,
  resortRequired,
  vehicle: selectedVehicle?.vehicleType,
  hotel: selectedResort?.name,
}),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(error?.error ?? "Could not save lead");
      }

      const result = (await response.json()) as { leadId: string };
      setNotice(`Lead ${result.leadId} saved. Opening WhatsApp.`);
      window.location.href = buildWhatsAppUrl(leadMessage);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Lead could not be saved. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={saveLead}
      className="grid w-full max-w-[540px] gap-2.5 rounded-lg border border-white/15 bg-ink/80 p-2.5 text-ivory shadow-2xl shadow-black/30 backdrop-blur"
    >
      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className={labelClass}>
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          Phone
          <input
  type="tel"
  value={phone}
  onChange={(event) =>
    setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))
  }
  placeholder="9876543210"
  maxLength={10}
  pattern="[0-9]{10}"
  required
  className={inputClass}
/>
        </label>


        <label className={labelClass}>
          Travel date
          <span className="relative">
            <CalendarDays className={iconClass} />
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={iconInputClass}
            />
          </span>
        </label>

        <label className={labelClass}>
          People
          <span className="relative">
            <Users className={iconClass} />
            <input
              type="number"
              min={1}
              max={80}
              value={people}
              onChange={(event) => setPeople(Number(event.target.value))}
              className={iconInputClass}
            />
          </span>
        </label>

        <label className={labelClass}>
          Days
          <input
            type="number"
            min={1}
            max={14}
            value={days}
            onChange={(event) => setDays(Number(event.target.value))}
            className={inputClass}
          />
        </label>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className="flex items-center gap-2 rounded-md border border-white/10 bg-black/20 p-2 text-[11px] font-semibold text-white/80">
          <input
            type="checkbox"
            checked={vehicleRequired}
            onChange={(event) => setVehicleRequired(event.target.checked)}
            className="size-3.5 accent-coral"
          />
          Vehicle required
        </label>

        <label className="flex items-center gap-2 rounded-md border border-white/10 bg-black/20 p-2 text-[11px] font-semibold text-white/80">
          <input
            type="checkbox"
            checked={resortRequired}
            onChange={(event) => setResortRequired(event.target.checked)}
            className="size-3.5 accent-coral"
          />
          Resort required
        </label>
      </div>

      <div className="grid gap-2.5 rounded-md border border-white/15 bg-white/[0.06] p-2.5">
        <div>
          <button
            type="submit"
            className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-coral px-3 text-xs font-bold text-ink transition hover:bg-coral/90"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Save and open WhatsApp
          </button>
        </div>

        {notice ? <p className="text-xs text-amber">{notice}</p> : null}
      {plannerData && (
  <div className="mt-4 rounded-lg border bg-white/10 p-4 text-sm">

    <h2 className="mb-4 text-lg font-black">
      Trip Summary
    </h2>

    {selectedResort && (
      <div className="mb-3">
        <p className="font-bold">🏨 Resort</p>
        <p>{selectedResort.name}</p>
      </div>
    )}

    {selectedVehicle && (
      <div className="mb-3">
        <p className="font-bold">🚗 Vehicle</p>
        <p>{selectedVehicle.vehicleType}</p>
      </div>
    )}

    <hr className="my-3 border-white/20" />

    <div className="space-y-2">

      <div className="flex justify-between">
        <span>Resort Cost</span>
        <span>₹{resortCost}</span>
      </div>

      <div className="flex justify-between">
        <span>Vehicle Cost</span>
        <span>₹{vehicleCost}</span>
      </div>

      <div className="flex justify-between text-lg font-black text-coral">
        <span>Total Trip Cost</span>
        <span>₹{totalCost}</span>
      </div>

      <div className="flex justify-between text-lg font-black text-mint">
        <span>Per Head Cost</span>
        <span>₹{perHeadCost}</span>
      </div>
      <hr className="my-3 border-white/20" />

<div className="rounded-md bg-coral/10 p-3">
  <p className="font-bold text-coral">
    Estimated for {people} people · {days} day{days > 1 ? "s" : ""}
  </p>
</div>

    </div>

  </div>
)}
      </div>
    </form>
  );
}