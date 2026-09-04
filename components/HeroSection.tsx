'use client';

import React, { useState, useEffect } from 'react';

interface HeroSectionProps {
  onOpenSearch?: () => void;
  onSelectEcoCategory?: () => void;
}

const SLIDES = [
  '/images/hero-slide-3.jpg', // Stationery
  '/images/hero-slide-2.jpg', // Books
  '/images/hero-slide-1.jpg', // Toys
];

export default function HeroSection({ onOpenSearch, onSelectEcoCategory }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000); // 5 second delay

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-surface border-b border-outline-variant">
      <div className="max-w-[1280px] mx-auto relative">
        
        {/* Slider Container */}
        <div className="relative w-full h-[220px] sm:h-[340px] md:h-[460px] flex items-center bg-gray-100 overflow-hidden">
          {SLIDES.map((slide, index) => (
            <div
              key={slide}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
              style={{ 
                backgroundImage: `url('${slide}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
          ))}

          {/* Navigation Dots */}
          <div className="absolute bottom-10 inset-x-0 z-20 flex justify-center gap-2">
            {SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentSlide ? 'bg-[#16A2D4] w-6' : 'bg-black/20 hover:bg-black/40'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Prominent Single Curved Middle Search Bar (3/4th screen width) */}
        <div className="w-3/4 max-w-xl mx-auto relative z-30 -mt-6 sm:-mt-8 mb-2">
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

      </div>
    </section>
  );
}
