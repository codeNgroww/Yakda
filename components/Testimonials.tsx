'use client';

import React from 'react';

export default function Testimonials() {
  return (
    <section className="py-12 px-margin-mobile bg-surface">
      <div className="max-w-[1280px] mx-auto">
        <div className="mb-8 text-center">
          <span className="material-symbols-outlined text-[36px] text-primary mb-1">format_quote</span>
          <h3 className="text-2xl md:text-3xl font-bold text-on-surface">What Our Clients Say</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Testimonial 1 */}
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex text-primary mb-3">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
              ))}
            </div>
            <p className="text-sm text-on-surface-variant italic mb-4">
              &quot;We had to be ready with our new office by Sunday. Thursday we ordered Yakda Supplies for 40 workplaces - we received everything by Saturday lunchtime! Great Team.&quot;
            </p>
            <span className="text-xs font-bold text-on-surface">- Mohammed L., Dubai</span>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex text-primary mb-3">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
              ))}
            </div>
            <p className="text-sm text-on-surface-variant italic mb-4">
              &quot;Very clean and well organized, with everything you need from ink pens, chairs, or desks. A great staff will take good care of you.&quot;
            </p>
            <span className="text-xs font-bold text-on-surface">- Greg C., Dubai</span>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex text-primary mb-3">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
              ))}
            </div>
            <p className="text-sm text-on-surface-variant italic mb-4">
              &quot;I just wanted to give feedback on the delivery person. He was very polite, respectful and professional over the phone and until delivery.&quot;
            </p>
            <span className="text-xs font-bold text-on-surface">- Fatima K., Abu Dhabi</span>
          </div>

        </div>
      </div>
    </section>
  );
}
