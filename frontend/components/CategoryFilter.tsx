'use client';

import { useState } from 'react';
import { BOTTLE_SIZES } from '@/lib/utils';

interface CategoryFilterProps {
  onSelect?: (category: string) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All Suppliers', icon: '🏪' },
  { id: '20L', label: '20L Bottles', icon: '🚚' },
  { id: '10L', label: '10L Bottles', icon: '💧' },
  { id: 'bulk', label: 'Bulk Orders', icon: '📦' },
  { id: 'office', label: 'Office Supply', icon: '🏢' },
  { id: 'home', label: 'Home Delivery', icon: '🏠' },
];

export function CategoryFilter({ onSelect }: CategoryFilterProps) {
  const [selected, setSelected] = useState('all');

  const handleSelect = (id: string) => {
    setSelected(id);
    onSelect?.(id);
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
      {CATEGORIES.map((category) => (
        <button
          key={category.id}
          onClick={() => handleSelect(category.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition ${
            selected === category.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>{category.icon}</span>
          <span className="text-sm font-medium">{category.label}</span>
        </button>
      ))}
    </div>
  );
}
