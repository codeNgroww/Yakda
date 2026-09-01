'use client';

import React from 'react';

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'popular';

interface FilterSortBarProps {
  activeSubCategory: string;
  onSelectSubCategory: (sub: string) => void;
  selectedBadge: string;
  onSelectBadge: (badge: string) => void;
  inStockOnly: boolean;
  onToggleInStock: () => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalProductsCount: number;
}

export default function FilterSortBar({
  activeSubCategory,
  onSelectSubCategory,
  selectedBadge,
  onSelectBadge,
  inStockOnly,
  onToggleInStock,
  sortBy,
  onSortChange,
  totalProductsCount,
}: FilterSortBarProps) {
  const badgeOptions = [
    { label: 'All Items', value: 'all' },
    { label: 'Best Sellers', value: 'Best Seller' },
    { label: 'On Sale', value: 'Sale' },
    { label: 'New Arrivals', value: 'New Arrival' },
  ];

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      {/* Left Badges & Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">Filter:</span>
        {badgeOptions.map((b) => {
          const isActive = selectedBadge === b.value;
          return (
            <button
              key={b.value}
              onClick={() => onSelectBadge(b.value)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all btn-press ${
                isActive
                  ? 'bg-[#1A2A4E] text-white border-[#1A2A4E] shadow-xs'
                  : 'bg-gray-50 text-[#1A2A4E] border-gray-200 hover:border-[#16A2D4] hover:bg-white'
              }`}
            >
              {b.label}
            </button>
          );
        })}

        {/* In Stock Toggle */}
        <button
          onClick={onToggleInStock}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all btn-press flex items-center gap-1.5 ml-2 ${
            inStockOnly
              ? 'bg-[#16A2D4]/15 text-[#16A2D4] border-[#16A2D4]'
              : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {inStockOnly ? 'check_box' : 'check_box_outline_blank'}
          </span>
          In Stock Only
        </button>
      </div>

      {/* Right Product Count & Sort Selector */}
      <div className="flex items-center justify-between w-full md:w-auto gap-4">
        <span className="text-xs font-semibold text-gray-500">
          Showing <strong className="text-[#1A2A4E]">{totalProductsCount}</strong> items
        </span>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sort By:</label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-gray-50 border border-gray-200 text-[#1A2A4E] focus:outline-none focus:border-[#16A2D4]"
          >
            <option value="featured">Featured Picks</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest Arrivals</option>
            <option value="popular">Popularity</option>
          </select>
        </div>
      </div>
    </div>
  );
}
