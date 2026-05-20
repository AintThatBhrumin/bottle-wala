import type { PropsWithChildren } from "react";

import { PageShell } from "@/components/layout/PageShell";

export default function PublicLayout({ children }: PropsWithChildren) {
  return <PageShell variant="public">{children}</PageShell>;
}
