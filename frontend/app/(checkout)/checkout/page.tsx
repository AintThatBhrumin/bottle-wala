"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Sparkles, Truck } from "lucide-react";

import { PageHeading } from "@/components/layout/PageHeading";
import { EmptyState } from "@/components/marketplace/EmptyState";
import { marketplaceApi } from "@/lib/api/marketplace";
import { routes } from "@/lib/constants/routes";
import { openRazorpayCheckout } from "@/lib/payments/razorpay";
import { getCartItemLineTotal } from "@/lib/utils/cart-pricing";
import { formatCurrency } from "@/lib/utils/currency";
import { useCart } from "@/providers/CartProvider";

function extractCheckoutError(err: any) {
  const error = err?.response?.data?.error;
  const fieldErrors = error?.fields;

  if (fieldErrors && typeof fieldErrors === "object") {
    for (const value of Object.values(fieldErrors)) {
      if (Array.isArray(value) && value.length > 0) {
        return String(value[0]);
      }
      if (value && typeof value === "object") {
        const nested = Object.values(value).flat();
        if (nested.length > 0) {
          return String(nested[0]);
        }
      }
    }
  }

  return error?.detail ?? err?.message ?? "Unable to start secure payment for this order.";
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasMixedSuppliers = useMemo(() => new Set(items.map((item) => item.supplierId)).size > 1, [items]);
  const hasIncompleteCustomSticker = useMemo(
    () => items.some((item) => item.stickerType === "custom" && !item.customText.trim() && !item.customImage),
    [items]
  );
  const deliveryEstimate = useMemo(() => {
    const start = new Date();
    const early = new Date(start);
    const late = new Date(start);
    early.setDate(start.getDate() + 5);
    late.setDate(start.getDate() + 7);
    return `${early.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} - ${late.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short"
    })}`;
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (hasMixedSuppliers) {
      setError("Orders must contain products from one supplier only.");
      return;
    }

    if (hasIncompleteCustomSticker) {
      setError("Every custom sticker item needs either custom text or an uploaded sticker image.");
      return;
    }

    setIsSubmitting(true);
    try {
      const session = await marketplaceApi.startOrderCheckout({
        delivery_address: deliveryAddress,
        items
      });

      if (session.payment.provider === "demo") {
        clearCart();
        router.push(routes.orders);
        router.refresh();
        return;
      }

      await openRazorpayCheckout({
        session,
        onSuccess: async (paymentResult) => {
          await marketplaceApi.verifyOrderPayment(session.order.id, paymentResult);
          clearCart();
          router.push(routes.orders);
          router.refresh();
        },
        onFailure: async (failureResult) => {
          const gatewayError = failureResult.error;
          try {
            await marketplaceApi.reportOrderPaymentFailure(session.order.id, {
              razorpay_order_id: gatewayError?.metadata?.order_id ?? session.payment.order_id,
              razorpay_payment_id: gatewayError?.metadata?.payment_id ?? "",
              error_code: gatewayError?.code ?? "",
              error_description: gatewayError?.description ?? "",
              error_source: gatewayError?.source ?? "",
              error_step: gatewayError?.step ?? "",
              error_reason: gatewayError?.reason ?? ""
            });
          } catch {
            // Preserve the customer-visible failure reason even if the failure callback cannot be persisted.
          }
          setError(gatewayError?.description ?? "Payment failed before confirmation. You can try checkout again.");
        },
        onDismiss: () => {
          setError("Payment was not completed. Your order is still awaiting payment confirmation.");
        }
      });
    } catch (err: any) {
      setError(extractCheckoutError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-8">
      <PageHeading
        eyebrow="Checkout"
        title="One final step, then your supplier takes over."
        description="Keep the form minimal, review your live total, and move into secure payment with delivery expectations already in view."
      />

      {items.length === 0 ? (
        <EmptyState
          title="No items ready for checkout"
          description="Add at least one bottle product to your cart before creating an order."
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-[1.7rem] border border-white/70 bg-white/82 p-5 shadow-card">
              <Truck className="h-5 w-5 text-emerald-600" />
              <h3 className="mt-3 text-lg font-semibold text-ink">Delivery estimate</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Most verified suppliers confirm delivery within 5 to 7 business days after accepting the order.
              </p>
              <p className="mt-3 text-sm font-semibold text-ocean">Estimated window: {deliveryEstimate}</p>
            </article>
            <article className="rounded-[1.7rem] border border-white/70 bg-white/82 p-5 shadow-card">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h3 className="mt-3 text-lg font-semibold text-ink">Secure payment</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Payments run through Razorpay so customers can complete the order with confidence.</p>
            </article>
            <article className="rounded-[1.7rem] border border-white/70 bg-white/82 p-5 shadow-card">
              <Sparkles className="h-5 w-5 text-brass" />
              <h3 className="mt-3 text-lg font-semibold text-ink">Clear confirmation</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Once payment is confirmed, the order moves straight into supplier visibility and tracking.</p>
            </article>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/80 bg-white/92 p-6 shadow-luxe">
              <div className="mb-5">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-ocean">Delivery details</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Where should we send this order?</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Use one delivery block with venue details, city, contact person, and any arrival instructions.
                </p>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Delivery address</span>
                <textarea
                  value={deliveryAddress}
                  onChange={(event) => setDeliveryAddress(event.target.value)}
                  className="bw-input min-h-40"
                  placeholder="Venue name, street, city, contact person, and delivery instructions"
                  required
                />
              </label>

              <div className="mt-5 rounded-[1.4rem] bg-slate-50 px-4 py-4 text-sm text-slate-600">
                Friendly note: your order stays with one supplier so approval, branding, and delivery remain coordinated.
              </div>

              {error ? <p className="mt-4 rounded-[1.4rem] bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-brand-gradient px-5 py-4 text-sm font-semibold text-white shadow-card disabled:opacity-60"
              >
                {isSubmitting ? "Opening secure payment..." : "Continue to secure payment"}
              </button>
            </form>

            <aside className="rounded-[2rem] border border-white/80 bg-white/92 p-6 shadow-luxe">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-ocean">Order confirmation</p>
              <h3 className="mt-2 font-serif text-4xl leading-none text-ink">Everything in one place</h3>

              <div className="mt-5 space-y-4">
                {items.map((item) => (
                  <div key={item.lineId} className="rounded-[1.4rem] bg-slate-50 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-ink">{item.name}</p>
                        <p className="text-sm text-slate-500">
                          {item.quantity} units | {item.stickerType === "custom" ? "Custom label" : "Supplier label"}
                        </p>
                        {item.customText ? <p className="mt-1 text-sm text-slate-500">"{item.customText}"</p> : null}
                      </div>
                      <p className="text-sm font-semibold text-ink">{formatCurrency(getCartItemLineTotal(item))}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[1.5rem] bg-slate-950 px-4 py-4 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Estimated total</span>
                  <span className="text-2xl font-semibold text-white">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="mt-3 text-sm text-slate-300">
                  You will see confirmation immediately after payment and then follow the order from your dashboard.
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
    </section>
  );
}
