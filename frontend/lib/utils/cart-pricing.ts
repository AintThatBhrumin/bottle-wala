import type { CartItem } from "@/types/marketplace";

export const DEFAULT_CUSTOM_STICKER_FEE_PER_BOTTLE = 4;

export function getCartItemStickerFee(item: CartItem) {
  if (item.stickerType !== "custom") {
    return 0;
  }
  return item.customStickerFeePerBottle ?? DEFAULT_CUSTOM_STICKER_FEE_PER_BOTTLE;
}

export function getCartItemCustomizationTotal(item: CartItem) {
  return getCartItemStickerFee(item) * item.quantity;
}

export function getCartItemBottleTotal(item: CartItem) {
  return item.pricePerUnit * item.quantity;
}

export function getCartItemLineTotal(item: CartItem) {
  return getCartItemBottleTotal(item) + getCartItemCustomizationTotal(item);
}
