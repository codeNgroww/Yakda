'use client';

import React from 'react';

export default function HeroSection() {
  const scrollToCatalog = () => {
    const section = document.getElementById('favorites-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-surface border-b border-outline-variant">
      <div className="max-w-[1280px] mx-auto">
        
        {/* Hero Main Banner Card */}
        <div
          className="relative w-full h-[440px] md:h-[500px] flex items-center bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero-desk.png')" }}
        >
          {/* Light Gradient Overlay for crisp text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-transparent md:w-[65%]"></div>
          
          {/* Content Box */}
          <div className="relative z-10 p-6 md:p-14 max-w-xl flex flex-col items-start gap-4">
            {/* Tabby & Tamara + Free Delivery Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 bg-[#16A2D4] text-white font-black text-xs uppercase tracking-wider rounded shadow-xs">
                FREE DELIVERY
              </span>
              <span className="px-3 py-1 bg-[#00F5D4] text-[#1A2A4E] font-black text-xs uppercase tracking-wider rounded shadow-xs">
                tabby
              </span>
              <span className="px-3 py-1 bg-[#FFD6A5] text-[#1A2A4E] font-black text-xs uppercase tracking-wider rounded shadow-xs">
                tamara
              </span>
            </div>

            {/* Headline in Primary Navy Blue */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1A2A4E] leading-tight tracking-tight">
              Free Shipping Over AED 300
            </h2>
            <p className="text-[#1A2A4E]/80 text-sm md:text-base font-medium leading-relaxed">
              Stock up on premium office essentials, paper reams, and ergonomic supplies with complimentary delivery & 4 interest-free installments with Tabby and Tamara.
            </p>
            {/* CTA Button in Deep Red */}
            <button
              onClick={scrollToCatalog}
              className="mt-2 px-6 py-3.5 bg-[#D93630] hover:bg-[#b82a25] text-white font-bold text-sm rounded-xl shadow-md transition-all btn-press flex items-center gap-2"
            >
              View Catalog <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Feature Badges Bar (Dedicated Support & Secure Payments removed; Tabby & Tamara added) */}
        <div className="w-full bg-white text-[#1A2A4E] py-6 px-6 md:px-12 border-t border-b border-gray-200 shadow-xs">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1200px] mx-auto">
            
            {/* Feature 1: Shipping Icon in Vibrant Cyan (#16A2D4) */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#16A2D4]/10 border border-[#16A2D4]/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[#16A2D4] text-[26px]">local_shipping</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#1A2A4E] leading-tight">Free Delivery</h4>
                <p className="text-xs text-[#1A2A4E]/70 mt-0.5">On orders over AED 300</p>
              </div>
            </div>

            {/* Feature 2: Quality Assured Icon in Golden Yellow (#F4B21B) */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#F4B21B]/10 border border-[#F4B21B]/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[#F4B21B] text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#1A2A4E] leading-tight">Quality Assured</h4>
                <p className="text-xs text-[#1A2A4E]/70 mt-0.5">100% genuine products</p>
              </div>
            </div>

            {/* Feature 3: Tabby Interest-Free Installments */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#00F5D4]/20 border border-[#00F5D4]/40 flex items-center justify-center flex-shrink-0 font-black text-[#1A2A4E] text-xs uppercase tracking-tighter">
                tabby
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#1A2A4E] leading-tight">Tabby Available</h4>
                <p className="text-xs text-[#1A2A4E]/70 mt-0.5">Split in 4 interest-free payments</p>
              </div>
            </div>

            {/* Feature 4: Tamara Easy Installments */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FFD6A5]/30 border border-[#FFD6A5]/50 flex items-center justify-center flex-shrink-0 font-black text-[#1A2A4E] text-xs uppercase tracking-tighter">
                tamara
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#1A2A4E] leading-tight">Tamara Available</h4>
                <p className="text-xs text-[#1A2A4E]/70 mt-0.5">Pay in 4 easy installments</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
