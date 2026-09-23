'use client';

import React from 'react';

const BRANDS = [
  { name: 'Uni-ball', style: 'text-[#E4002B] font-black italic' },
  { name: 'Sharpie', style: 'text-[#1A1A1A] font-black italic text-xl' },
  { name: 'Luxor', style: 'text-[#D4213D] font-extrabold' },
  { name: 'Rotring', style: 'text-[#CC0000] font-bold tracking-wider' },
  { name: 'Maped', style: 'text-[#009639] font-black italic' },
  { name: 'Paper Mate', style: 'text-[#003DA5] font-bold italic' },
  { name: 'BIC', style: 'text-[#FF6600] font-black text-xl tracking-wide' },
  { name: 'Zebra', style: 'text-[#1A1A1A] font-extrabold uppercase tracking-widest' },
  { name: 'LAMY', style: 'text-[#1A1A1A] font-light text-xl tracking-[0.3em] uppercase' },
  { name: 'Reynolds', style: 'text-[#003DA5] font-bold italic' },
  { name: 'Camel', style: 'text-[#1A1A1A] font-bold uppercase tracking-wider' },
  { name: 'Caran d\'Ache', style: 'text-[#1A1A1A] font-light tracking-wider' },
  { name: 'SAX', style: 'text-[#1A1A1A] font-black text-xl tracking-widest' },
  { name: 'Kores', style: 'text-[#E4002B] font-extrabold' },
  { name: 'Faber-Castell', style: 'text-[#006847] font-bold' },
  { name: 'Parker', style: 'text-[#1A1A1A] font-light tracking-[0.25em] uppercase' },
  { name: 'Tombow', style: 'text-[#1A1A1A] font-semibold tracking-wider' },
  { name: 'UHU', style: 'text-[#1A1A1A] font-black text-xl bg-[#FFD700] px-2 py-0.5 rounded' },
  { name: 'Scotch', style: 'text-[#CC0000] font-extrabold' },
  { name: 'Schneider', style: 'text-[#003DA5] font-bold' },
  { name: 'Mondi', style: 'text-[#006847] font-extrabold italic' },
  { name: 'Helix', style: 'text-white font-black bg-[#003DA5] px-2 py-0.5 rounded' },
  { name: 'Pentel', style: 'text-[#1A1A1A] font-bold tracking-wider' },
  { name: 'Pilot', style: 'text-[#003DA5] font-extrabold text-xl' },
  { name: 'Rhodia', style: 'text-[#FF6600] font-bold italic' },
  { name: 'tesa', style: 'text-white font-black bg-[#003DA5] px-2 py-0.5 rounded italic' },
  { name: 'Moleskine', style: 'text-[#1A1A1A] font-light tracking-[0.2em] uppercase text-sm' },
  { name: 'Staedtler', style: 'text-[#003DA5] font-bold' },
  { name: 'Kokuyo', style: 'text-[#1A1A1A] font-bold uppercase tracking-widest' },
  { name: 'LEUCHTTURM', style: 'text-[#1A1A1A] font-light tracking-[0.15em] uppercase text-sm' },
];

const BRANDS_ROW2 = [
  { name: 'Staples', style: 'text-[#CC0000] font-black text-xl uppercase' },
  { name: 'Leitz', style: 'text-[#003DA5] font-extrabold' },
  { name: 'Clairefontaine', style: 'text-[#003DA5] font-light italic tracking-wider' },
  { name: 'OfficeMax', style: 'text-[#CC0000] font-extrabold' },
  { name: 'Kinokuniya', style: 'text-[#1A1A1A] font-bold tracking-wider' },
  { name: 'Cambridge', style: 'text-[#006847] font-semibold italic' },
  { name: 'POSCA', style: 'text-[#E4002B] font-black text-xl tracking-wider' },
  { name: 'Canson', style: 'text-[#1A1A1A] font-bold tracking-[0.2em]' },
  { name: 'Cross', style: 'text-[#1A1A1A] font-light tracking-[0.3em] uppercase text-xl' },
  { name: '3M', style: 'text-[#CC0000] font-black text-2xl' },
  { name: 'Fellowes', style: 'text-[#003DA5] font-bold' },
  { name: 'Van Gogh', style: 'text-[#1A1A1A] font-light italic tracking-wider' },
  { name: 'Winsor & Newton', style: 'text-[#1A1A1A] font-bold text-sm tracking-wider' },
  { name: 'Crayola', style: 'text-[#006847] font-black text-xl italic' },
  { name: 'GlueDots', style: 'text-[#006847] font-extrabold italic' },
  { name: 'deli', style: 'text-[#003DA5] font-black text-xl lowercase' },
  { name: 'Derwent', style: 'text-[#CC0000] font-bold tracking-wider' },
  { name: 'Daler Rowney', style: 'text-[#1A1A1A] font-bold uppercase tracking-wider text-sm' },
  { name: 'Ratan', style: 'text-white font-black bg-[#CC0000] px-2 py-0.5 rounded' },
  { name: 'Sinar Line', style: 'text-[#003DA5] font-extrabold italic' },
  { name: 'Esselte', style: 'text-[#003DA5] font-bold' },
  { name: 'Copic', style: 'text-[#1A1A1A] font-light tracking-[0.3em] uppercase text-xl' },
  { name: 'Arches', style: 'text-[#1A1A1A] font-light tracking-[0.2em] uppercase' },
  { name: 'Gold Plus', style: 'text-[#B8860B] font-extrabold' },
  { name: 'Pauli', style: 'text-[#1A1A1A] font-bold text-xl' },
  { name: 'Post-it', style: 'text-[#1A1A1A] font-black bg-[#FFD700] px-2 py-0.5 rounded' },
  { name: 'Monami', style: 'text-[#003DA5] font-bold italic' },
  { name: 'WinPlus', style: 'text-[#1A1A1A] font-bold' },
  { name: 'Smart Copy', style: 'text-[#006847] font-semibold' },
  { name: 'Kuru Toga', style: 'text-[#6B3FA0] font-extrabold' },
];

function MarqueeRow({ brands, reverse = false }: { brands: typeof BRANDS; reverse?: boolean }) {
  return (
    <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
      <div
        className={`flex shrink-0 items-center gap-8 sm:gap-12 py-3 ${
          reverse ? 'animate-marquee-reverse' : 'animate-marquee'
        }`}
      >
        {/* Render brands twice for seamless loop */}
        {[...brands, ...brands].map((brand, idx) => (
          <span
            key={`${brand.name}-${idx}`}
            className={`whitespace-nowrap text-sm sm:text-base select-none transition-opacity hover:opacity-100 opacity-70 ${brand.style}`}
          >
            {brand.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function BrandMarquee() {
  return (
    <section className="py-8 md:py-12 bg-white border-y border-gray-100 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-margin-mobile mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 bg-[#1A2A4E]/10">
            <span className="material-symbols-outlined text-[20px] md:text-[24px] text-[#1A2A4E]" style={{ fontVariationSettings: "'FILL' 1" }}>
              handshake
            </span>
          </div>
          <div className="flex flex-col">
            <h3 className="text-base md:text-2xl font-black uppercase tracking-wider text-[#1A2A4E]">
              Our Brand Partners
            </h3>
            <p className="hidden sm:block text-xs md:text-sm mt-0.5 text-[#1A2A4E]/70">
              Trusted by 60+ global stationery &amp; office supply brands
            </p>
          </div>
        </div>
        <p className="sm:hidden text-[11px] mt-2 text-[#1A2A4E]/70">
          Trusted by 60+ global stationery &amp; office supply brands
        </p>
      </div>

      {/* Row 1 — scrolls left */}
      <MarqueeRow brands={BRANDS} />

      {/* Row 2 — scrolls right */}
      <MarqueeRow brands={BRANDS_ROW2} reverse />
    </section>
  );
}
