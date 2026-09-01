'use client';

import React from 'react';
import { Product } from '@/types/database';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export default function QuickViewModal({
  product,
  onClose,
  onAddToCart,
}: QuickViewModalProps) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 glass-modal"></div>

      <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-10 grid grid-cols-1 md:grid-cols-2">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Product Image */}
        <div className="p-6 bg-white flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-100">
          <img
            src={product.image || '/images/hero-desk.png'}
            alt={product.title}
            className="max-h-[260px] object-contain"
          />
        </div>

        {/* Details & Add to Cart */}
        <div className="p-6 flex flex-col justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              SKU: {product.sku}
            </span>
            <h3 className="text-lg font-bold text-[#1A2A4E] mt-1">{product.title}</h3>
            <p className="text-xs text-gray-500 mt-2 line-clamp-4 leading-relaxed">
              {product.description || 'Premium high-grade stationery product for your office and workplace.'}
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-gray-400 font-bold">Price:</span>
                <span className="text-2xl font-black text-[#D93630]">
                  AED {Number(product.price).toFixed(2)}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 bg-gray-50 p-2 rounded-xl border border-gray-200">
                <span>or 4 interest-free payments of <strong>AED {(Number(product.price) / 4).toFixed(2)}</strong> with</span>
                <span className="px-1.5 py-0.5 bg-[#00F5D4] text-[#1A2A4E] font-black text-[9px] rounded uppercase">tabby</span>
                <span>or</span>
                <span className="px-1.5 py-0.5 bg-[#FFD6A5] text-[#1A2A4E] font-black text-[9px] rounded uppercase">tamara</span>
              </div>
            </div>

            <button
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              className="w-full py-3 bg-[#16A2D4] hover:bg-[#1288b3] text-white font-bold text-xs rounded-xl shadow-md transition-all btn-press flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span> Add to Shopping Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
