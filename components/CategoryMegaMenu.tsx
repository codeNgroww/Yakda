'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface CategoryItem {
  id?: string;
  name: string;
  slug: string;
  icon?: string | null;
  subcategories?: { name: string; slug: string }[];
}

interface CategoryMegaMenuProps {
  categories: CategoryItem[];
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function CategoryMegaMenu({
  categories,
  activeCategory,
  onSelectCategory,
  isOpen,
  onClose,
}: CategoryMegaMenuProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string>('writing');

  if (!isOpen) return null;

  const defaultCategoriesWithSubs = [
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

  const currentActive = defaultCategoriesWithSubs.find((c) => c.slug === hoveredCategory) || defaultCategoriesWithSubs[0];

  return (
    <div className="absolute top-full left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-2xl transition-all">
      <div className="max-w-[1280px] mx-auto p-6 grid grid-cols-12 gap-6 min-h-[320px]">
        
        {/* Left Category Column */}
        <div className="col-span-4 border-r border-gray-100 pr-4 flex flex-col gap-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">
            Main Categories
          </span>
          {defaultCategoriesWithSubs.map((cat) => (
            <button
              key={cat.slug}
              onMouseEnter={() => setHoveredCategory(cat.slug)}
              onClick={() => {
                onSelectCategory(cat.slug);
                onClose();
              }}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all text-left btn-press ${
                hoveredCategory === cat.slug
                  ? 'bg-[#16A2D4]/10 text-[#16A2D4] border border-[#16A2D4]/30'
                  : 'text-[#1A2A4E] hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] text-[#16A2D4]">
                  {cat.icon}
                </span>
                <span>{cat.name}</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-gray-400">chevron_right</span>
            </button>
          ))}
        </div>

        {/* Right Subcategory Details Column */}
        <div className="col-span-8 p-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h4 className="text-base font-bold text-[#1A2A4E] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#16A2D4]">{currentActive.icon}</span>
                {currentActive.name}
              </h4>
              <button
                onClick={() => {
                  onSelectCategory(currentActive.slug);
                  onClose();
                }}
                className="text-xs font-bold text-[#16A2D4] hover:underline flex items-center gap-1"
              >
                View All {currentActive.name} <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {currentActive.subs.map((sub, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectCategory(sub.slug);
                    onClose();
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 bg-gray-50 hover:border-[#F4B21B] hover:bg-white transition-all text-left"
                >
                  <span className="w-2 h-2 rounded-full bg-[#16A2D4]"></span>
                  <span className="text-xs font-semibold text-[#1A2A4E]">
                    {sub.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Looking for corporate bulk orders?</span>
            <Link href="#categories-section" onClick={onClose} className="font-bold text-[#D93630] hover:underline">
              Request B2B Quotation →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
