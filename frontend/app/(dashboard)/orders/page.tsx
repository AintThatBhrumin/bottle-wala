"use client";

import { useEffect, useMemo, useState } from "react";
import { PackageCheck, ShieldCheck, Sparkles, Truck } from "lucide-react";

import { PageHeading } from "@/components/layout/PageHeading";
import { EmptyState } from "@/components/marketplace/EmptyState";
import { marketplaceApi } from "@/lib/api/marketplace";
import { formatCurrency } from "@/lib/utils/currency";
import type { Order } from "@/types/marketplace";

const trustCards = [
  {
    title: "Every order tracked",
    description: "Follow status, payment state, and bottle configuration without leaving the dashboard.",
    icon: PackageCheck
  },
  {
    title: "Clear delivery expectations",
    description: "Each order keeps fulfillment context visible so customers feel reassured after payment.",
    icon: Truck
  },
  {
    title: "Confidence after checkout",
    description: "Secure payment and verified supplier handling continue past the conversion moment.",
    icon: ShieldCheck
  }
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await marketplaceApi.getOrders();
        setOrders(data);
      } catch (err: any) {
        setError(err?.response?.data?.error?.detail ?? "Unable to load your order history.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadOrders();
  }, []);

  const paidOrders = useMemo(
    () => orders.filter((order) => ["authorized", "captured"].includes(order.payment_status)).length,
    [orders]
  );

  return (
    <section className="space-y-8">
      <PageHeading
        eyebrow="Orders"
        title="Everything after checkout stays calm, visible, and easy to trust."
        description="Track every order, payment state, delivery address, and bottle configuration from one premium order history designed to reassure customers after purchase."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {trustCards.map((card) => {
          const Icon = card.icon;

          return (
            <article key={card.title} className="bw-card p-5">
              <Icon className="h-5 w-5 text-ocean" />
              <h3 className="mt-3 text-lg font-semibold text-ink">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
            </article>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bw-metric">
          <p className="bw-kicker">Total orders</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{orders.length}</p>
        </div>
        <div className="bw-metric">
          <p className="bw-kicker">Confirmed payments</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{paidOrders}</p>
        </div>
        <div className="bw-metric">
          <p className="bw-kicker">Experience cue</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Most teams revisit this page for confirmation and status updates.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-[28px] bg-white/70" />
          ))}
        </div>
      ) : error ? (
        <EmptyState title="Orders unavailable" description={error} />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders yet" description="Your order history will appear here once you complete checkout." />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="bw-shell px-6 py-6">
              <div className="absolute -right-14 top-0 h-36 w-36 rounded-full bg-accent/12 blur-3xl" />
              <div className="relative">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="bw-kicker">Order #{order.id}</p>
                    <h3 className="mt-2 text-2xl font-semibold text-ink">
                      {order.supplier?.business_name ?? "Awaiting supplier assignment"}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{order.delivery_address}</p>
                  </div>

                  <div className="rounded-[1.6rem] bg-slate-950 px-4 py-4 text-white shadow-card">
                    <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-400">Order status</p>
                    <p className="mt-1 text-lg font-semibold capitalize">{order.status}</p>
                    <p className="mt-3 text-[0.72rem] uppercase tracking-[0.18em] text-slate-400">Payment</p>
                    <p className="mt-1 text-sm font-medium capitalize text-slate-200">{order.payment_status}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.3rem] bg-white/82 px-4 py-4 shadow-card">
                    <p className="text-[0.68rem] uppercase tracking-[0.2em] text-slate-400">Delivery guidance</p>
                    <p className="mt-2 text-sm font-medium text-ink">5 to 7 business days after acceptance</p>
                  </div>
                  <div className="rounded-[1.3rem] bg-white/82 px-4 py-4 shadow-card">
                    <p className="text-[0.68rem] uppercase tracking-[0.2em] text-slate-400">Supplier trust</p>
                    <p className="mt-2 text-sm font-medium text-ink">Verified marketplace partner</p>
                  </div>
                  <div className="rounded-[1.3rem] bg-white/82 px-4 py-4 shadow-card">
                    <p className="text-[0.68rem] uppercase tracking-[0.2em] text-slate-400">Confirmation cue</p>
                    <p className="mt-2 text-sm font-medium text-ink">You will see updates here as status changes</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="rounded-[1.5rem] bg-white/82 px-4 py-4 shadow-card">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-ink">{item.product.name}</p>
                        <span className="bw-pill bg-slate-100 text-slate-600">
                          {item.sticker_type === "custom" ? "Custom sticker" : "Supplier sticker"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{item.quantity} units</p>
                      {item.custom_text ? <p className="mt-3 text-sm text-slate-500">"{item.custom_text}"</p> : null}
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-200/70 pt-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Sparkles className="h-4 w-4 text-accent" />
                    Friendly reminder: status changes here as the supplier progresses the order.
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Total</p>
                    <p className="text-2xl font-semibold text-ink">{formatCurrency(Number(order.total_price))}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
