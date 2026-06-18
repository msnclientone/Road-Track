import { SiteHeader } from "@/components/SiteHeader";
import { LoginForm } from "@/components/LoginForm";

export default function ResortOwnerLoginPage() {
  return (
    <main className="min-h-screen bg-ivory text-ink">
      <SiteHeader />
      <LoginForm portal="resort-owner" />
    </main>
  );
}
