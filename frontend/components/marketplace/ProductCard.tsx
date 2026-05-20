"use client";

import Image from "next/image";
import { CheckCircle2, ImagePlus, ShieldCheck, ShoppingCart, Sparkles, Sticker, Truck } from "lucide-react";
import { useMemo, useState } from "react";

import { QuantityStepper } from "@/components/cart/QuantityStepper";
import { formatCurrency } from "@/lib/utils/currency";
import { useCart } from "@/providers/CartProvider";
import type { Product } from "@/types/marketplace";

type ProductCardProps = {
  product: Product;
  onAddedToCart?: () => void;
};

export function ProductCard({ product, onAddedToCart }: ProductCardProps) {
  const { addItem } = useCart();
  const availableStickerTypes =
    product.sticker_options.length > 0 ? product.sticker_options.map((option) => option.type) : ["supplier", "custom"];

  const [quantity, setQuantity] = useState(product.min_order_quantity);
  const [stickerType, setStickerType] = useState<"supplier" | "custom">(
    availableStickerTypes.includes("supplier") ? "supplier" : "custom"
  );
  const [customText, setCustomText] = useState("");
  const [customImage, setCustomImage] = useState<File | null>(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const liveTotal = useMemo(() => Number(product.price_per_unit) * quantity, [product.price_per_unit, quantity]);
  const perBottlePrice = Number(product.price_per_unit);
  const recommendationCopy =
    stickerType === "custom"
      ? "Custom labels help sponsors, guests, and brand moments feel intentional."
      : "Supplier labels are the quickest route to checkout and fulfillment.";

  function resetCustomization() {
    setCustomText("");
    setCustomImage(null);
  }

  function handleAddToCart() {
    setError("");
    setFeedback("");

    if (stickerType === "custom" && !customText.trim() && !customImage) {
      setError("Add custom text or upload a sticker image before adding this item.");
      return;
    }

    const result = addItem(product, {
      quantity,
      stickerType,
      customText: stickerType === "custom" ? customText.trim() : "",
      customImage: stickerType === "custom" ? customImage : null
    });

    if (!result.ok) {
      setError(`Your cart already contains items from ${result.supplierName}. Complete or clear that cart first.`);
      return;
    }

    setFeedback("Added to your order. You can review it from the side drawer anytime.");
    setQuantity(product.min_order_quantity);
    setStickerType(availableStickerTypes.includes("supplier") ? "supplier" : "custom");
    resetCustomization();
    onAddedToCart?.();
  }

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-white/75 bg-white/92 shadow-luxe transition duration-300 hover:-translate-y-1">
      <div className="relative h-56 overflow-hidden bg-slate-100">
        {product.image ? (
          <Image src={product.image} alt={product.name} fill className="object-cover transition duration-500 group-hover:scale-[1.03]" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-foam via-white to-slate-100 text-ocean">
            <Sticker className="h-14 w-14" />
          </div>
        )}

        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/92 px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-card">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Verified supplier
        </div>
      </div>

      <div className="space-y-6 p-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-ocean">{product.supplier_name}</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{product.name}</h3>
            </div>
            <div className="rounded-[1.3rem] bg-slate-950 px-4 py-3 text-right text-white shadow-card">
              <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-400">Live total</p>
              <p className="mt-1 text-2xl font-semibold">{formatCurrency(liveTotal)}</p>
            </div>
          </div>
          <p className="text-sm leading-7 text-slate-600">
            {product.description || "Premium event-ready bottled water with branding options built for fast ordering."}
          </p>
        </div>

        <div className="grid gap-4 rounded-[1.6rem] bg-[linear-gradient(180deg,#f8fbfc,#eef4f7)] p-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-sm font-medium text-ink">Choose quantity</p>
            <p className="mt-1 text-sm text-slate-500">
              Starting at {product.min_order_quantity} units | {formatCurrency(perBottlePrice)} per bottle
            </p>
          </div>
          <QuantityStepper value={quantity} min={product.min_order_quantity} onChange={setQuantity} />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.3rem] bg-slate-50 px-4 py-3">
            <p className="text-[0.68rem] uppercase tracking-[0.2em] text-slate-400">Units</p>
            <p className="mt-1 text-sm font-semibold text-ink">{quantity}</p>
          </div>
          <div className="rounded-[1.3rem] bg-slate-50 px-4 py-3">
            <p className="text-[0.68rem] uppercase tracking-[0.2em] text-slate-400">Sticker mode</p>
            <p className="mt-1 text-sm font-semibold capitalize text-ink">{stickerType}</p>
          </div>
          <div className="rounded-[1.3rem] bg-slate-50 px-4 py-3">
            <p className="text-[0.68rem] uppercase tracking-[0.2em] text-slate-400">Per bottle</p>
            <p className="mt-1 text-sm font-semibold text-ink">{formatCurrency(perBottlePrice)}</p>
          </div>
        </div>

        <div className="rounded-[1.6rem] border border-slate-200/80 bg-white p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-ink">Sticker customization</p>
              <p className="mt-1 text-sm text-slate-500">{recommendationCopy}</p>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-amber-700">
              Most ordered
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {availableStickerTypes.includes("supplier") ? (
              <button
                type="button"
                onClick={() => {
                  setStickerType("supplier");
                  resetCustomization();
                }}
                className={`rounded-[1.4rem] border px-4 py-4 text-left transition ${
                  stickerType === "supplier"
                    ? "border-ocean bg-foam/70 text-ocean shadow-card"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">Supplier sticker</p>
                  {stickerType === "supplier" ? <CheckCircle2 className="h-4 w-4" /> : null}
                </div>
                <p className="mt-2 text-xs leading-5">Fastest approval path. Best when you want speed over revisions.</p>
              </button>
            ) : null}

            {availableStickerTypes.includes("custom") ? (
              <button
                type="button"
                onClick={() => setStickerType("custom")}
                className={`rounded-[1.4rem] border px-4 py-4 text-left transition ${
                  stickerType === "custom"
                    ? "border-ocean bg-foam/70 text-ocean shadow-card"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">Custom sticker</p>
                  {stickerType === "custom" ? <CheckCircle2 className="h-4 w-4" /> : null}
                </div>
                <p className="mt-2 text-xs leading-5">Best for sponsor moments, launch activations, and guest-facing branding.</p>
              </button>
            ) : null}
          </div>

          {stickerType === "custom" ? (
            <div className="mt-4 space-y-4 rounded-[1.4rem] bg-slate-50 p-4">
              <label className="block">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-slate-700">Custom sticker text</span>
                  <span className="text-xs text-slate-400">{customText.trim().length}/80</span>
                </div>
                <textarea
                  value={customText}
                  onChange={(event) => setCustomText(event.target.value.slice(0, 80))}
                  className="min-h-24 w-full rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 text-sm"
                  placeholder="Welcome guests to Summit 2026"
                />
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-[1.2rem] border border-dashed border-slate-300 bg-white px-4 py-4 text-sm text-slate-600">
                <ImagePlus className="h-4 w-4 text-ocean" />
                <span>{customImage ? customImage.name : "Upload a logo or custom sticker artwork"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => setCustomImage(event.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          ) : null}
        </div>

        <div className="grid gap-2 rounded-[1.5rem] bg-slate-950 px-4 py-4 text-sm text-slate-300">
          <div className="inline-flex items-center gap-2">
            <Truck className="h-4 w-4 text-emerald-300" />
            Delivery estimate starts around 5 to 7 business days
          </div>
          <div className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brass" />
            Most teams choose one custom message and check out in under two minutes
          </div>
        </div>

        {error ? <p className="rounded-[1.3rem] bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        {feedback ? <p className="rounded-[1.3rem] bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</p> : null}

        <div className="sticky bottom-3 rounded-[1.7rem] border border-white/80 bg-white/90 p-3 shadow-luxe backdrop-blur">
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.2em] text-slate-400">Ready to add</p>
              <p className="mt-1 text-sm font-medium text-ink">
                {quantity} bottles with {stickerType === "custom" ? "custom" : "supplier"} sticker
              </p>
            </div>
            <p className="text-xl font-semibold text-ink">{formatCurrency(liveTotal)}</p>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-gradient px-5 py-4 text-sm font-semibold text-white shadow-card"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to order
          </button>
        </div>
      </div>
    </article>
  );
}
