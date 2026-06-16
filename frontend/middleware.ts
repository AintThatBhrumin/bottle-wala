import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ACCESS_COOKIE = "jalsetu_access_token";
const REFRESH_COOKIE = "jalsetu_refresh_token";
const ROLE_COOKIE = "jalsetu_user_role";

type UserRole = "customer" | "supplier" | "admin";

const routes = {
  login: "/login",
  register: "/register",
  suppliers: "/suppliers",
  cart: "/cart",
  checkout: "/checkout",
  orders: "/orders",
  supplierDashboard: "/supplier-dashboard",
  revenueDashboard: "/revenue"
} as const;

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

function getDefaultRouteForRole(role?: UserRole | null) {
  if (role === "admin") {
    return routes.revenueDashboard;
  }
  if (role === "supplier") {
    return routes.supplierDashboard;
  }

  return routes.suppliers;
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
