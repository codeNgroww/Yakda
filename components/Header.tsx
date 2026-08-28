'use client';

import React from 'react';
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
  return (
    <header className="fixed top-0 inset-x-0 z-50 glass-nav shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
      <div className="max-w-[1280px] mx-auto h-16 px-margin-mobile flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3">
          <img
            alt="Yakda Stationery"
            className="h-11 md:h-12 w-auto object-contain transition-transform hover:scale-105"
            src="/images/logo.png"
          />
        </Link>

        {/* Desktop Navigation Menu */}
        <nav className="hidden md:flex items-center gap-8 font-semibold text-on-surface-variant text-sm">
          <Link href="/" className="text-primary hover:text-primary transition-colors border-b-2 border-primary py-1">
            Home
          </Link>
          <a href="#categories-section" className="hover:text-primary transition-colors py-1">
            Categories
          </a>
          <a href="#favorites-section" className="hover:text-primary transition-colors py-1">
            Favorites
          </a>
          {isAdmin && (
            <Link id="nav-admin-link" href="/admin" className="text-primary font-bold hover:text-primary/80 transition-colors py-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span> Admin
            </Link>
          )}
        </nav>

        {/* Action Icons */}
        <div className="flex items-center gap-3">
          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container btn-press"
            title="Search"
          >
            <span className="material-symbols-outlined text-[24px]">search</span>
          </button>

          {/* Cart Drawer Trigger */}
          <button
            onClick={onOpenCart}
            className="relative w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container btn-press"
            title="Shopping Cart"
          >
            <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-primary text-on-primary text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Account / Profile Button */}
          <button
            onClick={currentUser ? onOpenProfile : onOpenAuth}
            className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container transition-colors shadow-sm btn-press"
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
  );
}
