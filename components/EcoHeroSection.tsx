'use client';

import React from 'react';

interface EcoHeroSectionProps {
  onScrollToCatalog?: () => void;
  onShopAllProducts?: () => void;
}

export default function EcoHeroSection({
  onScrollToCatalog,
  onShopAllProducts,
}: EcoHeroSectionProps) {
  return (
    <section className="relative w-full overflow-hidden bg-[#F7F6EF] border-b border-[#DCE5D8] py-8 sm:py-12 transition-all">
      <div className="max-w-[1280px] mx-auto px-margin-mobile">
        <div className="bg-gradient-to-r from-[#E6EFE5] via-[#F7F6EF] to-[#E6EFE5] border border-[#DCE5D8] rounded-3xl p-6 sm:p-10 md:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          
          {/* Natural Decorative Watermark Icon */}
          <span className="material-symbols-outlined absolute -right-8 -bottom-10 text-[180px] text-[#527A5A]/10 pointer-events-none select-none">
            eco
          </span>

          {/* Left Content Column */}
          <div className="max-w-xl flex flex-col items-start gap-4 relative z-10">
            {/* Soft Green Eco Tag */}
            <div className="flex items-center gap-2 px-3 py-1 bg-[#527A5A]/15 text-[#2C3E30] font-black text-xs uppercase tracking-wider rounded-full border border-[#527A5A]/20">
              <span className="material-symbols-outlined text-[16px] text-[#527A5A]">nature</span>
              <span>SUSTAINABLE LIFESTYLE COLLECTION</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2C3E30] leading-tight tracking-tight">
              🌿 Eco-Friendly Collection
            </h2>

            {/* Subtitle */}
            <p className="text-[#2C3E30]/80 text-sm sm:text-base font-medium leading-relaxed">
              Thoughtful stationery for a more sustainable everyday. Explore recycled paper, biodegradable pens, and plastic-free office supplies engineered for zero-waste performance.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  if (onScrollToCatalog) {
                    onScrollToCatalog();
                  } else {
                    const section = document.getElementById('eco-catalog-section');
                    if (section) section.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-6 py-3.5 bg-[#527A5A] hover:bg-[#3D5C43] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all btn-press flex items-center gap-2"
              >
                <span>Shop Eco-Friendly Products</span>
                <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
              </button>

              {onShopAllProducts && (
                <button
                  onClick={onShopAllProducts}
                  className="px-5 py-3.5 bg-white hover:bg-gray-50 text-[#1A2A4E] font-bold text-xs sm:text-sm rounded-xl border border-[#DCE5D8] shadow-2xs hover:border-[#16A2D4] transition-all btn-press flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#16A2D4]">storefront</span>
                  <span>Shop all Products</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Feature Highlights Card */}
          <div className="w-full md:w-auto grid grid-cols-2 gap-3 relative z-10">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-[#DCE5D8] flex flex-col gap-1 shadow-2xs">
              <span className="material-symbols-outlined text-[#527A5A] text-[24px]">recycling</span>
              <span className="text-xs font-bold text-[#2C3E30]">100% Recycled</span>
              <span className="text-[10px] text-[#2C3E30]/70">Paper &amp; Packaging</span>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-[#DCE5D8] flex flex-col gap-1 shadow-2xs">
              <span className="material-symbols-outlined text-[#527A5A] text-[24px]">forest</span>
              <span className="text-xs font-bold text-[#2C3E30]">FSC Certified</span>
              <span className="text-[10px] text-[#2C3E30]/70">Responsible Sources</span>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-[#DCE5D8] flex flex-col gap-1 shadow-2xs">
              <span className="material-symbols-outlined text-[#527A5A] text-[24px]">inventory_2</span>
              <span className="text-xs font-bold text-[#2C3E30]">Plastic-Free</span>
              <span className="text-[10px] text-[#2C3E30]/70">Zero Plastic Tapes</span>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-[#DCE5D8] flex flex-col gap-1 shadow-2xs">
              <span className="material-symbols-outlined text-[#527A5A] text-[24px]">compost</span>
              <span className="text-xs font-bold text-[#2C3E30]">Biodegradable</span>
              <span className="text-[10px] text-[#2C3E30]/70">Natural Materials</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
