"use client";

import Link from "next/link";
import { ShieldCheck, Sparkles, Truck } from "lucide-react";

import { CartSummary } from "@/components/cart/CartSummary";
import { CartTable } from "@/components/cart/CartTable";
import { PageHeading } from "@/components/layout/PageHeading";
import { EmptyState } from "@/components/marketplace/EmptyState";
import { routes } from "@/lib/constants/routes";
import { useCart } from "@/providers/CartProvider";

const confidencePoints = [
  "Verified suppliers only",
  "One supplier per order for faster coordination",
  "Secure Razorpay payment at checkout"
];

export default function CartPage() {
  const { items } = useCart();

  return (
    <section className="space-y-8">
      <PageHeading
        eyebrow="Review -> confirm -> pay"
        title="Your order is almost ready."
        description="Make quick edits here, keep the decision simple, and move into checkout once the quantity and sticker setup feel right."
      />

      {items.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          description="Start with the supplier marketplace and add bottles to prepare your next order."
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="bw-card p-5">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h3 className="mt-3 text-lg font-semibold text-ink">Trusted checkout path</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Only verified suppliers appear in the order flow, keeping confidence high before payment.
              </p>
            </article>
            <article className="bw-card p-5">
              <Truck className="h-5 w-5 text-emerald-600" />
              <h3 className="mt-3 text-lg font-semibold text-ink">Delivery guidance up front</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Most suppliers confirm delivery windows around 5 to 7 business days after acceptance.
              </p>
            </article>
            <article className="bw-card p-5">
              <Sparkles className="h-5 w-5 text-brass" />
              <h3 className="mt-3 text-lg font-semibold text-ink">Low-friction edits</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Update quantity or sticker choices here instead of bouncing between multiple pages.
              </p>
            </article>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <CartTable />
            <div className="space-y-4">
              <CartSummary />
              <div className="bw-card p-5">
                <p className="text-sm font-semibold text-ink">Why customers convert faster here</p>
                <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  {confidencePoints.map((point) => (
                    <p key={point}>- {point}</p>
                  ))}
                </div>
              </div>
              <Link href={routes.suppliers} className="bw-btn-secondary w-full">
                Keep browsing suppliers
              </Link>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
