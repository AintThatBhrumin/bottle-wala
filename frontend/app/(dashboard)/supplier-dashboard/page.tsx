"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CircleDollarSign, PackageCheck, ShieldCheck, Store } from "lucide-react";

import { PageHeading } from "@/components/layout/PageHeading";
import { EmptyState } from "@/components/marketplace/EmptyState";
import { marketplaceApi } from "@/lib/api/marketplace";
import { routes } from "@/lib/constants/routes";
import { formatCurrency } from "@/lib/utils/currency";
import { useAuth } from "@/providers/AuthProvider";
import type { Order, Supplier } from "@/types/marketplace";

const dashboardCards = [
  { key: "orders", label: "Incoming orders", icon: PackageCheck },
  { key: "revenue", label: "Order value", icon: CircleDollarSign },
  { key: "verified", label: "Trust signal", icon: ShieldCheck }
] as const;

export default function SupplierDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Supplier | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "supplier") {
      setIsLoading(false);
      return;
    }

    async function loadDashboard() {
      try {
        const [supplierProfile, incomingOrders] = await Promise.all([
          marketplaceApi.getMySupplierProfile(),
          marketplaceApi.getIncomingOrders()
        ]);
        setProfile(supplierProfile);
        setOrders(incomingOrders);
      } catch (err: any) {
        setError(err?.response?.data?.error?.detail ?? "Unable to load the supplier dashboard right now.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboard();
  }, [user]);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.total_price), 0),
    [orders]
  );

  if (authLoading) {
    return <div className="h-80 animate-pulse rounded-[2rem] bg-white/70 shadow-card" />;
  }

  if (!user || user.role !== "supplier") {
    return (
      <EmptyState
        title="Supplier dashboard unavailable"
        description="This workspace is for supplier accounts. Sign in as a supplier to manage incoming orders."
      />
    );
  }

  return (
    <section className="space-y-8">
      <PageHeading
        eyebrow="Supplier command center"
        title="Manage demand with clarity, polish, and speed."
        description="Track incoming orders, monitor your supplier presence, and keep fulfillment moving from one premium dashboard built for operational confidence."
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-[2rem] bg-white/70 shadow-card" />
          ))}
        </div>
      ) : error ? (
        <EmptyState title="Dashboard unavailable" description={error} />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {dashboardCards.map((card) => {
              const Icon = card.icon;
              const value =
                card.key === "orders"
                  ? String(orders.length).padStart(2, "0")
                  : card.key === "revenue"
                    ? formatCurrency(totalRevenue)
                    : profile?.is_verified
                      ? "Verified"
                      : "Pending";

              return (
                <article key={card.key} className="bw-card p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] bg-brand-gradient text-white shadow-card">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">{card.label}</p>
                  <p className="mt-3 font-serif text-4xl leading-none text-ink">{value}</p>
                </article>
              );
            })}
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <article className="bw-card p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] bg-ocean text-white shadow-card">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ocean">Supplier profile</p>
                  <h3 className="mt-2 text-2xl font-semibold text-ink">{profile?.business_name ?? user.name}</h3>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm leading-7 text-slate-600">
                <p>Location: {profile?.location ?? "Not set yet"}</p>
                <p>Rating: {profile?.rating ?? "0.00"}</p>
                <p>Status: {profile?.is_verified ? "Verified and visible to customers" : "Awaiting admin approval"}</p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.3rem] bg-slate-50 px-4 py-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.2em] text-slate-400">Conversion cue</p>
                  <p className="mt-2 text-sm font-medium text-ink">Profiles with clarity and trust cues tend to win faster.</p>
                </div>
                <div className="rounded-[1.3rem] bg-slate-50 px-4 py-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.2em] text-slate-400">Recommendation</p>
                  <p className="mt-2 text-sm font-medium text-ink">Keep product imagery and minimum quantities customer-friendly.</p>
                </div>
              </div>
            </article>

            <article className="bw-card p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ocean">Incoming orders</p>
                  <h3 className="mt-2 text-2xl font-semibold text-ink">Orders needing supplier attention</h3>
                </div>
                <Link href={routes.orders} className="bw-btn-secondary px-4 py-2.5">
                  Full order view
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {orders.length === 0 ? (
                  <div className="rounded-[1.5rem] bg-slate-50 px-4 py-5 text-sm text-slate-600">
                    No incoming orders yet. Once customers check out successfully, they will appear here.
                  </div>
                ) : (
                  orders.slice(0, 4).map((order) => (
                    <div key={order.id} className="rounded-[1.5rem] bg-slate-50 px-4 py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-ink">Order #{order.id}</p>
                          <p className="mt-1 text-sm text-slate-500">{order.delivery_address}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold capitalize text-ocean">{order.status}</p>
                          <p className="mt-1 text-sm text-slate-500">{formatCurrency(Number(order.total_price))}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>
          </div>
        </>
      )}
    </section>
  );
}
