import type { NavigationContext, NavigationItem } from "@/lib/constants/navigation";
import { navigationItems } from "@/lib/constants/navigation";
import { routes } from "@/lib/constants/routes";
import type { User, UserRole } from "@/types/auth";

type NavigationOptions = {
  pathname: string;
  user: User | null;
  context: NavigationContext;
};

export function getDefaultRouteForRole(role?: UserRole | null) {
  if (role === "supplier" || role === "admin") {
    return routes.supplierDashboard;
  }

  return routes.suppliers;
}

export function isRouteActive(pathname: string, href: string) {
  if (href === routes.home) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function canSeeItem(item: NavigationItem, user: User | null, context: NavigationContext) {
  if (item.contexts && !item.contexts.includes(context)) {
    return false;
  }

  if (item.guestOnly) {
    return !user;
  }

  if (item.authOnly && !user) {
    return false;
  }

  if (item.roles && user && !item.roles.includes(user.role)) {
    return false;
  }

  return true;
}

export function getNavigation({ pathname, user, context }: NavigationOptions) {
  return navigationItems
    .filter((item) => canSeeItem(item, user, context))
    .map((item) => ({
      ...item,
      active: isRouteActive(pathname, item.href)
    }));
}
