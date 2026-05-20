"use client";

import type { PropsWithChildren } from "react";

import { useCartStore } from "@/lib/stores/cart-store";

export function CartProvider({ children }: PropsWithChildren) {
  return children;
}

export function useCart() {
  const items = useCartStore((state) => state.items);
  const hydrated = useCartStore((state) => state.hydrated);
  const supplierId = useCartStore((state) => state.supplierId);
  const totalItems = useCartStore((state) => state.totalItems);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const addItem = useCartStore((state) => state.addItem);
  const updateItem = useCartStore((state) => state.updateItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  return {
    items,
    hydrated,
    supplierId,
    totalItems,
    totalPrice,
    addItem,
    updateItem,
    removeItem,
    clearCart
  };
}
