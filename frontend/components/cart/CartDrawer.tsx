"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, X } from "lucide-react";

import { getCartItemLineTotal } from "@/lib/utils/cart-pricing";
import { routes } from "@/lib/constants/routes";
import { formatCurrency } from "@/lib/utils/currency";
import { useCart } from "@/providers/CartProvider";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, totalItems, totalPrice, removeItem } = useCart();

  return (
    <div className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-slate-950/35 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-hidden bg-[linear-gradient(180deg,#ffffff,#f8fbfc)] shadow-[0_18px_70px_rgba(15,23,42,0.28)] transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="border-b border-slate-200/80 px-5 py-5">
          <div className="mb-4 flex items-center gap-2">
            {["Browse", "Customize", "Checkout"].map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                    index < 2 ? "bg-brand-gradient text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{step}</span>
              </div>
            ))}
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-ocean">Your order</p>
              <h3 className="mt-2 font-serif text-4xl leading-none text-ink">Ready to checkout</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Review your selections, then move into secure payment when everything looks right.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 bg-white p-2 text-slate-600"
              aria-label="Close cart drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {items.length === 0 ? (
            <div className="rounded-[1.8rem] border border-dashed border-slate-300 bg-white px-5 py-8 text-center">
              <p className="font-serif text-3xl text-ink">Your cart is empty</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Add a bottle configuration to unlock a faster checkout path and real-time pricing.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <article key={item.lineId} className="rounded-[1.5rem] border border-slate-200/80 bg-white px-4 py-4 shadow-card">
                  <div className="flex gap-3">
                    <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-slate-100">
                      {item.image ? <Image src={item.image} alt={item.name} fill className="object-cover" /> : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-ink">{item.name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{item.supplierName}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.lineId)}
                          className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 hover:text-rose-600"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                        <span>
                          {item.quantity} units | {item.stickerType === "custom" ? "Custom label" : "Supplier label"}
                        </span>
                        <span className="font-semibold text-ink">{formatCurrency(getCartItemLineTotal(item))}</span>
                      </div>
                      {item.customText ? <p className="mt-2 text-sm text-slate-500">"{item.customText}"</p> : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-200/80 bg-white/90 px-5 py-5">
          <div className="grid gap-3 rounded-[1.5rem] bg-slate-950 px-4 py-4 text-white">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Total units</span>
              <span>{totalItems}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Estimated total</span>
              <span className="text-2xl font-semibold text-white">{formatCurrency(totalPrice)}</span>
            </div>
            <div className="grid gap-2 pt-1 text-xs text-slate-300">
              <div className="inline-flex items-center gap-2">
                <Truck className="h-4 w-4 text-emerald-300" />
                Delivery estimate: 5 to 7 business days after supplier acceptance
              </div>
              <div className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                Secure Razorpay payment and verified supplier handling
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700"
            >
              Keep browsing
            </button>
            <Link
              href={routes.checkout}
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-gradient px-4 py-3 text-sm font-semibold text-white shadow-card"
            >
              Fast checkout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
