'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';

export default function Toast() {
  const { toast } = useCart();

  if (!toast) return null;

  const variantStyles = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-[#D93630] text-white',
    info: 'bg-[#16A2D4] text-white',
  };

  const variantIcons = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
      <div
        className={`flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-lg ${variantStyles[toast.variant]} min-w-[280px] max-w-md`}
      >
        <span
          className="material-symbols-outlined text-[20px] flex-shrink-0"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {variantIcons[toast.variant]}
        </span>
        <span className="text-xs font-bold leading-snug">{toast.message}</span>
      </div>
    </div>
  );
}
