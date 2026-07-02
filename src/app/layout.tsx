import type { Metadata } from "next";
import "./globals.css";
import LayoutWrapper from "./LayoutWrapper";
import VisitorTracker from "@/components/VisitorTracker";

const title = "Road Track | Udupi Tourism Platform";
const description =
  "Road Track helps tourists plan Udupi trips with verified destinations, resorts, tourist vehicles, packages, and WhatsApp enquiries.";

export const metadata: Metadata = {
  title,
  description,
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title,
    description,
    type: "website",
    locale: "en_IN",
    siteName: "Road Track",
    images: [{ url: "/road-track-logo.jpeg", width: 609, height: 374 }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/road-track-logo.jpeg"],
  },
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
