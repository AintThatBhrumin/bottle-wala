"use client";

import Image from "next/image";
import { ImagePlus, Trash2 } from "lucide-react";

import { QuantityStepper } from "@/components/cart/QuantityStepper";
import { getCartItemBottleTotal, getCartItemCustomizationTotal, getCartItemLineTotal } from "@/lib/utils/cart-pricing";
import { formatCurrency } from "@/lib/utils/currency";
import { useCart } from "@/providers/CartProvider";

export function CartTable() {
  const { items, removeItem, updateItem } = useCart();

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <article key={item.lineId} className="rounded-[2rem] border border-white/75 bg-white/90 p-5 shadow-card">
          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="relative h-28 w-full overflow-hidden rounded-[1.5rem] bg-slate-100 lg:w-32">
              {item.image ? <Image src={item.image} alt={item.name} fill className="object-cover" /> : null}
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-ocean">{item.supplierName}</p>
                  <h3 className="mt-2 text-xl font-semibold text-ink">{item.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Minimum {item.minOrderQuantity} units. Keep the setup clean here, then move into payment.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.lineId)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>

              <div className="grid gap-4 rounded-[1.6rem] bg-slate-50 p-4 md:grid-cols-[auto_1fr_auto] md:items-end">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Quantity</span>
                  <QuantityStepper
                    value={item.quantity}
                    min={item.minOrderQuantity}
                    onChange={(value) =>
                      updateItem(item.lineId, {
                        quantity: value
                      })
                    }
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Sticker type</span>
                  <select
                    value={item.stickerType}
                    onChange={(event) =>
                      updateItem(item.lineId, {
                        stickerType: event.target.value as "supplier" | "custom",
                        customText: event.target.value === "supplier" ? "" : item.customText,
                        customImage: event.target.value === "supplier" ? null : item.customImage
                      })
                    }
                    className="bw-input"
                  >
                    <option value="supplier">Supplier label</option>
                    <option value="custom">Custom label</option>
                  </select>
                </label>

                <div className="rounded-[1.3rem] bg-slate-950 px-4 py-4 text-white">
                  <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-400">Line total</p>
                  <p className="mt-1 text-2xl font-semibold">{formatCurrency(getCartItemLineTotal(item))}</p>
                  {item.stickerType === "custom" ? (
                    <p className="mt-1 text-xs text-slate-300">
                      Includes {formatCurrency(getCartItemCustomizationTotal(item))} branding fee
                    </p>
                  ) : null}
                </div>
              </div>

              {item.stickerType === "custom" ? (
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_280px]">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Custom sticker text</span>
                    <textarea
                      value={item.customText}
                      onChange={(event) =>
                        updateItem(item.lineId, {
                          customText: event.target.value
                        })
                      }
                      className="bw-input min-h-24"
                      placeholder="Add the sponsor line, event name, or guest welcome message"
                    />
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-[1.2rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                    <ImagePlus className="h-4 w-4 text-ocean" />
                    <span>{item.customImage ? item.customImage.name : "Upload optional sticker artwork"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) =>
                        updateItem(item.lineId, {
                          customImage: event.target.files?.[0] ?? null
                        })
                      }
                    />
                  </label>
                </div>
              ) : null}
              {item.stickerType === "custom" ? (
                <div className="rounded-[1.2rem] border border-cyan-100 bg-cyan-50/70 px-4 py-3 text-sm text-slate-600">
                  Bottle subtotal: {formatCurrency(getCartItemBottleTotal(item))} + custom branding:{" "}
                  {formatCurrency(getCartItemCustomizationTotal(item))}
                </div>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
