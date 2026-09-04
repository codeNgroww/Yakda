'use client';

import React from 'react';

interface CategoryPillsProps {
  categories: { id?: string; name: string; slug: string; icon?: string | null }[];
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
}

// Noon-style category config with curated colors and icons
const CATEGORY_CONFIG: Record<string, { icon: string; bg: string; label: string }> = {
  all:         { icon: 'grid_view',       bg: 'bg-gradient-to-br from-[#16A2D4]/15 to-[#16A2D4]/5',  label: 'All Items' },
  writing:     { icon: 'edit_note',       bg: 'bg-gradient-to-br from-[#6366F1]/15 to-[#6366F1]/5',  label: 'Writing & Pens' },
  paper:       { icon: 'description',     bg: 'bg-gradient-to-br from-[#F59E0B]/15 to-[#F59E0B]/5',  label: 'Paper & Envelopes' },
  machines:    { icon: 'print',           bg: 'bg-gradient-to-br from-[#EF4444]/15 to-[#EF4444]/5',  label: 'Office Machines' },
  labels:      { icon: 'label',           bg: 'bg-gradient-to-br from-[#8B5CF6]/15 to-[#8B5CF6]/5',  label: 'Labels & Tapes' },
  binders:     { icon: 'folder_open',     bg: 'bg-gradient-to-br from-[#EC4899]/15 to-[#EC4899]/5',  label: 'Binders & Filing' },
  crafts:      { icon: 'palette',         bg: 'bg-gradient-to-br from-[#10B981]/15 to-[#10B981]/5',  label: 'School & Crafts' },
  basics:      { icon: 'inventory_2',     bg: 'bg-gradient-to-br from-[#F4B21B]/15 to-[#F4B21B]/5',  label: 'Office Basics' },
  boards:      { icon: 'dashboard',       bg: 'bg-gradient-to-br from-[#0EA5E9]/15 to-[#0EA5E9]/5',  label: 'Boards & Easels' },
  storage:     { icon: 'inventory',       bg: 'bg-gradient-to-br from-[#14B8A6]/15 to-[#14B8A6]/5',  label: 'Storage' },
  shipping:    { icon: 'local_shipping',  bg: 'bg-gradient-to-br from-[#F97316]/15 to-[#F97316]/5',  label: 'Mailing & Shipping' },
  'print-copy':{ icon: 'file_copy',       bg: 'bg-gradient-to-br from-[#64748B]/15 to-[#64748B]/5',  label: 'Print Room' },
  computers:   { icon: 'laptop_mac',      bg: 'bg-gradient-to-br from-[#3B82F6]/15 to-[#3B82F6]/5',  label: 'Computers & Tech' },
  furniture:   { icon: 'desk',            bg: 'bg-gradient-to-br from-[#A855F7]/15 to-[#A855F7]/5',  label: 'Furniture' },
};

const ICON_COLORS: Record<string, string> = {
  all: 'text-[#16A2D4]', writing: 'text-[#6366F1]', paper: 'text-[#F59E0B]',
  machines: 'text-[#EF4444]', labels: 'text-[#8B5CF6]', binders: 'text-[#EC4899]',
  crafts: 'text-[#10B981]', basics: 'text-[#F4B21B]', boards: 'text-[#0EA5E9]',
  storage: 'text-[#14B8A6]', shipping: 'text-[#F97316]', 'print-copy': 'text-[#64748B]',
  computers: 'text-[#3B82F6]', furniture: 'text-[#A855F7]',
};

export default function CategoryPills({
  categories,
  activeCategory,
  onSelectCategory,
}: CategoryPillsProps) {
  const defaultSlugs = [
    'all', 'writing', 'paper', 'machines', 'labels', 'binders',
    'crafts', 'basics', 'boards', 'storage', 'shipping', 'print-copy', 'computers',
  ];

  return (
    <section id="categories-section" className="py-5 sm:py-6 bg-white border-b border-gray-100">
      <div className="max-w-[1280px] mx-auto">
        {/* Horizontally scrollable Noon-style icon row */}
        <div className="flex overflow-x-auto gap-4 sm:gap-5 px-margin-mobile pb-2 hide-scrollbar snap-x">
          {defaultSlugs.map((slug) => {
            const config = CATEGORY_CONFIG[slug] || { icon: 'category', bg: 'bg-gray-100', label: slug };
            const iconColor = ICON_COLORS[slug] || 'text-[#16A2D4]';
            const isActive = activeCategory === slug;

            return (
              <button
                key={slug}
                onClick={() => onSelectCategory(slug)}
                className="snap-start flex flex-col items-center gap-1.5 min-w-[72px] sm:min-w-[80px] group transition-all"
              >
                {/* Icon Container (Noon-style rounded square) */}
                <div
                  className={`w-[60px] h-[60px] sm:w-[68px] sm:h-[68px] rounded-2xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-[#1A2A4E] shadow-lg scale-105'
                      : `${config.bg} group-hover:shadow-md group-hover:scale-105`
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[28px] sm:text-[30px] transition-colors ${
                      isActive ? 'text-white' : iconColor
                    }`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {config.icon}
                  </span>
                </div>
                {/* Label */}
                <span
                  className={`text-[10px] sm:text-[11px] font-semibold leading-tight text-center line-clamp-2 max-w-[76px] transition-colors ${
                    isActive ? 'text-[#1A2A4E] font-bold' : 'text-[#1A2A4E]/70 group-hover:text-[#1A2A4E]'
                  }`}
                >
                  {config.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
