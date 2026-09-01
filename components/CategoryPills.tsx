'use client';

import React from 'react';

interface CategoryPillsProps {
  categories: { id?: string; name: string; slug: string; icon?: string | null }[];
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
}

export default function CategoryPills({
  categories,
  activeCategory,
  onSelectCategory,
}: CategoryPillsProps) {
  // Comprehensive Stationery Categories & Sub-Categories (Furniture removed)
  const defaultCategoryList = [
    { slug: 'all', name: 'All Items', icon: 'grid_view' },
    { slug: 'writing', name: 'Writing Supplies', icon: 'edit_note' },
    { slug: 'paper', name: 'Office Paper Products', icon: 'description' },
    { slug: 'machines', name: 'Office Machines', icon: 'print' },
    { slug: 'labels', name: 'Labels & Label Makers', icon: 'label' },
    { slug: 'binders', name: 'Binders & Accessories', icon: 'folder_open' },
    { slug: 'crafts', name: 'School & Crafts', icon: 'school' },
    { slug: 'basics', name: 'Office Basics', icon: 'inventory_2' },
    { slug: 'boards', name: 'Boards & Easels', icon: 'co_present' },
    { slug: 'storage', name: 'Storage & Organization', icon: 'inventory' },
    { slug: 'shipping', name: 'Mailing & Shipping', icon: 'local_shipping' },
    { slug: 'print-copy', name: 'Print & Copy Room', icon: 'file_copy' },
    { slug: 'computers', name: 'Computers & Accessories', icon: 'laptop_mac' },
  ];

  return (
    <section id="categories-section" className="py-8 bg-white border-b border-gray-200">
      <div className="max-w-[1280px] mx-auto">
        <div className="px-margin-mobile mb-5 flex justify-between items-center">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-[#1A2A4E]">Browse Categories & Sub-Categories</h3>
            <p className="text-xs md:text-sm text-[#1A2A4E]/70">Explore complete stationery and office supplies</p>
          </div>
          <button
            onClick={() => onSelectCategory('all')}
            className="text-xs md:text-sm font-semibold text-[#16A2D4] flex items-center gap-1 hover:underline btn-press"
          >
            View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        {/* Scrollable Category Cards Bar */}
        <div className="flex overflow-x-auto gap-3.5 px-margin-mobile pb-3 hide-scrollbar snap-x">
          {defaultCategoryList.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => onSelectCategory(cat.slug)}
                className={`snap-start flex flex-col items-center justify-between min-w-[115px] max-w-[130px] p-3.5 rounded-2xl border transition-all btn-press text-center ${
                  isActive
                    ? 'border-[#F4B21B] bg-[#F4B21B]/10 shadow-md border-b-4 font-bold text-[#1A2A4E]'
                    : 'border-gray-200 bg-gray-50/80 hover:border-[#F4B21B] hover:border-b-4 hover:bg-white text-[#1A2A4E]'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors mb-2 ${
                    isActive ? 'bg-[#F4B21B] text-[#1A2A4E]' : 'bg-white border border-gray-200 text-[#16A2D4]'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[24px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {cat.icon}
                  </span>
                </div>
                <span className="text-[11px] font-bold leading-tight line-clamp-2">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
