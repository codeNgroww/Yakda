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
    <section className="relative w-full overflow-hidden bg-surface-container-highest border-b border-outline-variant">
      <div className="max-w-[1280px] mx-auto">
        
        {/* Hero Main Card */}
        <div
          className="relative w-full h-[440px] md:h-[500px] flex items-center bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero-desk.png')" }}
        >
          {/* Light Gradient Overlay for crisp text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent md:w-[65%]"></div>
          
          {/* Content Box */}
          <div className="relative z-10 p-6 md:p-14 max-w-xl flex flex-col items-start gap-4">
            <span className="px-3.5 py-1 bg-[#004d40] text-white font-extrabold text-xs uppercase tracking-wider rounded shadow-sm">
              FREE DELIVERY
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#003833] leading-tight tracking-tight">
              Free Shipping Over AED 300
            </h2>
            <p className="text-[#2b3a38] text-sm md:text-base font-medium leading-relaxed">
              Stock up on premium office essentials, paper reams, and ergonomic chairs with complimentary delivery.
            </p>
            <button
              onClick={scrollToCatalog}
              className="mt-2 px-6 py-3.5 bg-[#004d40] hover:bg-[#003833] text-white font-bold text-sm rounded-lg shadow-md transition-all btn-press flex items-center gap-2"
            >
              View Catalog <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Full-Width Bottom Feature Bar */}
        <div className="w-full bg-[#004d40] text-white py-5 px-6 md:px-12 shadow-sm">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1200px] mx-auto">
            
            {/* Feature 1 */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-white text-[24px]">local_shipping</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-white leading-tight">Free Delivery</h4>
                <p className="text-xs text-white/80 mt-0.5">On orders over AED 300</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-white text-[24px]">verified</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-white leading-tight">Quality Assured</h4>
                <p className="text-xs text-white/80 mt-0.5">Premium office essentials</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-white text-[24px]">support_agent</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-white leading-tight">Dedicated Support</h4>
                <p className="text-xs text-white/80 mt-0.5">We're here to help</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-white text-[24px]">lock</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-white leading-tight">Secure Payments</h4>
                <p className="text-xs text-white/80 mt-0.5">Safe & trusted checkout</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
