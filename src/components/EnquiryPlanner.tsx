"use client";

import {
  CalendarDays,
  Car,
  Hotel,
  Loader2,
  Moon,
  Send,
  Sun,
  Users,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import PhoneInput from "@/components/PhoneInput";
import { buildWhatsAppUrl, formatCurrency, maskRegistrationNo } from "@/lib/utils";

function formatDateAmPm(date: Date | null): string {
  if (!date || isNaN(date.getTime())) return "—";
  const datePart = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timePart = date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart} • ${timePart}`;
}

const inputBase =
  "rounded-lg border border-ink/10 px-4 py-3 text-base outline-none transition focus:border-coral";
const radioBase =
  "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition";

export function EnquiryPlanner() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [people, setPeople] = useState(4);
  const [vehicleRequired, setVehicleRequired] = useState(true);
  const [resortRequired, setResortRequired] = useState(true);
  const [distance, setDistance] = useState("");
  const [pricingMode, setPricingMode] = useState<"perKm" | "fullDay">("perKm");
  const [roomType, setRoomType] = useState<"ac" | "nonAc">("ac");
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [plannerData, setPlannerData] = useState<any>(null);

  useEffect(() => {
    async function loadPlanner() {
      const res = await fetch("/api/planner");
      if (!res.ok) return;
      const data = await res.json();
      setPlannerData(data);
    }
    loadPlanner();
  }, []);

  const selectedResort = plannerData?.items?.find(
    (item: any) => item.resort
  )?.resort;
  const selectedVehicle = plannerData?.items?.find(
    (item: any) => item.vehicle
  )?.vehicle;

  const numDays = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const diff = checkOut.getTime() - checkIn.getTime();
    if (diff <= 0) return 0;
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [checkIn, checkOut]);

  const numNights = numDays;

  const distanceNum = parseFloat(distance) || 0;
  const vehiclePricePerKm = selectedVehicle?.pricePerKm ?? 0;
  const vehiclePricePerDay = selectedVehicle?.pricePerDay ?? 0;
  const vehicleMinPrice = selectedVehicle?.minimumPrice ?? 0;
  const vehicleMinKm = selectedVehicle?.minimumKm ?? 0;

  const fullDayAvailable =
    !selectedVehicle ||
    !vehicleMinKm ||
    distanceNum >= vehicleMinKm;

  useEffect(() => {
    if (pricingMode === "fullDay" && !fullDayAvailable) {
      setPricingMode("perKm");
    }
  }, [fullDayAvailable, pricingMode]);

  const vehicleCost = useMemo(() => {
    if (!vehicleRequired || !selectedVehicle) return 0;
    if (pricingMode === "perKm") {
      const calculated = distanceNum * vehiclePricePerKm;
      return vehicleMinPrice > 0
        ? Math.max(calculated, vehicleMinPrice)
        : calculated;
    }
    return numDays * vehiclePricePerDay;
  }, [
    vehicleRequired,
    selectedVehicle,
    pricingMode,
    distanceNum,
    numDays,
    vehiclePricePerKm,
    vehiclePricePerDay,
    vehicleMinPrice,
  ]);

  const roomPrice =
    roomType === "ac"
      ? (selectedResort?.priceMax ?? 0)
      : (selectedResort?.priceMin ?? 0);

  const resortCost = useMemo(() => {
    if (!resortRequired || !selectedResort) return 0;
    return numNights * roomPrice;
  }, [resortRequired, selectedResort, numNights, roomPrice]);

  const totalCost = vehicleCost + resortCost;
  const perHeadCost = people > 0 ? Math.ceil(totalCost / people) : 0;

  const destinationName =
    selectedResort?.destination?.name ??
    selectedVehicle?.destination?.name ??
    "";

  const maskedRegNo =
    selectedVehicle?.registrationNo
      ? maskRegistrationNo(selectedVehicle.registrationNo)
      : "";

  const resortBlock = resortRequired && selectedResort
    ? `

----------------------------------------

Selected Resort

Resort Name: ${selectedResort.name}
Resort ID: ${selectedResort.owner?.resortOwnerId ?? "—"}
Room Type: ${roomType === "ac" ? "AC" : "Non-AC"}`
    : "";

  const vehicleBlock = vehicleRequired && selectedVehicle
    ? `

----------------------------------------

Selected Vehicle

Vehicle Type: ${selectedVehicle.vehicleType}${maskedRegNo ? `\nRegistration: ${maskedRegNo}` : ""}
Vehicle ID: ${selectedVehicle.owner?.vehicleOwnerId ?? "—"}
Pricing Mode: ${pricingMode === "perKm" ? "Per KM" : "Full-Day Rental"}${distance ? `\nDistance: ${distance} KM` : ""}`
    : "";

  const leadMessage = `
ROADTRACK TRIP ENQUIRY

----------------------------------------

Customer Details

Name: ${name}
Phone: ${phone}

----------------------------------------

Trip Details

Destination: ${destinationName || "Not specified"}
Check-in: ${checkIn ? formatDateAmPm(checkIn) : "Not set"}
Check-out: ${checkOut ? formatDateAmPm(checkOut) : "Not set"}
Days: ${numDays}
Nights: ${numNights}
People: ${people}${resortBlock}${vehicleBlock}

----------------------------------------

Cost Summary

Vehicle Cost: ${formatCurrency(vehicleCost)}
Resort Cost: ${formatCurrency(resortCost)}
Total Trip Cost: ${formatCurrency(totalCost)}
Per Head Cost: ${formatCurrency(perHeadCost)}
`;

  async function saveLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    if (!name.trim() || !phone.trim()) {
      setNotice("Enter name and phone before saving the enquiry.");
      return;
    }

    if (!checkIn || !checkOut) {
      setNotice("Select check-in and check-out dates.");
      return;
    }

    if (checkIn && checkOut && checkOut <= checkIn) {
      setNotice("Check-out must be after check-in.");
      return;
    }

    if (vehicleRequired && !distance) {
      setNotice("Enter the total travel distance.");
      return;
    }

    if (distanceNum < 0) {
      setNotice("Distance must be a positive number.");
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
          destination: destinationName,
          destinationSlug: "",
          date: checkIn ? checkIn.toISOString().slice(0, 16) : "",
          people,
          vehicleRequired,
          resortRequired,
          vehicle: selectedVehicle?.vehicleType,
          hotel: selectedResort?.name,
          message: leadMessage,
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
    <form onSubmit={saveLead} className="w-full">
      {notice && (
        <div className="mb-6 rounded-lg border border-amber/20 bg-amber/50 px-4 py-3 text-sm font-semibold text-amber">
          {notice}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        {/* LEFT COLUMN — Form */}
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-base font-black">
              <Users className="h-5 w-5 text-coral" />
              Personal Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="text-sm font-bold text-stone">Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className={inputBase}
                />
              </label>
              <div className="grid gap-1.5">
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  required
                  label="Phone"
                  placeholder="9876543210"
                  labelClassName="text-sm font-bold text-stone"
                  inputClassName="h-12 rounded-r-lg border border-ink/10 px-4 text-base outline-none focus:border-coral"
                  prefixClassName="h-12 border border-r-0 border-ink/10 bg-ivory px-3 text-base font-semibold text-stone"
                  wrapperClassName="grid gap-1.5"
                />
              </div>
            </div>
          </div>

          {/* Trip Dates */}
          <div className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-base font-black">
              <CalendarDays className="h-5 w-5 text-coral" />
              Trip Dates
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="text-sm font-bold text-stone">Check-in</span>
                <DatePicker
                  selected={checkIn}
                  onChange={(date: Date | null) => setCheckIn(date)}
                  showTimeSelect
                  timeFormat="h:mm aa"
                  timeIntervals={15}
                  dateFormat="d MMM yyyy, h:mm aa"
                  placeholderText="Select check-in date & time"
                  className={inputBase}
                  wrapperClassName="w-full"
                  popperClassName="z-50"
                  popperPlacement="bottom-start"
                  calendarClassName="rounded-lg border border-ink/10 shadow-lg"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-sm font-bold text-stone">Check-out</span>
                <DatePicker
                  selected={checkOut}
                  onChange={(date: Date | null) => setCheckOut(date)}
                  showTimeSelect
                  timeFormat="h:mm aa"
                  timeIntervals={15}
                  dateFormat="d MMM yyyy, h:mm aa"
                  placeholderText="Select check-out date & time"
                  minDate={checkIn ?? undefined}
                  className={inputBase}
                  wrapperClassName="w-full"
                  popperClassName="z-50"
                  popperPlacement="bottom-start"
                  calendarClassName="rounded-lg border border-ink/10 shadow-lg"
                />
              </label>
            </div>
            {numDays > 0 && (
              <div className="mt-3 flex gap-5 text-sm text-stone">
                <span>
                  <Sun className="mr-1 inline h-4 w-4" />
                  {numDays} day{numDays > 1 ? "s" : ""}
                </span>
                <span>
                  <Moon className="mr-1 inline h-4 w-4" />
                  {numNights} night{numNights > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          {/* Travel Details */}
          <div className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="text-sm font-bold text-stone">
                  Number of People
                </span>
                <input
                  type="number"
                  min={1}
                  max={80}
                  value={people}
                  onChange={(e) => setPeople(Number(e.target.value))}
                  className={inputBase}
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-sm font-bold text-stone">
                  Total Distance (KM)
                </span>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="Enter total travel distance"
                  className={inputBase}
                />
              </label>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-ink/10 bg-ivory px-4 py-3.5 font-semibold transition hover:border-coral">
                <input
                  type="checkbox"
                  checked={vehicleRequired}
                  onChange={(e) => setVehicleRequired(e.target.checked)}
                  className="size-5 accent-coral"
                />
                <Car className="h-5 w-5 text-coral" />
                Vehicle Required
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-ink/10 bg-ivory px-4 py-3.5 font-semibold transition hover:border-coral">
                <input
                  type="checkbox"
                  checked={resortRequired}
                  onChange={(e) => setResortRequired(e.target.checked)}
                  className="size-5 accent-coral"
                />
                <Hotel className="h-5 w-5 text-coral" />
                Resort Required
              </label>
            </div>
          </div>

          {/* Vehicle Pricing */}
          {vehicleRequired && selectedVehicle && (
            <div className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-base font-black">
                <Car className="h-5 w-5 text-coral" />
                Vehicle Pricing — {selectedVehicle.vehicleType}
              </h3>
              <p className="mb-3 text-sm font-semibold text-stone">
                Choose Pricing Mode
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label
                  className={`${radioBase} ${
                    pricingMode === "perKm"
                      ? "border-coral bg-coral/5"
                      : "border-ink/10 bg-ivory hover:border-coral/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="pricingMode"
                    value="perKm"
                    checked={pricingMode === "perKm"}
                    onChange={() => setPricingMode("perKm")}
                    className="size-5 accent-coral"
                  />
                  <div>
                    <p className="font-bold">Per KM</p>
                    <p className="text-sm text-stone">
                      {formatCurrency(vehiclePricePerKm)} / KM
                    </p>
                  </div>
                </label>
                <label
                  className={`${radioBase} ${
                    !fullDayAvailable
                      ? "cursor-not-allowed opacity-50"
                      : pricingMode === "fullDay"
                        ? "border-coral bg-coral/5"
                        : "border-ink/10 bg-ivory hover:border-coral/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="pricingMode"
                    value="fullDay"
                    checked={pricingMode === "fullDay"}
                    onChange={() => setPricingMode("fullDay")}
                    disabled={!fullDayAvailable}
                    className="size-5 accent-coral"
                  />
                  <div>
                    <p className="font-bold">Full-Day Rental</p>
                    <p className="text-sm text-stone">
                      {formatCurrency(vehiclePricePerDay)} / day
                    </p>
                  </div>
                </label>
              </div>
              {!fullDayAvailable && distanceNum > 0 && (
                <p className="mt-3 text-sm text-amber">
                  Full-day rental is available only for trips of{" "}
                  {formatCurrency(vehicleMinKm)} KM or more.
                </p>
              )}
              {!fullDayAvailable && distanceNum === 0 && (
                <p className="mt-3 text-sm text-stone">
                  Full-day rental becomes available only when the entered
                  distance meets the vehicle&rsquo;s minimum distance.
                </p>
              )}
            </div>
          )}

          {vehicleRequired && !selectedVehicle && (
            <div className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
              <p className="text-sm text-stone">
                Add a vehicle to your bucket to see pricing options.
              </p>
            </div>
          )}

          {/* Room Type */}
          {resortRequired && selectedResort && (
            <div className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-base font-black">
                <Hotel className="h-5 w-5 text-coral" />
                Room Type — {selectedResort.name}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <label
                  className={`${radioBase} ${
                    roomType === "ac"
                      ? "border-coral bg-coral/5"
                      : "border-ink/10 bg-ivory hover:border-coral/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="roomType"
                    value="ac"
                    checked={roomType === "ac"}
                    onChange={() => setRoomType("ac")}
                    className="size-5 accent-coral"
                  />
                  <div>
                    <p className="font-bold">AC Room</p>
                    <p className="text-sm text-stone">
                      {formatCurrency(selectedResort.priceMax)} / night
                    </p>
                  </div>
                </label>
                <label
                  className={`${radioBase} ${
                    roomType === "nonAc"
                      ? "border-coral bg-coral/5"
                      : "border-ink/10 bg-ivory hover:border-coral/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="roomType"
                    value="nonAc"
                    checked={roomType === "nonAc"}
                    onChange={() => setRoomType("nonAc")}
                    className="size-5 accent-coral"
                  />
                  <div>
                    <p className="font-bold">Non-AC Room</p>
                    <p className="text-sm text-stone">
                      {formatCurrency(selectedResort.priceMin)} / night
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {resortRequired && !selectedResort && (
            <div className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
              <p className="text-sm text-stone">
                Add a resort to your bucket to see room options.
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-coral text-base font-black text-ink transition hover:bg-coral/90"
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            Save &amp; Open WhatsApp
          </button>
        </div>

        {/* RIGHT COLUMN — Live Trip Summary */}
        <div className="lg:sticky lg:top-28 h-fit">
          <div className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-black">Trip Summary</h3>

            {!plannerData && (
              <p className="text-sm text-stone">
                Loading your trip details...
              </p>
            )}

            {plannerData && !selectedResort && !selectedVehicle && (
              <p className="text-sm text-stone">
                Add items to your bucket to see the trip summary.
              </p>
            )}

            {plannerData && (selectedResort || selectedVehicle) && (
              <div className="space-y-4">
                <div className="space-y-2">
                  {destinationName && (
                    <div className="flex justify-between text-sm">
                      <span className="text-stone">Destination</span>
                      <span className="font-semibold">{destinationName}</span>
                    </div>
                  )}
                  {selectedVehicle && vehicleRequired && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-stone">Vehicle</span>
                        <span className="font-semibold">
                          {selectedVehicle.vehicleType}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-stone">Pricing Mode</span>
                        <span className="font-semibold">
                          {pricingMode === "perKm"
                            ? "Per KM"
                            : "Full-Day Rental"}
                        </span>
                      </div>
                      {distance && (
                        <div className="flex justify-between text-sm">
                          <span className="text-stone">Distance</span>
                          <span className="font-semibold">
                            {distance} KM
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  {selectedResort && resortRequired && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-stone">Resort</span>
                        <span className="font-semibold">
                          {selectedResort.name}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-stone">Room Type</span>
                        <span className="font-semibold">
                          {roomType === "ac" ? "AC" : "Non-AC"}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-stone">Check-in</span>
                    <span className="font-semibold">
                      {formatDateAmPm(checkIn)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone">Check-out</span>
                    <span className="font-semibold">
                      {formatDateAmPm(checkOut)}
                    </span>
                  </div>
                  {numDays > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-stone">Days</span>
                        <span className="font-semibold">{numDays}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-stone">Nights</span>
                        <span className="font-semibold">{numNights}</span>
                      </div>
                    </>
                  )}
                </div>

                <hr className="border-ink/10" />

                {(vehicleRequired && selectedVehicle) ||
                (resortRequired && selectedResort) ? (
                  <div className="space-y-3">
                    {vehicleRequired && selectedVehicle && (
                      <div className="flex justify-between text-sm">
                        <span className="text-stone">Vehicle Cost</span>
                        <span className="font-semibold">
                          {formatCurrency(vehicleCost)}
                        </span>
                      </div>
                    )}
                    {resortRequired && selectedResort && (
                      <div className="flex justify-between text-sm">
                        <span className="text-stone">Resort Cost</span>
                        <span className="font-semibold">
                          {formatCurrency(resortCost)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-black text-coral">
                      <span>Total Trip Cost</span>
                      <span>{formatCurrency(totalCost)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-black text-emerald-600">
                      <span>Per Head Cost</span>
                      <span>{formatCurrency(perHeadCost)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-stone">
                    Select a vehicle or resort to see cost estimates.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
