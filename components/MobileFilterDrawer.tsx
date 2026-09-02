'use client';

import React from 'react';
import { SortOption } from './FilterSortBar';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
  selectedBadge: string;
  onSelectBadge: (badge: string) => void;
  inStockOnly: boolean;
  onToggleInStock: () => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalProductsCount: number;
}

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  activeCategory,
  onSelectCategory,
  selectedBadge,
  onSelectBadge,
  inStockOnly,
  onToggleInStock,
  sortBy,
  onSortChange,
  totalProductsCount,
}: MobileFilterDrawerProps) {
  if (!isOpen) return null;

  const badgeOptions = [
    { label: 'All Badges', value: 'all' },
    { label: 'Best Sellers', value: 'Best Seller' },
    { label: 'On Sale', value: 'Sale' },
    { label: 'New Arrivals', value: 'New Arrival' },
  ];

  const sortOptions: { label: string; value: SortOption }[] = [
    { label: 'Featured Picks', value: 'featured' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Newest Arrivals', value: 'newest' },
    { label: 'Popularity', value: 'popular' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
      {/* Dark Backdrop */}
      <div onClick={onClose} className="absolute inset-0 glass-modal"></div>

      {/* Mobile Drawer Sheet */}
      <div className="relative w-full bg-white rounded-t-3xl border-t border-gray-200 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col z-10 animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-[#FAF9F6]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#16A2D4]">tune</span>
            <h3 className="text-base font-bold text-[#1A2A4E]">Filter &amp; Sort Products</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200/70 text-gray-600 flex items-center justify-center btn-press"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Filters Body */}
        <div className="p-5 overflow-y-auto flex flex-col gap-6 pb-safe">
          
          {/* Section 1: Sort Options */}
          <div>
            <label className="text-xs font-black text-[#1A2A4E] uppercase tracking-wider block mb-3">
              Sort By
            </label>
            <div className="grid grid-cols-2 gap-2">
              {sortOptions.map((opt) => {
                const isSelected = sortBy === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => onSortChange(opt.value)}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all btn-press ${
                      isSelected
                        ? 'border-[#16A2D4] bg-[#16A2D4]/10 text-[#16A2D4] shadow-2xs'
                        : 'border-gray-200 bg-gray-50 text-[#1A2A4E]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Promotional Badges */}
          <div>
            <label className="text-xs font-black text-[#1A2A4E] uppercase tracking-wider block mb-3">
              Product Badges &amp; Offers
            </label>
            <div className="flex flex-wrap gap-2">
              {badgeOptions.map((b) => {
                const isSelected = selectedBadge === b.value;
                return (
                  <button
                    key={b.value}
                    onClick={() => onSelectBadge(b.value)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all btn-press ${
                      isSelected
                        ? 'bg-[#1A2A4E] text-white border-[#1A2A4E]'
                        : 'bg-gray-50 text-[#1A2A4E] border-gray-200'
                    }`}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Availability Toggle */}
          <div>
            <label className="text-xs font-black text-[#1A2A4E] uppercase tracking-wider block mb-3">
              Stock Availability
            </label>
            <button
              onClick={onToggleInStock}
              className={`w-full p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all btn-press ${
                inStockOnly
                  ? 'border-[#16A2D4] bg-[#16A2D4]/10 text-[#16A2D4]'
                  : 'border-gray-200 bg-gray-50 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">
                  {inStockOnly ? 'check_box' : 'check_box_outline_blank'}
                </span>
                <span>In Stock Products Only</span>
              </div>
              <span className="text-[11px] font-semibold text-gray-500">Hide Out of Stock</span>
            </button>
          </div>

        </div>

        {/* Footer Apply Button */}
        <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onSelectBadge('all');
              if (inStockOnly) onToggleInStock();
              onSortChange('featured');
            }}
            className="px-4 py-3 text-xs font-bold text-gray-500 hover:text-[#1A2A4E] underline btn-press"
          >
            Clear All
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-[#16A2D4] hover:bg-[#1288b3] text-white font-black text-xs rounded-xl shadow-md transition-all btn-press flex items-center justify-center gap-2"
          >
            Show {totalProductsCount} Products
          </button>
        </div>

      </div>
    </div>
  );
}
