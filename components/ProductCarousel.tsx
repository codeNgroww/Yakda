'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types/database';
import ProductCard from './ProductCard';

interface ProductCarouselProps {
  title: string;
  description: string;
  icon?: string;
  categorySlug: string;
  products: Product[];
  onToggleFavorite: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  wishlist: Set<string>;
  onSelectCategory: (categorySlug: string) => void;
  theme?: 'default' | 'green' | 'pink' | 'blue' | 'yellow' | 'purple' | 'gray';
}

const THEME_STYLES = {
  default: { bg: 'bg-white', icon: 'text-[#16A2D4]', iconBg: 'bg-[#16A2D4]/10', text: 'text-[#1A2A4E]' },
  green: { bg: 'bg-[#F2F7F2]', icon: 'text-[#527A5A]', iconBg: 'bg-[#527A5A]/10', text: 'text-[#2C3E30]' },
  pink: { bg: 'bg-[#FEF5F7]', icon: 'text-[#D81B60]', iconBg: 'bg-[#D81B60]/10', text: 'text-[#5C0A28]' },
  blue: { bg: 'bg-[#F4F9FF]', icon: 'text-[#1976D2]', iconBg: 'bg-[#1976D2]/10', text: 'text-[#0B345E]' },
  yellow: { bg: 'bg-[#FFFCF0]', icon: 'text-[#F9A825]', iconBg: 'bg-[#F9A825]/10', text: 'text-[#5C3D00]' },
  purple: { bg: 'bg-[#F8F5FA]', icon: 'text-[#8E24AA]', iconBg: 'bg-[#8E24AA]/10', text: 'text-[#3E0A4C]' },
  gray: { bg: 'bg-[#F8F9FA]', icon: 'text-[#455A64]', iconBg: 'bg-[#455A64]/10', text: 'text-[#1A2A4E]' },
};

export default function ProductCarousel({
  title,
  description,
  icon,
  categorySlug,
  products,
  onToggleFavorite,
  onAddToCart,
  wishlist,
  onSelectCategory,
  theme = 'default',
}: ProductCarouselProps) {
  if (!products || products.length === 0) return null;

  const style = THEME_STYLES[theme] || THEME_STYLES.default;

  return (
    <section className={`w-full py-8 md:py-12 ${style.bg}`}>
      <div className="max-w-[1280px] mx-auto px-margin-mobile">
        {/* Header Area */}
        <div className="flex flex-row items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            {icon && (
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg}`}>
                <span className={`material-symbols-outlined text-[20px] md:text-[24px] ${style.icon}`}>{icon}</span>
              </div>
            )}
            <div className="flex flex-col">
              <h2 className={`text-base md:text-2xl font-black uppercase tracking-wider ${style.text}`}>
                {title}
              </h2>
              <p className={`hidden sm:block text-xs md:text-sm mt-0.5 ${style.text}/75`}>{description}</p>
            </div>
          </div>
          
          {/* View All Button */}
          <button
            onClick={() => {
              onSelectCategory(categorySlug);
              const el = document.getElementById('favorites-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`text-xs md:text-sm font-bold flex items-center gap-1 transition-colors whitespace-nowrap btn-press px-3 py-1.5 md:px-4 md:py-2 rounded-full ${style.iconBg} ${style.icon} hover:opacity-80`}
          >
            View All <span className="material-symbols-outlined text-[14px] md:text-[18px]">arrow_forward</span>
          </button>
        </div>
        
        {/* Mobile Description (shown below header on small screens) */}
        <p className={`sm:hidden text-[11px] mb-4 ${style.text}/75`}>{description}</p>

        {/* Horizontal Scrolling Product List */}
        {/* Mobile: Native horizontal scroll with snapping. Desktop: smooth scroll */}
        <div className="relative -mx-margin-mobile px-margin-mobile sm:mx-0 sm:px-0">
          <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory hide-scrollbar pb-4">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="snap-start shrink-0 w-[160px] sm:w-[200px] md:w-[240px] lg:w-[280px]"
              >
                <ProductCard
                  product={product}
                  isFavorite={wishlist.has(product.id)}
                  onToggleFavorite={onToggleFavorite}
                  onAddToCart={onAddToCart}
                />
              </div>
            ))}
            
            {/* spacer for right padding on mobile scroll */}
            <div className="shrink-0 w-2 sm:hidden" aria-hidden="true"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
