import type { Metadata } from "next";
import "./globals.css";
import LayoutWrapper from "./LayoutWrapper";
import VisitorTracker from "@/components/VisitorTracker";

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
      <body>
        <VisitorTracker />
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
