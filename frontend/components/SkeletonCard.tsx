'use client';

import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  className?: string;
  variant?: 'product' | 'supplier';
}

export function SkeletonCard({ className, variant = 'product' }: SkeletonCardProps) {
  if (variant === 'supplier') {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="bg-gray-200 h-48 w-full rounded-lg mb-4" />
        <div className="bg-gray-200 h-4 w-32 mb-2 rounded" />
        <div className="bg-gray-200 h-3 w-24 mb-3 rounded" />
        <div className="bg-gray-200 h-3 w-full rounded" />
      </div>
    );
  }

  return (
    <div className={cn('animate-pulse', className)}>
      <div className="bg-gray-200 h-40 w-full rounded-lg mb-3" />
      <div className="bg-gray-200 h-4 w-24 mb-2 rounded" />
      <div className="bg-gray-200 h-3 w-32 rounded" />
    </div>
  );
}
