import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "@/app/globals.css";
import { AppProviders } from "@/providers/AppProviders";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "Jal-Setu",
  description: "Premium water bottle ordering for events, launches, gifting, and hospitality."
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
