import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ACCESS_COOKIE = "jalsetu_access_token";
const REFRESH_COOKIE = "jalsetu_refresh_token";
const ROLE_COOKIE = "jalsetu_user_role";
const GUEST_ID_COOKIE = "jalsetu_guest_id";

type UserRole = "customer" | "supplier" | "admin";

const routes = {
  home: "/",
  login: "/login",
  register: "/register",
  explore: "/explore",
  supplier: "/supplier",
  cart: "/cart",
  checkout: "/checkout",
  orders: "/orders",
  supplierDashboard: "/supplier-dashboard",
  revenueDashboard: "/revenue"
} as const;

const authPaths = [routes.login, routes.register];
const protectedCheckoutPaths = [routes.checkout, routes.orders, routes.supplierDashboard, routes.revenueDashboard];
const guestAllowedPaths = [routes.home, routes.explore, routes.supplier, routes.cart];
const customerOnlyPaths = [routes.checkout, routes.orders, routes.cart];
const supplierOnlyPaths = [routes.supplierDashboard];
const adminOnlyPaths = [routes.revenueDashboard];

function isProtectedCheckout(pathname: string) {
  return protectedCheckoutPaths.some((path) => pathname.startsWith(path));
}

function isGuestAllowed(pathname: string) {
  return guestAllowedPaths.some((path) => pathname.startsWith(path));
}

function getDefaultRouteForRole(role?: UserRole | null) {
  if (role === "admin") {
    return routes.revenueDashboard;
  }
  if (role === "supplier") {
    return routes.supplierDashboard;
  }
  return routes.explore;
}

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const role = request.cookies.get(ROLE_COOKIE)?.value as UserRole | undefined;
  const guestId = request.cookies.get(GUEST_ID_COOKIE)?.value;
  const hasSession = Boolean(accessToken || refreshToken);
  const { pathname } = request.nextUrl;

  // Allow guests to browse freely (home, explore, supplier details, cart)
  if (isGuestAllowed(pathname) && !hasSession) {
    return NextResponse.next();
  }

  // Protect checkout-only paths - require authentication
  if (isProtectedCheckout(pathname) && !hasSession) {
    const loginUrl = new URL(routes.login, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login/register
  if (authPaths.some((path) => pathname.startsWith(path)) && hasSession) {
    return NextResponse.redirect(new URL(getDefaultRouteForRole(role), request.url));
  }

  // Role-based access control
  if (supplierOnlyPaths.some((path) => pathname.startsWith(path)) && role && role !== "supplier") {
    return NextResponse.redirect(new URL(getDefaultRouteForRole(role), request.url));
  }

  if (adminOnlyPaths.some((path) => pathname.startsWith(path)) && role && role !== "admin") {
    return NextResponse.redirect(new URL(getDefaultRouteForRole(role), request.url));
  }

  if (customerOnlyPaths.some((path) => pathname.startsWith(path)) && role && (role === "supplier" || role === "admin")) {
    return NextResponse.redirect(new URL(getDefaultRouteForRole(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/explore/:path*",
    "/supplier/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/supplier-dashboard/:path*",
    "/revenue/:path*"
  ]
};
