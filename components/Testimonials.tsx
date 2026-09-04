'use client';

import React from 'react';

export default function Testimonials() {
  return (
    <section className="py-12 px-margin-mobile bg-[#F9FAFB]">
      <div className="max-w-[1280px] mx-auto">
        {/* Header with Vibrant Cyan Quote Icon & Primary Navy Blue Title */}
        <div className="mb-8 text-center">
          <span className="material-symbols-outlined text-[42px] text-[#16A2D4] mb-1">
            format_quote
          </span>
          <h3 className="text-2xl md:text-3xl font-bold text-[#1A2A4E]">What Our Clients Say</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Testimonial 1 */}
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-xs flex flex-col justify-between">
            {/* 5-Star Rating in Golden Yellow (#F4B21B) */}
            <div className="flex text-[#F4B21B] mb-3">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
              ))}
            </div>
            <p className="text-sm text-[#1A2A4E]/80 italic mb-4 leading-relaxed">
              &quot;We had to be ready with our new office by Sunday. Thursday we ordered Yakda Supplies for 40 workplaces - we received everything by Saturday lunchtime! Great Team.&quot;
            </p>
            <span className="text-xs font-bold text-[#1A2A4E]">- Avolta</span>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-xs flex flex-col justify-between">
            {/* 5-Star Rating in Golden Yellow (#F4B21B) */}
            <div className="flex text-[#F4B21B] mb-3">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
              ))}
            </div>
            <p className="text-sm text-[#1A2A4E]/80 italic mb-4 leading-relaxed">
              &quot;Very clean and well organized, with everything you need from ink pens, chairs, or desks. A great staff will take good care of you.&quot;
            </p>
            <span className="text-xs font-bold text-[#1A2A4E]">- Zabeel Palace</span>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-xs flex flex-col justify-between">
            {/* 5-Star Rating in Golden Yellow (#F4B21B) */}
            <div className="flex text-[#F4B21B] mb-3">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
              ))}
            </div>
            <p className="text-sm text-[#1A2A4E]/80 italic mb-4 leading-relaxed">
              &quot;I just wanted to give feedback on the delivery person. He was very polite, respectful and professional over the phone and until delivery.&quot;
            </p>
            <span className="text-xs font-bold text-[#1A2A4E]">- Berkeley</span>
          </div>

        </div>
      </div>
    </section>
  );
}
