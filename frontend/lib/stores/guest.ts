import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  product_id: number;
  quantity: number;
  bottle_size: string;
}

export interface GuestStore {
  guestId: string | null;
  cartData: CartItem[];
  browsingHistory: number[];
  savedSuppliers: number[];
  expiresAt: string | null;

  // Actions
  initializeGuest: (guestId: string, expiresAt: string) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: number) => void;
  updateCartItem: (productId: number, quantity: number) => void;
  clearCart: () => void;
  addToBrowsingHistory: (supplierId: number) => void;
  saveSupplier: (supplierId: number) => void;
  unsaveSupplier: (supplierId: number) => void;
  clearGuest: () => void;
}

const useGuestStore = create<GuestStore>(
  persist(
    (set) => ({
      guestId: null,
      cartData: [],
      browsingHistory: [],
      savedSuppliers: [],
      expiresAt: null,

      initializeGuest: (guestId: string, expiresAt: string) =>
        set({ guestId, expiresAt }),

      addToCart: (item: CartItem) =>
        set((state) => {
          const existingItem = state.cartData.find(
            (i) => i.product_id === item.product_id && i.bottle_size === item.bottle_size
          );
          if (existingItem) {
            return {
              cartData: state.cartData.map((i) =>
                i.product_id === item.product_id && i.bottle_size === item.bottle_size
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { cartData: [...state.cartData, item] };
        }),

      removeFromCart: (productId: number) =>
        set((state) => ({
          cartData: state.cartData.filter((i) => i.product_id !== productId),
        })),

      updateCartItem: (productId: number, quantity: number) =>
        set((state) => ({
          cartData: state.cartData.map((i) =>
            i.product_id === productId ? { ...i, quantity } : i
          ),
        })),

      clearCart: () => set({ cartData: [] }),

      addToBrowsingHistory: (supplierId: number) =>
        set((state) => ({
          browsingHistory: [
            supplierId,
            ...state.browsingHistory.filter((id) => id !== supplierId),
          ].slice(0, 20),
        })),

      saveSupplier: (supplierId: number) =>
        set((state) => ({
          savedSuppliers: state.savedSuppliers.includes(supplierId)
            ? state.savedSuppliers
            : [...state.savedSuppliers, supplierId],
        })),

      unsaveSupplier: (supplierId: number) =>
        set((state) => ({
          savedSuppliers: state.savedSuppliers.filter((id) => id !== supplierId),
        })),

      clearGuest: () =>
        set({
          guestId: null,
          cartData: [],
          browsingHistory: [],
          savedSuppliers: [],
          expiresAt: null,
        }),
    }),
    {
      name: 'guest-storage',
      partialize: (state) => ({
        guestId: state.guestId,
        cartData: state.cartData,
        browsingHistory: state.browsingHistory,
        savedSuppliers: state.savedSuppliers,
        expiresAt: state.expiresAt,
      }),
    }
  )
);

export default useGuestStore;
