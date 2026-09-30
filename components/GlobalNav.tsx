'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import CartDrawer from '@/components/CartDrawer';
import SearchModal from '@/components/SearchModal';
import AuthModal from '@/components/AuthModal';
import ProfileModal from '@/components/ProfileModal';
import OrdersModal from '@/components/OrdersModal';
import CheckoutModal from '@/components/CheckoutModal';
import { useCart } from '@/context/CartContext';
import { Category, Product } from '@/types/database';

interface GlobalNavProps {
  categories: Category[];
  allProducts: Product[]; // needed for search modal
}

export default function GlobalNav({ categories, allProducts }: GlobalNavProps) {
  const router = useRouter();
  
  const {
    cartCount,
    wishlistCount,
    currentUser,
    isAdmin,
    login,
    logout,
    isCartOpen,
    setIsCartOpen,
    isAuthOpen,
    setIsAuthOpen,
    isProfileOpen,
    setIsProfileOpen,
    isOrdersOpen,
    setIsOrdersOpen,
  } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
  };

  const handleSelectCategory = (slug: string) => {
    // Navigate to homepage with category selected or just go to home
    router.push(`/?category=${slug}`);
  };

  return (
    <>
      <Header
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        currentUser={currentUser}
        isAdmin={isAdmin}
        activeCategory="all"
        onSelectCategory={handleSelectCategory}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        categories={categories}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />
      
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={allProducts}
        onSelectProduct={(p) => {
          setIsSearchOpen(false);
          router.push(`/products/${p.slug}`);
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={login}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
        onLogout={() => {
          logout();
          setIsProfileOpen(false);
        }}
      />

      <OrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        user={currentUser}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </>
  );
}
