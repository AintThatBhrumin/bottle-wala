'use client';

import { useState } from 'react';
import { Search, MapPin, Droplet } from 'lucide-react';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onLocationChange?: (location: string) => void;
  onBottleSizeChange?: (size: string) => void;
}

export function SearchBar({
  onSearch,
  onLocationChange,
  onBottleSizeChange,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [bottleSize, setBottleSize] = useState('');

  const handleSearch = () => {
    onSearch?.(query);
  };

  return (
    <div className="w-full space-y-4">
      {/* Supplier & Location Search */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search supplier or product"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Search
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              onLocationChange?.(e.target.value);
            }}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={bottleSize}
          onChange={(e) => {
            setBottleSize(e.target.value);
            onBottleSizeChange?.(e.target.value);
          }}
          className="flex-1 min-w-40 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Bottle Sizes</option>
          <option value="1L">1L</option>
          <option value="5L">5L</option>
          <option value="10L">10L</option>
          <option value="20L">20L</option>
          <option value="bulk">Bulk Orders</option>
        </select>
      </div>
    </div>
  );
}
