'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserProfile } from '@/types/database';
import CategoryMegaMenu from './CategoryMegaMenu';

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  currentUser: UserProfile | null;
  isAdmin: boolean;
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
  onOpenSearch: () => void;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Header({
  cartCount,
  wishlistCount,
  currentUser,
  isAdmin,
  activeCategory,
  onSelectCategory,
  onOpenSearch,
  onOpenCart,
  onOpenAuth,
  onOpenProfile,
  searchQuery,
  onSearchChange,
}: HeaderProps) {
  const [activeMobileTab, setActiveMobileTab] = useState<'home' | 'categories' | 'favorites' | 'account' | 'cart'>('home');
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const catSection = document.getElementById('categories-section');
      const favSection = document.getElementById('favorites-section');
      const scrollY = window.scrollY;

      if (favSection && scrollY >= favSection.offsetTop - 200) {
        setActiveMobileTab('favorites');
      } else if (catSection && scrollY >= catSection.offsetTop - 200) {
        setActiveMobileTab('categories');
      } else {
        setActiveMobileTab('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string, tabName: 'home' | 'categories' | 'favorites') => {
    setActiveMobileTab(tabName);
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      {/* Top Header in Warm Off-White (#FAF9F6) */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#FAF9F6] text-[#1A2A4E] border-b border-gray-200/90 shadow-xs pt-safe transition-all">
        {/* Top Notification Strip with Tabby & Tamara */}
        <div className="bg-[#1A2A4E] text-white text-[11px] font-semibold py-1 px-4 text-center flex items-center justify-center gap-2">
          <span>🚚 Free Express Shipping Over AED 300</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline flex items-center gap-1.5">
            💳 Pay in 4 Interest-Free Payments with 
            <span className="px-1.5 py-0.2 bg-[#00F5D4] text-[#1A2A4E] font-black rounded text-[9px] uppercase">tabby</span>
            &amp;
            <span className="px-1.5 py-0.2 bg-[#FFD6A5] text-[#1A2A4E] font-black rounded text-[9px] uppercase">tamara</span>
          </span>
        </div>

        <div className="max-w-[1280px] mx-auto h-16 md:h-18 px-margin-mobile flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <img
              alt="Yakda Stationery"
              className="h-14 md:h-16 w-auto min-w-[170px] max-w-[260px] object-contain transition-transform hover:scale-105"
              src="/images/logo.png"
            />
          </Link>

          {/* Desktop Category Mega Menu Dropdown Trigger */}
          <div className="hidden lg:relative lg:flex items-center">
            <button
              onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#1A2A4E] hover:text-[#16A2D4] rounded-xl hover:bg-gray-100/70 transition-all btn-press"
            >
              <span className="material-symbols-outlined text-[20px] text-[#16A2D4]">grid_view</span>
              Categories
              <span className="material-symbols-outlined text-[16px] text-gray-500">
                {isMegaMenuOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
              </span>
            </button>
          </div>

          {/* Prominent Noon-Style Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl relative">
            <div className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 flex items-center gap-2 focus-within:border-[#16A2D4] focus-within:ring-2 focus-within:ring-[#16A2D4]/20 shadow-2xs transition-all">
              <span className="material-symbols-outlined text-gray-400 text-[20px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={onOpenSearch}
                placeholder="What are you looking for? (e.g. Pens, Paper A4, Printers, SKU...)"
                className="w-full bg-transparent text-xs font-medium text-[#1A2A4E] placeholder:text-gray-400 focus:outline-none"
              />
              {searchQuery && (
                <button onClick={() => onSearchChange('')} className="text-gray-400 hover:text-gray-600">
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Desktop & Mobile Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            
            {/* Mobile Search Button */}
            <button
              onClick={onOpenSearch}
              className="md:hidden w-10 h-10 flex items-center justify-center text-[#1A2A4E] hover:text-[#16A2D4] transition-colors rounded-full hover:bg-gray-200/50 btn-press"
              title="Search"
            >
              <span className="material-symbols-outlined text-[22px]">search</span>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-[#1A2A4E]">
              <Link href="/" className="hover:text-[#16A2D4] transition-colors py-1">
                Home
              </Link>
              <a href="#categories-section" className="hover:text-[#16A2D4] transition-colors py-1">
                Shop Catalog
              </a>
              <a href="#favorites-section" className="hover:text-[#16A2D4] transition-colors py-1 flex items-center gap-1">
                Favorites
                {wishlistCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-[#F4B21B] text-[#1A2A4E] text-[10px] font-black rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </a>
              {isAdmin && (
                <Link href="/admin" className="text-[#D93630] hover:underline font-black">
                  Admin Panel
                </Link>
              )}
            </nav>

            {/* Desktop Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="hidden md:flex relative px-4 py-2 bg-[#1A2A4E] hover:bg-[#13203c] text-white text-xs font-bold rounded-xl shadow-xs transition-all items-center gap-2 btn-press"
              title="Shopping Cart"
            >
              <span className="material-symbols-outlined text-[20px] text-[#16A2D4]">shopping_cart</span>
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-[#D93630] text-white text-[11px] font-black rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth Button */}
            <button
              onClick={currentUser ? onOpenProfile : onOpenAuth}
              className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white border border-gray-300 text-[#1A2A4E] hover:border-[#16A2D4] hover:text-[#16A2D4] transition-all flex items-center justify-center shadow-2xs btn-press"
              title={currentUser ? currentUser.email : "Sign In / Register"}
            >
              {currentUser ? (
                <span className="font-extrabold text-xs">
                  {(currentUser.email || 'U')[0].toUpperCase()}
                </span>
              ) : (
                <span className="material-symbols-outlined text-[20px]">person</span>
              )}
            </button>
          </div>

        </div>

        {/* Interactive Desktop Mega Menu */}
        <CategoryMegaMenu
          categories={[]}
          activeCategory={activeCategory}
          onSelectCategory={onSelectCategory}
          isOpen={isMegaMenuOpen}
          onClose={() => setIsMegaMenuOpen(false)}
        />
      </header>

      {/* Instagram-Style Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-[#1A2A4E] text-white border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.25)] pb-safe backdrop-blur-lg">
        <div className="grid grid-cols-5 h-16 max-w-md mx-auto items-center">
          
          {/* Tab 1: Home */}
          <button
            onClick={() => scrollToSection('top', 'home')}
            className={`flex flex-col items-center justify-center py-1 transition-all active:scale-90 ${
              activeMobileTab === 'home' ? 'text-[#16A2D4]' : 'text-white/70 hover:text-white'
            }`}
          >
            <span
              className="material-symbols-outlined text-[24px] mb-0.5"
              style={{ fontVariationSettings: activeMobileTab === 'home' ? "'FILL' 1" : "'FILL' 0" }}
            >
              home
            </span>
            <span className="text-[10px] font-semibold tracking-tight">Home</span>
          </button>

          {/* Tab 2: Categories */}
          <button
            onClick={() => scrollToSection('categories-section', 'categories')}
            className={`flex flex-col items-center justify-center py-1 transition-all active:scale-90 ${
              activeMobileTab === 'categories' ? 'text-[#16A2D4]' : 'text-white/70 hover:text-white'
            }`}
          >
            <span
              className="material-symbols-outlined text-[24px] mb-0.5"
              style={{ fontVariationSettings: activeMobileTab === 'categories' ? "'FILL' 1" : "'FILL' 0" }}
            >
              grid_view
            </span>
            <span className="text-[10px] font-semibold tracking-tight">Categories</span>
          </button>

          {/* Tab 3: Favorites */}
          <button
            onClick={() => scrollToSection('favorites-section', 'favorites')}
            className={`relative flex flex-col items-center justify-center py-1 transition-all active:scale-90 ${
              activeMobileTab === 'favorites' ? 'text-[#16A2D4]' : 'text-white/70 hover:text-white'
            }`}
          >
            <span
              className="material-symbols-outlined text-[24px] mb-0.5"
              style={{ fontVariationSettings: activeMobileTab === 'favorites' ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
            <span className="text-[10px] font-semibold tracking-tight">Favorites</span>
            {wishlistCount > 0 && (
              <span className="absolute top-1.5 right-3 min-w-[15px] h-[15px] px-1 bg-[#F4B21B] text-[#1A2A4E] text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Tab 4: Account */}
          <button
            onClick={() => {
              setActiveMobileTab('account');
              currentUser ? onOpenProfile() : onOpenAuth();
            }}
            className={`flex flex-col items-center justify-center py-1 transition-all active:scale-90 ${
              activeMobileTab === 'account' ? 'text-[#16A2D4]' : 'text-white/70 hover:text-white'
            }`}
          >
            {currentUser ? (
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] mb-0.5 border ${
                  activeMobileTab === 'account'
                    ? 'bg-[#16A2D4] text-white border-white'
                    : 'bg-white/20 text-white border-white/40'
                }`}
              >
                {(currentUser.email || 'U')[0].toUpperCase()}
              </div>
            ) : (
              <span
                className="material-symbols-outlined text-[24px] mb-0.5"
                style={{ fontVariationSettings: activeMobileTab === 'account' ? "'FILL' 1" : "'FILL' 0" }}
              >
                account_circle
              </span>
            )}
            <span className="text-[10px] font-semibold tracking-tight">Account</span>
          </button>

          {/* Tab 5: Cart */}
          <button
            onClick={() => {
              setActiveMobileTab('cart');
              onOpenCart();
            }}
            className={`relative flex flex-col items-center justify-center py-1 transition-all active:scale-90 ${
              activeMobileTab === 'cart' ? 'text-[#16A2D4]' : 'text-white/70 hover:text-white'
            }`}
          >
            <span
              className="material-symbols-outlined text-[24px] mb-0.5"
              style={{ fontVariationSettings: activeMobileTab === 'cart' ? "'FILL' 1" : "'FILL' 0" }}
            >
              shopping_cart
            </span>
            <span className="text-[10px] font-semibold tracking-tight">Cart</span>
            {cartCount > 0 && (
              <span className="absolute top-1 right-2.5 min-w-[16px] h-[16px] px-1 bg-[#D93630] text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </button>

        </div>
      </nav>
    </>
  );
}
