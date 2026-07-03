'use client';

import { useEffect, useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';

export interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastItemProps extends ToastProps {
  onClose: (id: string) => void;
}

function ToastItem({ id, message, type, duration = 3000, onClose }: ToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const bgColor = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  }[type];

  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
  }[type];

  const Icon = {
    success: Check,
    error: AlertCircle,
    info: AlertCircle,
  }[type];

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border ${bgColor} ${textColor} mb-2`}>
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 hover:opacity-70 transition"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastProps[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          {...toast}
          onClose={onRemove}
        />
      ))}
    </div>
  );
}
