'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserProfile } from '@/types/database';

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  currentUser: UserProfile | null;
  isAdmin: boolean;
  onOpenSearch: () => void;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

export default function Header({
  cartCount,
  wishlistCount,
  currentUser,
  isAdmin,
  onOpenSearch,
  onOpenCart,
  onOpenAuth,
  onOpenProfile,
}: HeaderProps) {
  const [activeMobileTab, setActiveMobileTab] = useState<'home' | 'categories' | 'favorites' | 'account' | 'cart'>('home');

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
      {/* Top Navigation Header (Desktop + Mobile Search & Logo) */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#1A2A4E] text-white shadow-md pt-safe">
        <div className="max-w-[1280px] mx-auto h-16 px-margin-mobile flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3">
            <img
              alt="Yakda Stationery"
              className="h-10 md:h-12 w-auto object-contain transition-transform hover:scale-105"
              src="/images/logo.png"
            />
          </Link>

          {/* Desktop Navigation Menu */}
          <nav className="hidden md:flex items-center gap-8 font-semibold text-white text-sm">
            <Link
              href="/"
              className="text-[#16A2D4] border-b-2 border-[#16A2D4] py-1 transition-colors hover:text-[#16A2D4]"
            >
              Home
            </Link>
            <a
              href="#categories-section"
              className="hover:text-[#16A2D4] transition-colors py-1"
            >
              Categories
            </a>
            <a
              href="#favorites-section"
              className="hover:text-[#16A2D4] transition-colors py-1"
            >
              Favorites
            </a>
            {isAdmin && (
              <Link
                id="nav-admin-link"
                href="/admin"
                className="text-[#F4B21B] font-bold hover:text-[#F4B21B]/80 transition-colors py-1 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span> Admin
              </Link>
            )}
          </nav>

          {/* Desktop Action Icons / Mobile Search & Cart Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center text-white hover:text-[#F4B21B] transition-colors rounded-full hover:bg-white/10 btn-press"
              title="Search"
            >
              <span className="material-symbols-outlined text-[22px] md:text-[24px]">search</span>
            </button>

            {/* Desktop Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="hidden md:flex relative w-11 h-11 items-center justify-center text-white hover:text-[#F4B21B] transition-colors rounded-full hover:bg-white/10 btn-press"
              title="Shopping Cart"
            >
              <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-[#D93630] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Desktop User Account Trigger */}
            <button
              onClick={currentUser ? onOpenProfile : onOpenAuth}
              className="hidden md:flex w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white hover:text-[#F4B21B] hover:bg-white/20 transition-all items-center justify-center shadow-sm btn-press"
              title={currentUser ? currentUser.email : "Account / Sign In"}
            >
              {currentUser ? (
                <span className="font-bold text-xs">
                  {(currentUser.email || 'U')[0].toUpperCase()}
                </span>
              ) : (
                <span className="material-symbols-outlined text-[20px]">person</span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Instagram-Inspired Premium Mobile Bottom Navigation Bar */}
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
