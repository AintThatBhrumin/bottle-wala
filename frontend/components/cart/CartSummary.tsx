"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { formatCurrency } from "@/lib/utils/currency";
import { useCart } from "@/providers/CartProvider";

export function CartSummary() {
  const { supplierId, totalItems, totalPrice } = useCart();

  return (
    <aside className="overflow-hidden rounded-[2rem] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(244,248,250,0.92))] p-6 shadow-luxe">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-ocean">Fast checkout</p>
      <h3 className="mt-2 font-serif text-4xl leading-none text-ink">Review and pay</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Keep this order tight and simple. One supplier, one secure payment, one confirmed delivery plan.
      </p>

      <div className="mt-6 grid gap-3 rounded-[1.5rem] bg-slate-950 px-4 py-4 text-white">
        <div className="flex items-center justify-between text-sm text-slate-300">
          <span>Total items</span>
          <span>{totalItems}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-300">
          <span>Suppliers</span>
          <span>{supplierId ? 1 : 0}</span>
        </div>
        <div className="flex items-center justify-between border-t border-white/10 pt-3">
          <span className="text-sm text-slate-300">Estimated total</span>
          <span className="text-2xl font-semibold text-white">{formatCurrency(totalPrice)}</span>
        </div>
      </div>

      <div className="mt-5 grid gap-2 text-sm text-slate-600">
        <div className="inline-flex items-center gap-2">
          <Truck className="h-4 w-4 text-emerald-600" />
          Typical delivery estimate: 5 to 7 business days
        </div>
        <div className="inline-flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Secure Razorpay payment with verified supplier fulfillment
        </div>
      </div>

      <Link
        href={routes.checkout}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-gradient px-5 py-3.5 text-sm font-semibold text-white shadow-card"
      >
        Checkout now
        <ArrowRight className="h-4 w-4" />
      </Link>
    </aside>
  );
}
