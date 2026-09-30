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
  allProducts: Product[];
}

export default function GlobalNav({ categories, allProducts }: GlobalNavProps) {
  const router = useRouter();
  
  const {
    cart,
    cartCount,
    wishlistCount,
    currentUser,
    isAdmin,
    addToCart,
    updateQuantity,
    removeFromCart,
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
        cart={cart}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onInitiateCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />
      
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={allProducts}
        onAddToCart={addToCart}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={login}
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
        currentUser={currentUser}
        onOpenAuth={() => {
          setIsOrdersOpen(false);
          setIsAuthOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        cart={cart}
        currentUser={currentUser}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={() => {
          setIsCheckoutOpen(false);
        }}
      />
    </>
  );
}

