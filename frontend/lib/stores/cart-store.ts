"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { CartItem, Product } from "@/types/marketplace";

const storageKey = "bottle-wala-cart";

function createLineId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeStoredItems(items: CartItem[]) {
  return items.map((item) => ({
    ...item,
    lineId: item.lineId ?? createLineId(),
    customImage: null
  }));
}

type AddItemResult = { ok: true } | { ok: false; reason: "cross_supplier"; supplierName: string };

type CartStore = {
  items: CartItem[];
  hydrated: boolean;
  supplierId: number | null;
  totalItems: number;
  totalPrice: number;
  markHydrated: () => void;
  addItem: (product: Product, overrides?: Partial<CartItem>) => AddItemResult;
  updateItem: (lineId: string, changes: Partial<CartItem>) => void;
  removeItem: (lineId: string) => void;
  clearCart: () => void;
};

function deriveCart(items: CartItem[]) {
  const supplierId = items[0]?.supplierId ?? null;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.pricePerUnit * item.quantity, 0);

  return {
    supplierId,
    totalItems,
    totalPrice
  };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,
      supplierId: null,
      totalItems: 0,
      totalPrice: 0,
      markHydrated: () => set({ hydrated: true }),
      addItem: (product, overrides) => {
        const { supplierId, items } = get();

        if (supplierId && supplierId !== product.supplier) {
          return {
            ok: false,
            reason: "cross_supplier",
            supplierName: items[0]?.supplierName ?? "another supplier"
          };
        }

        const nextItems = [
          ...items,
          {
            lineId: createLineId(),
            productId: product.id,
            supplierId: product.supplier,
            name: product.name,
            supplierName: product.supplier_name,
            pricePerUnit: Number(product.price_per_unit),
            minOrderQuantity: product.min_order_quantity,
            quantity: overrides?.quantity ?? product.min_order_quantity,
            stickerType: overrides?.stickerType ?? "supplier",
            customText: overrides?.customText ?? "",
            customImage: overrides?.customImage ?? null,
            image: product.image ?? null
          }
        ];

        set({
          items: nextItems,
          ...deriveCart(nextItems)
        });

        return { ok: true };
      },
      updateItem: (lineId, changes) => {
        const nextItems = get().items.map((item) =>
          item.lineId === lineId
            ? {
                ...item,
                ...changes
              }
            : item
        );

        set({
          items: nextItems,
          ...deriveCart(nextItems)
        });
      },
      removeItem: (lineId) => {
        const nextItems = get().items.filter((item) => item.lineId !== lineId);

        set({
          items: nextItems,
          ...deriveCart(nextItems)
        });
      },
      clearCart: () =>
        set({
          items: [],
          ...deriveCart([])
        })
    }),
    {
      name: storageKey,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items.map((item) => ({
          ...item,
          customImage: null
        }))
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return;
        }

        const normalizedItems = normalizeStoredItems(state.items);
        const nextState = deriveCart(normalizedItems);

        state.items = normalizedItems;
        state.hydrated = true;
        state.supplierId = nextState.supplierId;
        state.totalItems = nextState.totalItems;
        state.totalPrice = nextState.totalPrice;
      }
    }
  )
);
