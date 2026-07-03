'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Trash2, ChevronLeft, Plus, Minus } from 'lucide-react';
import useCartStore from '@/lib/stores/cart';
import useAuthStore from '@/lib/stores/auth';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const { items, removeItem, updateQuantity, clearCart, getTotal, getGroupedBySupplier } =
    useCartStore();
  const { user } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
              <ChevronLeft className="h-5 w-5" />
              Back
            </Link>
          </div>
        </header>

        {/* Empty Cart */}
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Start adding water bottles to get started</p>
          <Link
            href="/explore"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const groupedItems = getGroupedBySupplier();
  const total = getTotal();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/explore" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
            <ChevronLeft className="h-5 w-5" />
            Back
          </Link>
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Items Grouped by Supplier */}
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([supplierId, supplierItems]) => (
            <div key={supplierId} className="bg-white rounded-lg shadow p-6 space-y-4">
              <h3 className="font-semibold text-lg border-b pb-3">
                Supplier #{supplierId}
              </h3>

              <div className="space-y-3">
                {supplierItems.map((item) => (
                  <div
                    key={`${item.product_id}-${item.bottle_size}`}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">{item.product_name}</p>
                      <p className="text-sm text-gray-600">{item.bottle_size}L Bottle</p>
                      <p className="text-sm text-blue-600 mt-1">
                        {formatPrice(item.price_per_unit)} × {item.quantity} = {formatPrice(item.price_per_unit * item.quantity)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mr-4">
                      <button
                        onClick={() =>
                          updateQuantity(item.product_id, item.bottle_size, item.quantity - 1)
                        }
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product_id, item.bottle_size, item.quantity + 1)
                        }
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.product_id, item.bottle_size)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Summary & Checkout */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4 sticky bottom-20 md:static">
          <div className="space-y-2 pb-4 border-b">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatPrice(total * 0.85)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charges:</span>
              <span>{formatPrice(total * 0.15)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-blue-600">{formatPrice(total)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={clearCart}
              className="flex-1 px-6 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition font-semibold"
            >
              Clear Cart
            </button>
            <Link
              href={user ? '/checkout' : '/login?next=/checkout'}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-center"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
