'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-inverse-surface text-inverse-on-surface pt-12 pb-24 md:pb-12 border-t border-outline-variant">
      <div className="max-w-[1280px] mx-auto px-margin-mobile grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col gap-3">
          <h4 className="text-lg font-bold text-white">Yakda</h4>
          <p className="text-xs text-inverse-on-surface/70">
            Leading supplier of office stationery, paper, pens, executive furniture, and high-performance printers in the
            UAE.
          </p>
        </div>

        <div>
          <h5 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Quick Links</h5>
          <ul className="flex flex-col gap-2 text-xs text-inverse-on-surface/80">
            <li><a href="#categories-section" className="hover:text-primary-fixed">Categories</a></li>
            <li><a href="#favorites-section" className="hover:text-primary-fixed">This Week's Favorites</a></li>
          </ul>
        </div>

        <div>
          <h5 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Customer Support</h5>
          <ul className="flex flex-col gap-2 text-xs text-inverse-on-surface/80">
            <li>Shipping & Next Day Delivery</li>
            <li>Returns & Warranty Policy</li>
            <li>Terms & Conditions</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        <div>
          <h5 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Contact Us</h5>
          <p className="text-xs text-inverse-on-surface/80 mb-2">Dubai, United Arab Emirates</p>
          <p className="text-xs text-inverse-on-surface/80 mb-2">Email: support@yakda.ae</p>
          <p className="text-xs text-inverse-on-surface/80">Phone: +971 4 000 0000</p>
        </div>
      </div>

      <div
        className="max-w-[1280px] mx-auto px-margin-mobile mt-8 pt-6 border-t border-inverse-on-surface/10 flex flex-col sm:flex-row justify-between items-center text-xs text-inverse-on-surface/60 gap-4"
      >
        <p>© 2026 Yakda UAE. All rights reserved.</p>
        <p className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">local_shipping</span> 24/7 Next-Day Express Logistics
        </p>
      </div>
    </footer>
  );
}
