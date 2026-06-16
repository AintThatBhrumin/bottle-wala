import { routes } from "@/lib/constants/routes";
import type { UserRole } from "@/types/auth";

export type NavigationContext = "public" | "dashboard" | "checkout" | "auth";

export type NavigationItem = {
  href: string;
  label: string;
  roles?: UserRole[];
  authOnly?: boolean;
  guestOnly?: boolean;
  contexts?: NavigationContext[];
};

export const navigationItems: NavigationItem[] = [
  {
    href: routes.home,
    label: "Home",
    contexts: ["public"]
  },
  {
    href: routes.suppliers,
    label: "Suppliers",
    authOnly: true,
    roles: ["customer", "supplier", "admin"],
    contexts: ["public", "dashboard"]
  },
  {
    href: routes.orders,
    label: "Orders",
    authOnly: true,
    roles: ["customer"],
    contexts: ["dashboard"]
  },
  {
    href: routes.cart,
    label: "Cart",
    authOnly: true,
    roles: ["customer"],
    contexts: ["dashboard", "checkout"]
  },
  {
    href: routes.supplierDashboard,
    label: "Dashboard",
    authOnly: true,
    roles: ["supplier"],
    contexts: ["dashboard", "public"]
  },
  {
    href: routes.revenueDashboard,
    label: "Revenue",
    authOnly: true,
    roles: ["admin"],
    contexts: ["dashboard", "public"]
  },
  {
    href: routes.login,
    label: "Login",
    guestOnly: true,
    contexts: ["public", "auth"]
  },
  {
    href: routes.register,
    label: "Get started",
    guestOnly: true,
    contexts: ["public", "auth"]
  }
];
