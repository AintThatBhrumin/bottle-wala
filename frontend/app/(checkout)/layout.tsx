import type { PropsWithChildren } from "react";

import { PageShell } from "@/components/layout/PageShell";

export default function CheckoutLayout({ children }: PropsWithChildren) {
  return <PageShell variant="checkout">{children}</PageShell>;
}
