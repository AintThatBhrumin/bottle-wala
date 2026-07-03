'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Truck, Award, ChevronLeft } from 'lucide-react';
import { suppliersAPI } from '@/lib/api';
import useGuestStore from '@/lib/stores/guest';
import { SkeletonCard } from '@/components/SkeletonCard';

interface Product {
  id: number;
  name: string;
  description: string;
  price_per_unit: number;
  bottle_sizes: string[];
  min_order_quantity: number;
  image?: string;
}

interface SupplierDetail {
  id: number;
  business_name: string;
  location: string;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  delivery_time_hours: number;
  delivery_charges: number;
  logo?: string;
  cover_image?: string;
  phone?: string;
  email?: string;
  products?: Product[];
}

export default function SupplierPage({ params }: { params: { id: string } }) {
  const [supplier, setSupplier] = useState<SupplierDetail | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  const { saveSupplier, addToCart, savedSuppliers } = useGuestStore();
  const supplierId = parseInt(params.id);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        setLoading(true);
        const response = await suppliersAPI.getSupplier(supplierId);
        setSupplier(response.data);

        // Fetch supplier products
        const productsResponse = await suppliersAPI.getSupplierProducts(supplierId);
        setProducts(productsResponse.data.results || productsResponse.data);
        
        // Add to browsing history
        addToBrowsingHistory(supplierId);
      } catch (error) {
        console.error('Failed to fetch supplier:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplier();
  }, [supplierId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Supplier not found</p>
          <Link href="/explore" className="text-blue-600 hover:text-blue-800">
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/explore" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
            <ChevronLeft className="h-5 w-5" />
            Back
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Supplier Info Card */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Cover */}
          {supplier.cover_image && (
            <div className="relative h-40 bg-gray-200">
              <Image
                src={supplier.cover_image}
                alt={supplier.business_name}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{supplier.business_name}</h1>
                <div className="flex items-center gap-2 mt-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{supplier.location}</span>
                </div>
              </div>
              <button
                onClick={() => saveSupplier(supplier.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  savedSuppliers.includes(supplier.id)
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {savedSuppliers.includes(supplier.id) ? '❤️ Saved' : 'Save'}
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold">{supplier.rating.toFixed(1)}</span>
                </div>
                <p className="text-sm text-gray-600">({supplier.total_reviews} reviews)</p>
              </div>
              <div>
                <div className="font-bold mb-1">
                  {supplier.delivery_time_hours}h
                </div>
                <p className="text-sm text-gray-600">Delivery time</p>
              </div>
              <div>
                <div className="font-bold mb-1">₹{supplier.delivery_charges}</div>
                <p className="text-sm text-gray-600">Delivery fee</p>
              </div>
              {supplier.is_verified && (
                <div>
                  <div className="flex items-center gap-1 mb-1 text-blue-600">
                    <Award className="h-4 w-4" />
                    <span className="font-bold">Verified</span>
                  </div>
                  <p className="text-sm text-gray-600">Trusted seller</p>
                </div>
              )}
            </div>

            {/* Contact */}
            {(supplier.phone || supplier.email) && (
              <div className="pt-4 border-t space-y-2">
                {supplier.phone && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Phone:</span> {supplier.phone}
                  </p>
                )}
                {supplier.email && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Email:</span> {supplier.email}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Products Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Available Products</h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold">{product.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                  </div>

                  {/* Bottle Sizes */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Bottle Size
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.bottle_sizes?.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-3 py-1 rounded border transition ${
                            selectedSize === size
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:border-blue-600'
                          }`}
                        >
                          {size}L
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Quantity (Min: {product.min_order_quantity})
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(product.min_order_quantity, quantity - 1))}
                        className="px-3 py-1 border rounded hover:bg-gray-100"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(product.min_order_quantity, parseInt(e.target.value) || 0))}
                        className="w-20 text-center border rounded px-2 py-1"
                      />
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-1 border rounded hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-600">Price per unit</p>
                      <p className="text-2xl font-bold text-blue-600">₹{product.price_per_unit}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (selectedSize) {
                          addToCart({
                            product_id: product.id,
                            quantity,
                            bottle_size: selectedSize,
                          });
                        }
                      }}
                      disabled={!selectedSize}
                      className={`px-6 py-2 rounded-lg font-semibold transition ${
                        selectedSize
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-600">No products available</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
