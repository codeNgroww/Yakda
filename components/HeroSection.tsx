'use client';

import React from 'react';

interface HeroSectionProps {
  onOpenSearch?: () => void;
  onSelectEcoCategory?: () => void;
}

export default function HeroSection({ onOpenSearch, onSelectEcoCategory }: HeroSectionProps) {
  const scrollToCatalog = () => {
    const section = document.getElementById('favorites-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-surface border-b border-outline-variant">
      <div className="max-w-[1280px] mx-auto">
        
        {/* Compact Hero Main Banner Card (Mobile: h-[280px] / h-[320px], Desktop: h-[460px]) */}
        <div
          className="relative w-full h-[280px] sm:h-[340px] md:h-[460px] flex items-center bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero-desk.png')" }}
        >
          {/* Light Gradient Overlay for crisp text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-transparent md:w-[65%]"></div>
          
          {/* Content Box */}
          <div className="relative z-10 p-5 sm:p-8 md:p-14 max-w-xl flex flex-col items-start gap-2.5 sm:gap-4">
            {/* Tabby & Tamara + Free Delivery Badges */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="px-2.5 sm:px-3.5 py-0.5 sm:py-1 bg-[#16A2D4] text-white font-black text-[10px] sm:text-xs uppercase tracking-wider rounded shadow-xs">
                FREE DELIVERY
              </span>
              <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 bg-[#00F5D4] text-[#1A2A4E] font-black text-[10px] sm:text-xs uppercase tracking-wider rounded shadow-xs">
                tabby
              </span>
              <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 bg-[#FFD6A5] text-[#1A2A4E] font-black text-[10px] sm:text-xs uppercase tracking-wider rounded shadow-xs">
                tamara
              </span>
            </div>

            {/* Headline in Primary Navy Blue */}
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#1A2A4E] leading-tight tracking-tight">
              Free Shipping Over AED 300
            </h2>
            <p className="text-[#1A2A4E]/80 text-xs sm:text-sm md:text-base font-medium leading-normal sm:leading-relaxed line-clamp-2 sm:line-clamp-none">
              Stock up on premium office essentials, paper reams, and ergonomic supplies with complimentary delivery &amp; 4 interest-free installments.
            </p>
            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 mt-1 sm:mt-2">
              <button
                onClick={scrollToCatalog}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#D93630] hover:bg-[#b82a25] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all btn-press flex items-center gap-2"
              >
                View Catalog <span className="material-symbols-outlined text-[16px] sm:text-[18px]">arrow_forward</span>
              </button>

              <button
                onClick={() => {
                  if (onSelectEcoCategory) {
                    onSelectEcoCategory();
                  } else {
                    scrollToCatalog();
                  }
                }}
                className="px-4 sm:px-5 py-2.5 sm:py-3 bg-[#527A5A] hover:bg-[#3D5C43] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all btn-press flex items-center gap-2"
              >
                <span>🌿 Shop Eco-Friendly Products</span>
              </button>
            </div>
          </div>
        </div>

        {/* Prominent Single Curved Middle Search Bar (3/4th screen width) */}
        <div className="w-3/4 max-w-xl mx-auto relative z-20 -mt-6 sm:-mt-8 mb-2">
          <div
            onClick={onOpenSearch}
            className="w-full bg-white border border-gray-300 rounded-full px-4 sm:px-5 py-3 shadow-lg flex items-center gap-3 cursor-pointer hover:border-[#16A2D4] hover:shadow-xl transition-all"
          >
            <span className="material-symbols-outlined text-[#16A2D4] text-[22px] sm:text-[24px]">search</span>
            <input
              type="text"
              readOnly
              placeholder="Search for stationery, paper, pens, printer ink..."
              className="w-full bg-transparent text-xs sm:text-sm font-semibold text-[#1A2A4E] placeholder:text-gray-400 focus:outline-none cursor-pointer"
            />
            <span className="px-3 py-1 bg-[#16A2D4] text-white font-bold text-[10px] sm:text-xs rounded-full uppercase tracking-wider flex-shrink-0 shadow-2xs">
              SEARCH
            </span>
          </div>
        </div>

        {/* Feature Badges Bar (Tight Spacing) */}
        <div className="w-full bg-white text-[#1A2A4E] py-4 sm:py-6 px-4 md:px-12 border-b border-gray-200 shadow-2xs">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 max-w-[1200px] mx-auto">
            
            {/* Feature 1 */}
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#16A2D4]/10 border border-[#16A2D4]/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[#16A2D4] text-[22px] sm:text-[26px]">local_shipping</span>
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#1A2A4E] leading-tight">Free Delivery</h4>
                <p className="text-[10px] sm:text-xs text-[#1A2A4E]/70 mt-0.5">Over AED 300</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#F4B21B]/10 border border-[#F4B21B]/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[#F4B21B] text-[22px] sm:text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#1A2A4E] leading-tight">Quality Assured</h4>
                <p className="text-[10px] sm:text-xs text-[#1A2A4E]/70 mt-0.5">100% genuine</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#00F5D4]/20 border border-[#00F5D4]/40 flex items-center justify-center flex-shrink-0 font-black text-[#1A2A4E] text-[10px] sm:text-xs uppercase tracking-tighter">
                tabby
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#1A2A4E] leading-tight">Tabby Available</h4>
                <p className="text-[10px] sm:text-xs text-[#1A2A4E]/70 mt-0.5">Split in 4 payments</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#FFD6A5]/30 border border-[#FFD6A5]/50 flex items-center justify-center flex-shrink-0 font-black text-[#1A2A4E] text-[10px] sm:text-xs uppercase tracking-tighter">
                tamara
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#1A2A4E] leading-tight">Tamara Available</h4>
                <p className="text-[10px] sm:text-xs text-[#1A2A4E]/70 mt-0.5">Pay in 4 installments</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
