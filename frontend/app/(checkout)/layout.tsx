import type { PropsWithChildren } from "react";
import type { Metadata } from "next";

import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false
  }
};

export default function CheckoutLayout({ children }: PropsWithChildren) {
  return <PageShell variant="checkout">{children}</PageShell>;
}
