'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#1A2A4E] text-white pt-12 pb-24 md:pb-12 border-t border-white/10">
      <div className="max-w-[1280px] mx-auto px-margin-mobile grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col gap-3">
          <img src="/images/logo.png" alt="Yakda Stationery" className="h-14 w-auto object-contain self-start min-w-[160px]" />
          <p className="text-xs text-white/70 leading-relaxed">
            Leading supplier of office stationery, paper, pens, executive furniture, and high-performance printers in the
            UAE.
          </p>
        </div>

        <div>
          <h5 className="text-sm font-bold text-[#F4B21B] mb-3 uppercase tracking-wider">Quick Links</h5>
          <ul className="flex flex-col gap-2 text-xs text-white/80">
            <li><a href="#categories-section" className="hover:text-[#16A2D4] transition-colors">Categories</a></li>
            <li><a href="#favorites-section" className="hover:text-[#16A2D4] transition-colors">This Week's Favorites</a></li>
          </ul>
        </div>

        <div>
          <h5 className="text-sm font-bold text-[#F4B21B] mb-3 uppercase tracking-wider">Customer Support</h5>
          <ul className="flex flex-col gap-2 text-xs text-white/80">
            <li>Shipping & Next Day Delivery</li>
            <li>Returns & Warranty Policy</li>
            <li>Terms & Conditions</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        <div>
          <h5 className="text-sm font-bold text-[#F4B21B] mb-3 uppercase tracking-wider">Contact Us</h5>
          <p className="text-xs text-white/80 mb-2">Dubai, United Arab Emirates</p>
          <p className="text-xs text-white/80 mb-2">Email: support@yakda.ae</p>
          <p className="text-xs text-white/80">Phone: +971 4 000 0000</p>
        </div>
      </div>

      <div
        className="max-w-[1280px] mx-auto px-margin-mobile mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-xs text-white/60 gap-4"
      >
        <p>© 2026 Yakda UAE. All rights reserved.</p>

        {/* Tabby & Tamara Trust Badges */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-white/70">Payment Partners:</span>
          <span className="px-2 py-0.5 bg-[#00F5D4] text-[#1A2A4E] font-black rounded text-[10px] uppercase">tabby</span>
          <span className="px-2 py-0.5 bg-[#FFD6A5] text-[#1A2A4E] font-black rounded text-[10px] uppercase">tamara</span>
          <span className="px-2 py-0.5 bg-white/10 text-white font-bold rounded text-[10px]">CASH ON DELIVERY</span>
        </div>
      </div>
    </footer>
  );
}
