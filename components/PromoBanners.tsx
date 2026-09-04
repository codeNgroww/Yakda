'use client';

import React from 'react';

interface PromoBannerProps {
  onSelectCategory: (slug: string) => void;
}

export function PromoBannerSale({ onSelectCategory }: PromoBannerProps) {
  return (
    <section className="py-6 px-margin-mobile max-w-[1280px] mx-auto w-full">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1A2A4E] to-[#16A2D4] p-6 text-white shadow-md flex flex-col justify-between min-h-[160px] group w-full">
        <div className="relative z-10">
          <span className="px-2.5 py-1 bg-[#D93630] text-white font-black text-[10px] uppercase tracking-wider rounded">
            LIMITED TIME OFFER
          </span>
          <h4 className="text-xl font-black mt-2 leading-tight">Stationery Sale Up to 40% Off</h4>
          <p className="text-xs text-white/80 mt-1">On reams, notebooks, & desk organization</p>
        </div>
        <button
          onClick={() => onSelectCategory('paper')}
          className="relative z-10 self-start mt-3 px-4 py-2 bg-white text-[#1A2A4E] hover:bg-[#F4B21B] font-bold text-xs rounded-xl shadow-xs transition-all btn-press flex items-center gap-1"
        >
          Shop Offers <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </section>
  );
}

export function PromoBannerSchool({ onSelectCategory }: PromoBannerProps) {
  return (
    <section className="py-6 px-margin-mobile max-w-[1280px] mx-auto w-full">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#F4B21B] to-[#D93630] p-6 text-white shadow-md flex flex-col justify-between min-h-[160px] group w-full">
        <div className="relative z-10">
          <span className="px-2.5 py-1 bg-[#1A2A4E] text-white font-black text-[10px] uppercase tracking-wider rounded">
            NEW TERM READY
          </span>
          <h4 className="text-xl font-black mt-2 leading-tight">Back to School Essentials</h4>
          <p className="text-xs text-white/90 mt-1">Geometry sets, craft supplies, & bags</p>
        </div>
        <button
          onClick={() => onSelectCategory('crafts')}
          className="relative z-10 self-start mt-3 px-4 py-2 bg-[#1A2A4E] text-white hover:bg-black font-bold text-xs rounded-xl shadow-xs transition-all btn-press flex items-center gap-1"
        >
          Shop School <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </section>
  );
}

export function PromoBannerOffice({ onSelectCategory }: PromoBannerProps) {
  return (
    <section className="py-6 px-margin-mobile max-w-[1280px] mx-auto w-full">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#16A2D4] to-[#1A2A4E] p-6 text-white shadow-md flex flex-col justify-between min-h-[160px] group w-full">
        <div className="relative z-10">
          <span className="px-2.5 py-1 bg-[#F4B21B] text-[#1A2A4E] font-black text-[10px] uppercase tracking-wider rounded">
            PRODUCE MORE
          </span>
          <h4 className="text-xl font-black mt-2 leading-tight">Upgrade Your Workspace</h4>
          <p className="text-xs text-white/80 mt-1">High-speed shredders & office machines</p>
        </div>
        <button
          onClick={() => onSelectCategory('machines')}
          className="relative z-10 self-start mt-3 px-4 py-2 bg-white text-[#1A2A4E] hover:bg-[#F4B21B] font-bold text-xs rounded-xl shadow-xs transition-all btn-press flex items-center gap-1"
        >
          Shop Office <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </section>
  );
}
