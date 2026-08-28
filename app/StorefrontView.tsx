'use client';

import React, { useState, useEffect } from 'react';
import { Product, Category, CartItem, UserProfile } from '@/types/database';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CategoryPills from '@/components/CategoryPills';
import ProductCard from '@/components/ProductCard';
import Testimonials from '@/components/Testimonials';
import CartDrawer from '@/components/CartDrawer';
import SearchModal from '@/components/SearchModal';
import AuthModal from '@/components/AuthModal';
import ProfileModal from '@/components/ProfileModal';
import CheckoutModal from '@/components/CheckoutModal';
import Footer from '@/components/Footer';

interface StorefrontViewProps {
  initialProducts: Product[];
  initialCategories: Category[];
}

export default function StorefrontView({
  initialProducts,
  initialCategories,
}: StorefrontViewProps) {
  const [products] = useState<Product[]>(initialProducts);
  const [categories] = useState<Category[]>(initialCategories);
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set(['8494']));
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Modals visibility state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    // Check local session
    const savedUser = sessionStorage.getItem('yakda_logged_in_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }
    const adminSession = sessionStorage.getItem('yakda_admin_logged_in') === 'true';
    setIsAdmin(adminSession);
  }, []);

  // Filter Products
  const filteredProducts =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory);

  // Cart Operations
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          sku: product.sku,
          title: product.title,
          price: product.price,
          image: product.image,
          quantity: 1,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Favorite / Wishlist Operations
  const handleToggleFavorite = (product: Product) => {
    setWishlist((prev) => {
      const updated = new Set(prev);
      if (updated.has(product.id)) {
        updated.delete(product.id);
      } else {
        updated.add(product.id);
      }
      return updated;
    });
  };

  const handleInitiateCheckout = () => {
    if (!currentUser) {
      setIsCartOpen(false);
      setIsAuthOpen(true);
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    sessionStorage.setItem('yakda_logged_in_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('yakda_logged_in_user');
    setIsProfileOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Header */}
      <Header
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.size}
        currentUser={currentUser}
        isAdmin={isAdmin}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 w-full pt-16 pb-20 md:pb-12 bg-surface">
        {/* Hero Section */}
        <HeroSection />

        {/* Categories Section */}
        <CategoryPills
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

        {/* Favorites Catalog Section */}
        <section id="favorites-section" className="py-10 px-margin-mobile">
          <div className="max-w-[1280px] mx-auto">
            <div className="mb-8 text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-on-surface uppercase tracking-wide">
                This Week's Favorites
              </h3>
              <p className="text-sm md:text-base text-on-surface-variant">
                Top picks engineered for your modern workspace
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center text-outline flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[48px]">inventory_2</span>
                <p className="text-sm font-semibold">No products found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isFavorite={wishlist.has(product.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}

            <div className="mt-8 text-center max-w-xs mx-auto">
              <button
                onClick={() => setActiveCategory('all')}
                className="px-6 py-3 border border-primary text-primary font-semibold text-sm rounded hover:bg-primary/5 transition-colors w-full btn-press"
              >
                View All Favorites
              </button>
            </div>
          </div>
        </section>

        {/* Client Testimonials Section */}
        <Testimonials />
      </main>

      {/* Footer */}
      <Footer />

      {/* Slide & Fade Modals */}
      <CartDrawer
        isOpen={isCartOpen}
        cart={cart}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onInitiateCheckout={handleInitiateCheckout}
      />

      <SearchModal
        isOpen={isSearchOpen}
        products={products}
        onClose={() => setIsSearchOpen(false)}
        onAddToCart={handleAddToCart}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        user={currentUser}
        onClose={() => setIsProfileOpen(false)}
        onLogout={handleLogout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        cart={cart}
        currentUser={currentUser}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={() => {
          setCart([]);
          alert('Order placed successfully! Notifications sent to WhatsApp and Email.');
        }}
      />
    </div>
  );
}
