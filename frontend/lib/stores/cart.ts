import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  product_id: number;
  supplier_id: number;
  product_name: string;
  quantity: number;
  bottle_size: string;
  price_per_unit: number;
  delivery_charges: number;
}

export interface CartStore {
  items: CartItem[];
  deliveryAddress: string | null;
  selectedDeliveryDate: string | null;

  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, bottleSize: string) => void;
  updateQuantity: (productId: number, bottleSize: string, quantity: number) => void;
  clearCart: () => void;
  setDeliveryAddress: (address: string) => void;
  setDeliveryDate: (date: string) => void;
  getTotal: () => number;
  getItemCount: () => number;
  getGroupedBySupplier: () => Record<number, CartItem[]>;
}

const useCartStore = create<CartStore>(
  persist(
    (set, get) => ({
      items: [],
      deliveryAddress: null,
      selectedDeliveryDate: null,

      addItem: (item: CartItem) =>
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.product_id === item.product_id && i.bottle_size === item.bottle_size
          );
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.product_id === item.product_id && i.bottle_size === item.bottle_size
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (productId: number, bottleSize: string) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.product_id === productId && i.bottle_size === bottleSize)
          ),
        })),

      updateQuantity: (productId: number, bottleSize: string, quantity: number) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.product_id === productId && i.bottle_size === bottleSize
              ? { ...i, quantity: Math.max(1, quantity) }
              : i
          ),
        })),

      clearCart: () =>
        set({
          items: [],
          deliveryAddress: null,
          selectedDeliveryDate: null,
        }),

      setDeliveryAddress: (address: string) =>
        set({ deliveryAddress: address }),

      setDeliveryDate: (date: string) =>
        set({ selectedDeliveryDate: date }),

      getTotal: () => {
        const { items } = get();
        return items.reduce(
          (total, item) =>
            total + item.price_per_unit * item.quantity + item.delivery_charges,
          0
        );
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },

      getGroupedBySupplier: () => {
        const { items } = get();
        return items.reduce(
          (grouped, item) => {
            if (!grouped[item.supplier_id]) {
              grouped[item.supplier_id] = [];
            }
            grouped[item.supplier_id].push(item);
            return grouped;
          },
          {} as Record<number, CartItem[]>
        );
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        deliveryAddress: state.deliveryAddress,
        selectedDeliveryDate: state.selectedDeliveryDate,
      }),
    }
  )
);

export default useCartStore;
