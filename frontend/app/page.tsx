'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SearchBar } from '@/components/SearchBar';
import { SupplierCard } from '@/components/SupplierCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { SkeletonCard } from '@/components/SkeletonCard';
import { suppliersAPI } from '@/lib/api';
import useGuestStore from '@/lib/stores/guest';
import useAuthStore from '@/lib/stores/auth';
import { ArrowRight, Zap, TrendingUp } from 'lucide-react';

interface Supplier {
  id: number;
  business_name: string;
  location: string;
  rating: number;
  image?: string;
  delivery_time?: string;
  starting_price?: number;
}

export default function HomePage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);

  const { saveSupplier, savedSuppliers, addToBrowsingHistory } = useGuestStore();
  const { user } = useAuthStore();

  // Fetch suppliers on mount
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        const response = await suppliersAPI.listSuppliers({ limit: 50 });
        setSuppliers(response.data.results || response.data);
      } catch (error) {
        console.error('Failed to fetch suppliers:', error);
        setSuppliers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  // Filter suppliers based on search and category
  useEffect(() => {
    let filtered = suppliers;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (s) =>
          s.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category (can be expanded with bottle size logic)
    if (selectedCategory !== 'all') {
      // This is a basic filter - expand based on your category logic
      filtered = filtered.slice(0, 20);
    }

    setFilteredSuppliers(filtered);
  }, [suppliers, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-8 px-4 mb-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Find Trusted Water Suppliers</h1>
          <p className="text-blue-100 mb-6">Fast delivery • Verified suppliers • Best prices</p>

          {/* Search Bar */}
          <div className="bg-white text-gray-900 p-4 rounded-lg shadow-lg">
            <SearchBar
              onSearch={setSearchQuery}
              onLocationChange={(location) => setSearchQuery(location)}
              onBottleSizeChange={(size) => console.log('Filter by size:', size)}
            />
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Category Filter */}
        <section>
          <CategoryFilter onSelect={setSelectedCategory} />
        </section>

        {/* Popular Suppliers Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                Popular Suppliers Near You
              </h2>
              <p className="text-gray-600 text-sm mt-1">Trending this week</p>
            </div>
            <Link
              href="/explore"
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 transition"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={i} variant="supplier" />
              ))}
            </div>
          ) : filteredSuppliers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredSuppliers.slice(0, 8).map((supplier) => (
                <SupplierCard
                  key={supplier.id}
                  id={supplier.id}
                  name={supplier.business_name}
                  rating={supplier.rating}
                  location={supplier.location}
                  image={supplier.image}
                  deliveryTime={supplier.delivery_time}
                  startingPrice={supplier.starting_price}
                  isSaved={savedSuppliers.includes(supplier.id)}
                  onSave={saveSupplier}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-600">No suppliers found. Try adjusting your search.</p>
            </div>
          )}
        </section>

        {/* Recently Viewed Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Zap className="h-6 w-6 text-blue-600" />
            Quick Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Browse Freely', description: 'No login required to explore suppliers' },
              { title: 'Save Favorites', description: 'Bookmark your preferred suppliers' },
              { title: 'Compare Prices', description: 'Find the best deals instantly' },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        {!user && (
          <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Order?</h2>
            <p className="mb-6 text-blue-100">Sign up now to place your first order and enjoy exclusive discounts.</p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/login"
                className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-400 transition border border-blue-400"
              >
                Sign Up
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
