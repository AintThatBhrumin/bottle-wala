import type { PropsWithChildren } from "react";

import { PageShell } from "@/components/layout/PageShell";

export default function AuthLayout({ children }: PropsWithChildren) {
  return <PageShell variant="auth">{children}</PageShell>;
}
