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
    <section id="categories-section" className="py-8 bg-surface-container-lowest border-b border-outline-variant">
      <div className="max-w-[1280px] mx-auto">
        <div className="px-margin-mobile mb-4 flex justify-between items-center">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-on-surface">Browse Categories</h3>
            <p className="text-xs md:text-sm text-on-surface-variant">Find essential products for your office</p>
          </div>
          <button
            onClick={() => onSelectCategory('all')}
            className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline btn-press"
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
                className={`snap-start flex flex-col items-center gap-2 min-w-[84px] p-2.5 rounded-xl border transition-all btn-press ${
                  isActive
                    ? 'border-primary bg-primary-container/20 shadow-xs font-bold'
                    : 'border-outline-variant bg-surface-container hover:border-primary/50'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xs ${
                    isActive ? 'bg-primary/20' : 'bg-surface-container-high'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[28px] ${
                      isActive ? 'text-primary' : 'text-primary'
                    }`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {cat.icon}
                  </span>
                </div>
                <span className="text-xs font-semibold text-on-surface whitespace-nowrap">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
