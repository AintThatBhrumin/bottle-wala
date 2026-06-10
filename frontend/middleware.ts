import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ACCESS_COOKIE, REFRESH_COOKIE, ROLE_COOKIE } from "@/lib/auth/cookies";
import { routes } from "@/lib/constants/routes";
import { getDefaultRouteForRole } from "@/lib/utils/navigation";
import type { UserRole } from "@/types/auth";

const authPaths = [routes.login, routes.register];
const sessionPaths = [
  routes.suppliers,
  routes.cart,
  routes.checkout,
  routes.orders,
  routes.supplierDashboard,
  routes.revenueDashboard
];
const customerOnlyPaths = [routes.cart, routes.checkout, routes.orders];
const supplierOnlyPaths = [routes.supplierDashboard];
const adminOnlyPaths = [routes.revenueDashboard];

function isProtected(pathname: string) {
  return sessionPaths.some((path) => pathname.startsWith(path));
}

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const role = request.cookies.get(ROLE_COOKIE)?.value as UserRole | undefined;
  const hasSession = Boolean(accessToken || refreshToken);
  const { pathname } = request.nextUrl;

  if (isProtected(pathname) && !hasSession) {
    const loginUrl = new URL(routes.login, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (authPaths.some((path) => pathname.startsWith(path)) && hasSession) {
    return NextResponse.redirect(new URL(getDefaultRouteForRole(role), request.url));
  }

  if (supplierOnlyPaths.some((path) => pathname.startsWith(path)) && role && role !== "supplier" && role !== "admin") {
    return NextResponse.redirect(new URL(routes.suppliers, request.url));
  }

  if (adminOnlyPaths.some((path) => pathname.startsWith(path)) && role && role !== "admin") {
    return NextResponse.redirect(new URL(getDefaultRouteForRole(role), request.url));
  }

  if (customerOnlyPaths.some((path) => pathname.startsWith(path)) && role && (role === "supplier" || role === "admin")) {
    return NextResponse.redirect(new URL(routes.supplierDashboard, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/suppliers/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/supplier-dashboard/:path*",
    "/revenue/:path*"
  ]
};
