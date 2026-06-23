import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function PartnerVehicleRedirect() {
  const session = await getSession();

  if (!session) {
    redirect("/login/vehicle-owner");
  }

  if (session.role !== "VEHICLE_OWNER") {
    redirect("/login/vehicle-owner");
  }

  // If partner not approved, send to pending page, else to panel
  if (session.partnerStatus !== "APPROVED") {
    redirect("/vehicle-owner/pending");
  }

  redirect("/vehicle-owner");
}
