import type { PropsWithChildren } from "react";

import { PageShell } from "@/components/layout/PageShell";

export default function DashboardLayout({ children }: PropsWithChildren) {
  return <PageShell variant="dashboard">{children}</PageShell>;
}
