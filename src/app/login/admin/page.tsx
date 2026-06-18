import { SiteHeader } from "@/components/SiteHeader";
import { LoginForm } from "@/components/LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-ivory text-ink">
      <SiteHeader />
      <LoginForm portal="admin" />
    </main>
  );
}
