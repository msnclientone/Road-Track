"use client";

import {
  CalendarDays,
  Hotel,
  Loader2,
  Send,
  Users,
} from "lucide-react";
import { FormEvent, useState } from "react";

import { destinations, vehicles } from "@/lib/data";
import { buildLeadMessage, buildWhatsAppUrl } from "@/lib/utils";

const roomRates = [
  { label: "Budget", value: 2200 },
  { label: "Comfort", value: 3600 },
  { label: "Premium", value: 6200 },
];

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
  const [destinationSlug, setDestinationSlug] = useState("malpe-beach");
  const [vehicleId, setVehicleId] = useState("innova-crysta");
  const [roomRate, setRoomRate] = useState(roomRates[1].value);
  const [vehicleRequired, setVehicleRequired] = useState(true);
  const [resortRequired, setResortRequired] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const selectedDestination = destinations.find(
    (destination) => destination.slug === destinationSlug,
  );
  const selectedVehicle =
    vehicles.find((vehicle) => vehicle.id === vehicleId) ?? vehicles[0];
  const selectedRoom = roomRates.find((rate) => rate.value === roomRate);

  const leadMessage = buildLeadMessage({
    name,
    phone,
    destination: selectedDestination?.name ?? "Udupi",
    date,
    people,
    vehicleRequired,
    resortRequired,
  });

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
          destination: selectedDestination?.name,
          date,
          people,
          destinationSlug,
          vehicleRequired,
          resortRequired,
          vehicle: vehicleRequired ? selectedVehicle.type : undefined,
          hotel: resortRequired ? selectedRoom?.label : undefined,
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
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+91 98765 43210"
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          Destination
          <select
            value={destinationSlug}
            onChange={(event) => setDestinationSlug(event.target.value)}
            className={inputClass}
          >
            {destinations.map((destination) => (
              <option key={destination.slug} value={destination.slug}>
                {destination.name}
              </option>
            ))}
          </select>
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

        <label className={labelClass}>
          Vehicle
          <select
            value={vehicleId}
            onChange={(event) => setVehicleId(event.target.value)}
            className={inputClass}
          >
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.type} - {vehicle.seats} seats
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          Resort category
          <span className="relative">
            <Hotel className={iconClass} />
            <select
              value={roomRate}
              onChange={(event) => setRoomRate(Number(event.target.value))}
              className={iconInputClass}
            >
              {roomRates.map((rate) => (
                <option key={rate.label} value={rate.value}>
                  {rate.label}
                </option>
              ))}
            </select>
          </span>
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
      </div>
    </form>
  );
}
