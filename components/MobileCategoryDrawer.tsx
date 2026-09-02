'use client';

import React, { useState } from 'react';

interface SubCatItem {
  name: string;
  slug: string;
}

interface CategoryGroup {
  slug: string;
  name: string;
  icon: string;
  subs: SubCatItem[];
}

interface MobileCategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
}

export default function MobileCategoryDrawer({
  isOpen,
  onClose,
  activeCategory,
  onSelectCategory,
}: MobileCategoryDrawerProps) {
  const [expandedCat, setExpandedCat] = useState<string | null>('writing');

  if (!isOpen) return null;

  const categoriesWithSubs: CategoryGroup[] = [
    {
      slug: 'writing',
      name: 'Writing Supplies',
      icon: 'edit_note',
      subs: [
        { name: 'Pens & Ballpoints', slug: 'writing' },
        { name: 'Pencils & Mechanical Leads', slug: 'writing' },
        { name: 'Markers & Highlighters', slug: 'writing' },
        { name: 'Correction Tapes & Erasers', slug: 'basics' },
      ],
    },
    {
      slug: 'paper',
      name: 'Office Paper Products',
      icon: 'description',
      subs: [
        { name: 'Copy & Printing Paper A4/A3', slug: 'paper' },
        { name: 'Notebooks & Writing Pads', slug: 'paper' },
        { name: 'Envelopes & Shipping Bags', slug: 'paper' },
        { name: 'Labels & Label Makers', slug: 'labels' },
        { name: 'Ring Binders & Lever Arch Files', slug: 'binders' },
      ],
    },
    {
      slug: 'machines',
      name: 'Office Machines & Tech',
      icon: 'print',
      subs: [
        { name: 'Printers & Multifunction', slug: 'machines' },
        { name: 'Paper Shredders & Cutters', slug: 'machines' },
        { name: 'Desktop Calculators', slug: 'machines' },
        { name: 'Toner & Ink Cartridges', slug: 'machines' },
        { name: 'Computers & Accessories', slug: 'computers' },
      ],
    },
    {
      slug: 'crafts',
      name: 'School & Crafts',
      icon: 'school',
      subs: [
        { name: 'School Supplies & Bags', slug: 'crafts' },
        { name: 'Art Paints & Brushes', slug: 'crafts' },
        { name: 'Craft Materials & Glue', slug: 'crafts' },
      ],
    },
    {
      slug: 'boards',
      name: 'Boards & Organization',
      icon: 'co_present',
      subs: [
        { name: 'Whiteboards & Easels', slug: 'boards' },
        { name: 'Storage Bins & Trays', slug: 'storage' },
        { name: 'Mailing & Packaging Tapes', slug: 'shipping' },
        { name: 'Desktop Office Basics', slug: 'basics' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
      {/* Dark Backdrop */}
      <div onClick={onClose} className="absolute inset-0 glass-modal"></div>

      {/* Mobile Drawer Sheet */}
      <div className="relative w-full bg-white rounded-t-3xl border-t border-gray-200 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col z-10 animate-in slide-in-from-bottom duration-300">
        
        {/* Sheet Top Grab Handle & Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-[#FAF9F6]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#16A2D4]">grid_view</span>
            <h3 className="text-base font-bold text-[#1A2A4E]">Browse Categories</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200/70 text-gray-600 flex items-center justify-center btn-press"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Categories Accordion List */}
        <div className="p-4 overflow-y-auto flex flex-col gap-2.5 hide-scrollbar pb-safe">
          {/* View All Button */}
          <button
            onClick={() => {
              onSelectCategory('all');
              onClose();
            }}
            className={`w-full p-3.5 rounded-2xl border font-bold text-xs flex items-center justify-between transition-all btn-press ${
              activeCategory === 'all'
                ? 'bg-[#1A2A4E] text-white border-[#1A2A4E] shadow-sm'
                : 'bg-gray-50 text-[#1A2A4E] border-gray-200 hover:border-[#16A2D4]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">border_all</span>
              <span>All Products &amp; Catalog</span>
            </div>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>

          {categoriesWithSubs.map((cat) => {
            const isExpanded = expandedCat === cat.slug;
            const isActive = activeCategory === cat.slug;

            return (
              <div
                key={cat.slug}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isActive ? 'border-[#16A2D4] bg-[#16A2D4]/5' : 'border-gray-200 bg-white'
                }`}
              >
                {/* Category Main Header Toggle */}
                <button
                  onClick={() => setExpandedCat(isExpanded ? null : cat.slug)}
                  className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-[#1A2A4E] btn-press"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-[#16A2D4]/10 text-[#16A2D4] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                    </span>
                    <span>{cat.name}</span>
                  </div>
                  <span className="material-symbols-outlined text-[20px] text-gray-400">
                    {isExpanded ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {/* Subcategories Accordion Content */}
                {isExpanded && (
                  <div className="px-4 pb-3 pt-1 border-t border-gray-100 flex flex-col gap-1.5 bg-gray-50/50">
                    <button
                      onClick={() => {
                        onSelectCategory(cat.slug);
                        onClose();
                      }}
                      className="w-full text-left py-2 px-3 rounded-xl text-xs font-extrabold text-[#16A2D4] hover:bg-[#16A2D4]/10 transition-colors flex items-center justify-between"
                    >
                      <span>Shop All {cat.name}</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>

                    {cat.subs.map((sub, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          onSelectCategory(sub.slug);
                          onClose();
                        }}
                        className="w-full text-left py-2 px-3 rounded-xl text-xs font-semibold text-gray-700 hover:bg-white hover:text-[#1A2A4E] transition-colors flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16A2D4]"></span>
                        <span>{sub.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
