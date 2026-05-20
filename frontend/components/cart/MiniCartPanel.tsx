"use client";

import { ArrowRight, ShieldCheck, ShoppingBag, Sparkles, Truck } from "lucide-react";

import { formatCurrency } from "@/lib/utils/currency";
import { useCart } from "@/providers/CartProvider";

type MiniCartPanelProps = {
  onOpenDrawer: () => void;
};

export function MiniCartPanel({ onOpenDrawer }: MiniCartPanelProps) {
  const { items, totalItems, totalPrice } = useCart();

  return (
    <aside className="overflow-hidden rounded-[2rem] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,248,250,0.9))] p-6 shadow-luxe">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-ocean">Quick checkout</p>
          <h3 className="mt-2 font-serif text-4xl leading-none text-ink">Order momentum</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Keep your order moving with one supplier, one secure payment, and one fast confirmation step.
          </p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-slate-950 text-white shadow-card">
          <ShoppingBag className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 grid gap-3 rounded-[1.6rem] bg-slate-950 px-4 py-4 text-white">
        <div className="flex items-center justify-between text-sm text-slate-300">
          <span>Items in order</span>
          <span>{totalItems}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Live subtotal</span>
          <span className="text-2xl font-semibold text-white">{formatCurrency(totalPrice)}</span>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {items.length === 0 ? (
          <div className="rounded-[1.4rem] bg-white px-4 py-4 text-sm text-slate-600 shadow-card">
            Add a bottle setup to unlock instant pricing, delivery guidance, and fast checkout.
          </div>
        ) : (
          items.slice(0, 2).map((item) => (
            <div key={item.lineId} className="rounded-[1.4rem] bg-white px-4 py-4 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{item.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.quantity} units | {item.stickerType === "custom" ? "Custom label" : "Supplier label"}
                  </p>
                </div>
                <p className="text-sm font-semibold text-ink">{formatCurrency(item.quantity * item.pricePerUnit)}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-5 grid gap-2 text-sm text-slate-600">
        <div className="inline-flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Verified suppliers and secure Razorpay checkout
        </div>
        <div className="inline-flex items-center gap-2">
          <Truck className="h-4 w-4 text-emerald-600" />
          Typical delivery in 5 to 7 business days
        </div>
        <div className="inline-flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brass" />
          Teams usually complete this step in under two minutes
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenDrawer}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-gradient px-5 py-3.5 text-sm font-semibold text-white shadow-card transition"
      >
        Review order
        <ArrowRight className="h-4 w-4" />
      </button>
    </aside>
  );
}
