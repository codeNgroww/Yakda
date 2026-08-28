'use client';

import React, { useState } from 'react';
import { Product } from '@/types/database';

interface SearchModalProps {
  isOpen: boolean;
  products: Product[];
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export default function SearchModal({
  isOpen,
  products,
  onClose,
  onAddToCart,
}: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const results = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 glass-modal"></div>

      <div className="relative w-full max-w-2xl bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Search Input Header */}
        <div className="p-4 border-b border-outline-variant flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[24px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name, SKU (e.g. 8494), or category..."
            className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline focus:outline-none font-medium"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {!searchQuery.trim() ? (
            <div className="py-8 text-center text-outline text-xs">
              Type to search product catalog by title, SKU code, or category...
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-outline text-xs">
              No products found matching &quot;{searchQuery}&quot;
            </div>
          ) : (
            results.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-4 p-3 rounded-xl border border-outline-variant/50 hover:bg-surface-container-low transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={product.image || '/images/hero-desk.png'}
                    alt={product.title}
                    className="w-12 h-12 object-contain bg-white rounded-lg p-1 border border-outline-variant/40"
                  />
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-on-surface truncate">{product.title}</h5>
                    <span className="text-[11px] text-outline">SKU: {product.sku}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-[#003833]">
                    AED {Number(product.price).toFixed(2)}
                  </span>
                  <button
                    onClick={() => {
                      onAddToCart(product);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-[#004d40] hover:bg-[#003833] text-white font-bold text-xs rounded-lg transition-all btn-press flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">add_shopping_cart</span> Add
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
