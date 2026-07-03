'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SearchBar } from '@/components/SearchBar';
import { SupplierCard } from '@/components/SupplierCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { SkeletonCard } from '@/components/SkeletonCard';
import { suppliersAPI } from '@/lib/api';
import useGuestStore from '@/lib/stores/guest';
import { ChevronLeft } from 'lucide-react';

interface Supplier {
  id: number;
  business_name: string;
  location: string;
  rating: number;
  image?: string;
  delivery_time?: string;
  starting_price?: number;
}

export default function ExplorePage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { saveSupplier, savedSuppliers } = useGuestStore();

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        const response = await suppliersAPI.listSuppliers({ limit: 100 });
        setSuppliers(response.data.results || response.data);
      } catch (error) {
        console.error('Failed to fetch suppliers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  const filteredSuppliers = suppliers.filter((s) =>
    s.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
            <ChevronLeft className="h-5 w-5" />
            Back
          </Link>
          <h1 className="text-2xl font-bold">Explore All Suppliers</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          <SearchBar onSearch={setSearchQuery} />
          <CategoryFilter onSelect={setSelectedCategory} />
        </div>

        {/* Suppliers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <SkeletonCard key={i} variant="supplier" />
            ))}
          </div>
        ) : filteredSuppliers.length > 0 ? (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Showing {filteredSuppliers.length} suppliers
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredSuppliers.map((supplier) => (
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
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 mb-4">No suppliers found</p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Clear search
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
