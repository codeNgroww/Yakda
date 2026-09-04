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
  theme?: 'default' | 'green';
}

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

  const isGreenTheme = theme === 'green';

  return (
    <section className={`my-6 md:my-10 ${isGreenTheme ? 'bg-[#F7F6EF] py-8 md:py-12 rounded-2xl mx-margin-mobile shadow-sm border border-[#E5E5D8]' : ''}`}>
      <div className={`${isGreenTheme ? 'max-w-[1280px] mx-auto px-4 md:px-8' : 'max-w-[1280px] mx-auto px-margin-mobile'}`}>
        {/* Header Area */}
        <div className="flex flex-row items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            {icon && (
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 ${isGreenTheme ? 'bg-[#527A5A]/10' : 'bg-[#16A2D4]/10'}`}>
                <span className={`material-symbols-outlined text-[20px] md:text-[24px] ${isGreenTheme ? 'text-[#527A5A]' : 'text-[#16A2D4]'}`}>{icon}</span>
              </div>
            )}
            <div className="flex flex-col">
              <h3 className={`text-base md:text-2xl font-black uppercase tracking-wider ${isGreenTheme ? 'text-[#2C3E30]' : 'text-[#1A2A4E]'}`}>
                {title}
              </h3>
              <p className={`hidden sm:block text-xs md:text-sm mt-0.5 ${isGreenTheme ? 'text-[#2C3E30]/75' : 'text-[#1A2A4E]/70'}`}>{description}</p>
            </div>
          </div>
          
          {/* View All Button */}
          <button
            onClick={() => {
              onSelectCategory(categorySlug);
              const el = document.getElementById('favorites-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`text-xs md:text-sm font-bold flex items-center gap-1 transition-colors whitespace-nowrap btn-press px-3 py-1.5 md:px-4 md:py-2 rounded-full ${
              isGreenTheme 
                ? 'bg-[#527A5A]/10 text-[#527A5A] hover:bg-[#527A5A]/20' 
                : 'bg-gray-100 text-[#1A2A4E] hover:bg-gray-200'
            }`}
          >
            View All <span className="material-symbols-outlined text-[14px] md:text-[18px]">arrow_forward</span>
          </button>
        </div>
        
        {/* Mobile Description (shown below header on small screens) */}
        <p className={`sm:hidden text-[11px] mb-4 ${isGreenTheme ? 'text-[#2C3E30]/75' : 'text-[#1A2A4E]/70'}`}>{description}</p>

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
