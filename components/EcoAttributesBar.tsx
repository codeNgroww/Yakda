'use client';

import React from 'react';

interface EcoAttributesBarProps {
  selectedAttribute: string;
  onSelectAttribute: (attr: string) => void;
}

export default function EcoAttributesBar({
  selectedAttribute,
  onSelectAttribute,
}: EcoAttributesBarProps) {
  const ecoAttributes = [
    { id: 'all', label: 'All Eco Products', icon: 'grid_view' },
    { id: 'recycled', label: '♻ Recycled Paper', icon: 'recycling' },
    { id: 'sustainable', label: '🌱 Sustainable', icon: 'nature' },
    { id: 'fsc', label: '🌳 FSC Certified', icon: 'forest' },
    { id: 'plastic-free', label: '📦 Plastic-Free', icon: 'inventory_2' },
    { id: 'biodegradable', label: '🍃 Biodegradable', icon: 'compost' },
  ];

  return (
    <div className="w-full bg-[#E6EFE5]/50 border-b border-[#DCE5D8] py-4">
      <div className="max-w-[1280px] mx-auto px-margin-mobile flex items-center gap-3 overflow-x-auto hide-scrollbar snap-x">
        <span className="text-xs font-black text-[#2C3E30] uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px] text-[#527A5A]">filter_alt</span>
          Eco Type:
        </span>

        {ecoAttributes.map((attr) => {
          const isSelected = selectedAttribute === attr.id;
          return (
            <button
              key={attr.id}
              onClick={() => onSelectAttribute(attr.id)}
              className={`snap-start px-4 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 btn-press ${
                isSelected
                  ? 'bg-[#527A5A] text-white border-[#527A5A] shadow-xs'
                  : 'bg-white text-[#2C3E30] border-[#DCE5D8] hover:border-[#527A5A] hover:bg-[#E6EFE5]/60'
              }`}
            >
              <span>{attr.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
