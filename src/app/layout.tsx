import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Road Track | Udupi Tourism Platform",
  description:
    "Road Track helps tourists plan Udupi trips with verified destinations, resorts, tourist vehicles, packages, and WhatsApp enquiries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
