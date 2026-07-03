'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Truck, Star } from 'lucide-react';
import { useState } from 'react';

interface SupplierCardProps {
  id: number;
  name: string;
  image?: string;
  rating: number;
  deliveryTime?: string;
  startingPrice?: number;
  location?: string;
  onSave?: (id: number) => void;
  isSaved?: boolean;
}

export function SupplierCard({
  id,
  name,
  image,
  rating,
  deliveryTime,
  startingPrice,
  location,
  onSave,
  isSaved = false,
}: SupplierCardProps) {
  const [saved, setSaved] = useState(isSaved);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    setSaved(!saved);
    onSave?.(id);
  };

  return (
    <Link href={`/supplier/${id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer">
        {/* Image */}
        <div className="relative h-40 bg-gray-100">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
          <button
            onClick={handleSave}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-gray-100 transition"
          >
            <Heart
              className={`h-5 w-5 transition ${
                saved ? 'fill-red-500 text-red-500' : 'text-gray-400'
              }`}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-lg truncate">{name}</h3>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
          </div>

          {/* Delivery & Price */}
          <div className="space-y-1 text-sm text-gray-600">
            {deliveryTime && (
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                <span>{deliveryTime}</span>
              </div>
            )}
            {startingPrice && (
              <div className="text-blue-600 font-semibold">
                From ₹{startingPrice}
              </div>
            )}
            {location && <p className="text-xs">{location}</p>}
          </div>

          {/* Quick Actions */}
          <div className="pt-2 flex gap-2">
            <button className="flex-1 px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200 transition">
              Compare
            </button>
            <button className="flex-1 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition">
              Cart
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
