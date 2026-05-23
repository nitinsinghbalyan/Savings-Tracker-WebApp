import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AppProviders } from "@/components/providers/app-providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";

const appDescription =
  "Track your INR savings across multiple plans with progress, contributions, and insights.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "RupeeRise",
    template: "%s · RupeeRise",
  },
  description: appDescription,
  applicationName: "RupeeRise",
  keywords: [
    "savings tracker",
    "INR",
    "personal finance",
    "India",
    "savings goals",
    "RupeeRise",
  ],
  authors: [{ name: "RupeeRise" }],
  creator: "RupeeRise",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RupeeRise",
  },
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/icon-192.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: appUrl,
    siteName: "RupeeRise",
    title: "RupeeRise",
    description: appDescription,
  },
  twitter: {
    card: "summary",
    title: "RupeeRise",
    description: appDescription,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B1120",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
