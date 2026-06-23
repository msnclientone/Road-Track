import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function PartnerResortRedirect() {
  const session = await getSession();

  if (!session) {
    redirect("/login/resort-owner");
  }

  if (session.role !== "RESORT_OWNER") {
    redirect("/login/resort-owner");
  }

  if (session.partnerStatus !== "APPROVED") {
    redirect("/resort-owner/pending");
  }

  redirect("/resort-owner");
}
