'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, MapPin, Calendar, Phone } from 'lucide-react';
import useCartStore from '@/lib/stores/cart';
import useAuthStore from '@/lib/stores/auth';
import { ordersAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, getTotal, deliveryAddress, selectedDeliveryDate, setDeliveryAddress, setDeliveryDate } =
    useCartStore();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    delivery_address: deliveryAddress || '',
    delivery_date: selectedDeliveryDate || '',
    phone: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login?next=/checkout');
    }
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [user, items, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Group items by supplier and create orders
      const groupedBySupplier: Record<number, typeof items> = {};
      items.forEach((item) => {
        if (!groupedBySupplier[item.supplier_id]) {
          groupedBySupplier[item.supplier_id] = [];
        }
        groupedBySupplier[item.supplier_id].push(item);
      });

      // Create orders for each supplier
      for (const [supplierId, supplierItems] of Object.entries(groupedBySupplier)) {
        await ordersAPI.createOrder({
          assigned_supplier: parseInt(supplierId),
          delivery_address: formData.delivery_address,
          items: supplierItems.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            sticker_type: 'supplier',
          })),
        });
      }

      // Success - redirect to orders page
      router.push('/orders');
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const total = getTotal();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/cart" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
            <ChevronLeft className="h-5 w-5" />
            Back
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Checkout</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-bold">Delivery Address</h2>
              </div>
              <textarea
                value={formData.delivery_address}
                onChange={(e) => {
                  setFormData({ ...formData, delivery_address: e.target.value });
                  setDeliveryAddress(e.target.value);
                }}
                placeholder="Enter your delivery address"
                rows={4}
                required
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Delivery Date */}
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-bold">Delivery Date</h2>
              </div>
              <input
                type="date"
                value={formData.delivery_date}
                onChange={(e) => {
                  setFormData({ ...formData, delivery_date: e.target.value });
                  setDeliveryDate(e.target.value);
                }}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Phone */}
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-bold">Contact Phone</h2>
              </div>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Your phone number"
                required
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </form>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6 h-fit sticky top-20">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4 pb-4 border-b max-h-96 overflow-y-auto">
              {items.map((item) => (
                <div key={`${item.product_id}-${item.bottle_size}`} className="text-sm">
                  <p className="font-semibold text-gray-900">{item.product_name}</p>
                  <p className="text-gray-600">
                    {item.quantity}x {item.bottle_size}L @ {formatPrice(item.price_per_unit)}
                  </p>
                  <p className="text-blue-600 font-semibold">
                    {formatPrice(item.price_per_unit * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatPrice(total * 0.85)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span>{formatPrice(total * 0.15)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-blue-600">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              onClick={(e) => {
                const form = (e.currentTarget as any).closest('main').querySelector('form');
                form?.dispatchEvent(new Event('submit', { bubbles: true }));
              }}
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
