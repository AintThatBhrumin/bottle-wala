import type { PropsWithChildren } from "react";

import { Header } from "@/components/layout/Header";
import type { NavigationContext } from "@/lib/constants/navigation";

type PageShellProps = PropsWithChildren<{
  variant: NavigationContext;
}>;

const mainClassesByVariant: Record<NavigationContext, string> = {
  public: "mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12",
  auth: "mx-auto flex min-h-[calc(100vh-88px)] max-w-7xl items-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8",
  dashboard: "mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12",
  checkout: "mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12"
};

export function PageShell({ children, variant }: PageShellProps) {
  return (
    <div className="min-h-screen bg-brand-mesh">
      <Header variant={variant} />
      <main className={mainClassesByVariant[variant]}>{children}</main>
    </div>
  );
}
