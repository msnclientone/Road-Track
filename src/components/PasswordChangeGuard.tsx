"use client";

import PasswordChangeModal from "@/components/PasswordChangeModal";

export default function PasswordChangeGuard({
  mustChangePassword,
  children,
}: {
  mustChangePassword: boolean;
  children: React.ReactNode;
}) {
  if (!mustChangePassword) {
    return <>{children}</>;
  }

  return (
    <>
      <PasswordChangeModal onClose={() => {}} />
      <div className="pointer-events-none opacity-20">{children}</div>
    </>
  );
}
