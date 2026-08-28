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
  const defaultCategoryList = [
    { slug: 'all', name: 'All Items', icon: 'grid_view' },
    { slug: 'writing', name: 'Writing', icon: 'edit' },
    { slug: 'paper', name: 'Paper', icon: 'description' },
    { slug: 'furniture', name: 'Furniture', icon: 'chair' },
    { slug: 'machines', name: 'Machines', icon: 'print' },
  ];

  return (
    <section id="categories-section" className="py-8 bg-white border-b border-gray-200">
      <div className="max-w-[1280px] mx-auto">
        <div className="px-margin-mobile mb-4 flex justify-between items-center">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-[#1A2A4E]">Browse Categories</h3>
            <p className="text-xs md:text-sm text-[#1A2A4E]/70">Find essential products for your office</p>
          </div>
          <button
            onClick={() => onSelectCategory('all')}
            className="text-sm font-semibold text-[#16A2D4] flex items-center gap-1 hover:underline btn-press"
          >
            View All <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>

        <div className="flex overflow-x-auto gap-4 px-margin-mobile pb-2 hide-scrollbar snap-x">
          {defaultCategoryList.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => onSelectCategory(cat.slug)}
                className={`snap-start flex flex-col items-center gap-2 min-w-[88px] p-3 rounded-2xl border transition-all btn-press ${
                  isActive
                    ? 'border-[#F4B21B] bg-[#F4B21B]/10 shadow-sm border-b-4 font-bold text-[#1A2A4E]'
                    : 'border-gray-200 bg-gray-50 hover:border-[#F4B21B] hover:border-b-4 hover:bg-white text-[#1A2A4E]'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isActive ? 'bg-[#F4B21B]/20 text-[#16A2D4]' : 'bg-gray-200/70 text-[#1A2A4E]'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[26px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {cat.icon}
                  </span>
                </div>
                <span className="text-xs font-semibold whitespace-nowrap">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
