"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Menu, ShoppingBag, UserCircle2, X } from "lucide-react";
import { useMemo, useState } from "react";

import { BrandLogo } from "@/components/layout/BrandLogo";
import type { NavigationContext } from "@/lib/constants/navigation";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import { getNavigation, getDefaultRouteForRole } from "@/lib/utils/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useCart } from "@/providers/CartProvider";

type HeaderProps = {
  variant: NavigationContext;
};

export function Header({ variant }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { user, logout, isLoading } = useAuth();
  const { totalItems } = useCart();

  const navigation = useMemo(
    () =>
      getNavigation({
        pathname,
        user,
        context: variant === "auth" ? "public" : variant
      }),
    [pathname, user, variant]
  );

  const checkoutStep = pathname === routes.checkout ? "checkout" : "cart";

  async function handleLogout() {
    await logout();
    router.push(routes.login);
    router.refresh();
  }

  if (variant === "auth") {
    const isLoginPage = pathname === routes.login;
    return (
      <header className="sticky top-0 z-40 border-b border-white/40 bg-[rgba(248,250,252,0.72)] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <BrandLogo showTagline />
          <div className="hidden items-center gap-3 sm:flex">
            <span className="text-sm text-slate-500">
              {isLoginPage ? "Need an account?" : "Already have an account?"}
            </span>
            {isLoginPage ? (
              <Link href={routes.register} className="bw-btn-secondary px-4 py-2.5">
                Create account
              </Link>
            ) : (
              <Link href={routes.login} className="bw-btn-secondary px-4 py-2.5">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>
    );
  }

  if (variant === "checkout") {
    return (
      <header className="sticky top-0 z-40 border-b border-white/40 bg-[rgba(248,250,252,0.82)] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <BrandLogo showTagline />

          <div className="hidden items-center gap-6 md:flex">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em]",
                  checkoutStep === "cart" ? "bg-ocean text-white" : "bg-white/90 text-slate-500"
                )}
              >
                1. Cart
              </span>
              <span className="h-px w-10 bg-slate-300" />
              <span
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em]",
                  checkoutStep === "checkout" ? "bg-ocean text-white" : "bg-white/90 text-slate-500"
                )}
              >
                2. Checkout
              </span>
            </div>

            <div className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-card">
              {totalItems} items in this order
            </div>
          </div>

          {user ? (
            <div className="hidden items-center gap-3 md:flex">
              <span className="text-sm text-slate-500">{user.name}</span>
              <button type="button" onClick={() => void handleLogout()} className="bw-btn-secondary px-4 py-2.5">
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-[rgba(248,250,252,0.72)] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <BrandLogo showTagline />

        <nav className="hidden items-center gap-2 rounded-full border border-white/70 bg-white/70 px-2 py-2 shadow-card md:flex">
          {navigation.map((item) =>
            item.active ? (
              <span
                key={item.href}
                aria-current="page"
                className="rounded-full bg-ocean px-4 py-2 text-sm font-semibold text-white"
              >
                {item.label}
              </span>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-ocean"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user?.role === "supplier" && !pathname.startsWith(routes.supplierDashboard) ? (
            <Link href={routes.supplierDashboard} className="bw-btn-secondary px-4 py-2.5">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          ) : null}

          {user?.role === "customer" && !pathname.startsWith(routes.cart) ? (
            <Link href={routes.cart} className="bw-btn-secondary px-4 py-2.5">
              <ShoppingBag className="h-4 w-4" />
              Cart
              <span className="rounded-full bg-ocean px-2 py-0.5 text-xs font-semibold text-white">{totalItems}</span>
            </Link>
          ) : null}

          {isLoading ? (
            <div className="h-11 w-28 animate-pulse rounded-full bg-white/70" />
          ) : user ? (
            <button type="button" onClick={() => void handleLogout()} className="bw-btn-primary px-5 py-2.5">
              Logout
            </button>
          ) : (
            <Link href={routes.login} className="bw-btn-primary px-5 py-2.5">
              Login
            </Link>
          )}
        </div>

        <button
          type="button"
          className="rounded-full border border-slate-200/80 bg-white/80 p-3 text-slate-600 shadow-card md:hidden"
          onClick={() => setOpen((current) => !current)}
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          "border-t border-white/60 bg-[rgba(248,250,252,0.96)] backdrop-blur-xl md:hidden",
          open ? "block" : "hidden"
        )}
      >
        <div className="space-y-2 px-4 py-4">
          {navigation.map((item) =>
            item.active ? (
              <span
                key={item.href}
                aria-current="page"
                className="block rounded-2xl bg-ocean px-4 py-3 text-sm font-semibold text-white"
              >
                {item.label}
              </span>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-white"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            )
          )}

          <div className="flex items-center justify-between rounded-[1.4rem] border border-white/70 bg-white/80 px-4 py-3 shadow-card">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <UserCircle2 className="h-4 w-4" />
              {user ? user.name : "Guest"}
            </div>
            {user ? (
              <button type="button" onClick={() => void handleLogout()} className="text-sm font-semibold text-ocean">
                Logout
              </button>
            ) : (
              <Link href={routes.login} className="text-sm font-semibold text-ocean">
                Login
              </Link>
            )}
          </div>

          {user && user.role === "customer" && !pathname.startsWith(routes.cart) ? (
            <Link
              href={routes.cart}
              className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700 shadow-card"
              onClick={() => setOpen(false)}
            >
              <span>Cart</span>
              <span className="rounded-full bg-ocean px-2 py-0.5 text-xs font-semibold text-white">{totalItems}</span>
            </Link>
          ) : null}

          {user && !isLoading ? (
            <div className="rounded-[1.4rem] bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {user.role === "customer"
                ? "Your workspace is optimized for fast browsing, customization, and checkout."
                : `You will land on ${getDefaultRouteForRole(user.role)} by default after sign-in.`}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
