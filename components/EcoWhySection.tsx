'use client';

import React from 'react';

export default function EcoWhySection() {
  const cards = [
    {
      icon: 'recycling',
      title: '♻ Recycled Materials',
      desc: 'Crafted from post-consumer waste & reclaimed fibers to minimize landfill footprint.',
    },
    {
      icon: 'nature_people',
      title: '🌱 Better Everyday Choices',
      desc: 'High-performance office supplies that reduce carbon impact without compromising quality.',
    },
    {
      icon: 'archive',
      title: '📦 Reduced Plastic Packaging',
      desc: 'Shipped in plastic-free, 100% biodegradable kraft packaging and paper tape.',
    },
  ];

  return (
    <section className="py-8 bg-[#F7F6EF] border-t border-b border-[#DCE5D8]">
      <div className="max-w-[1280px] mx-auto px-margin-mobile">
        <div className="text-center mb-6">
          <h3 className="text-xl sm:text-2xl font-black text-[#2C3E30] flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[#527A5A]">forest</span>
            Why Choose Eco-Friendly?
          </h3>
          <p className="text-xs sm:text-sm text-[#2C3E30]/70 mt-1">
            Engineered stationery essentials that care for your workspace and the planet
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#DCE5D8] rounded-2xl p-5 shadow-2xs flex flex-col items-center text-center gap-2 hover:border-[#527A5A] transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-[#E6EFE5] text-[#527A5A] flex items-center justify-center mb-1">
                <span className="material-symbols-outlined text-[26px]">{card.icon}</span>
              </div>
              <h4 className="text-sm font-extrabold text-[#2C3E30]">{card.title}</h4>
              <p className="text-xs text-[#2C3E30]/75 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
