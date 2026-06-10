import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "@/app/globals.css";
import { appConfig } from "@/lib/constants/domain";
import { AppProviders } from "@/providers/AppProviders";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.siteUrl),
  applicationName: appConfig.name,
  title: {
    default: "Jal-Setu | Custom Water Bottle Marketplace",
    template: "%s | Jal-Setu"
  },
  description: "Order customized water bottles for events from verified suppliers across Jal-Setu.",
  openGraph: {
    type: "website",
    url: appConfig.siteUrl,
    siteName: appConfig.name,
    title: "Jal-Setu | Custom Water Bottle Marketplace",
    description: "Order customized water bottles for events from verified suppliers across Jal-Setu.",
    images: [
      {
        url: "/brand/jal-setu-logo.png",
        width: 1024,
        height: 268,
        alt: "Jal-Setu"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Jal-Setu | Custom Water Bottle Marketplace",
    description: "Order customized water bottles for events from verified suppliers across Jal-Setu.",
    images: ["/brand/jal-setu-logo.png"]
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
