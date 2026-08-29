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
import { fetchCartFromDb, syncCartItemToDb } from '@/lib/actions/cart';
import { fetchFavoritesFromDb, toggleFavoriteInDb } from '@/lib/actions/favorites';

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
    // 1. Restore local session
    const savedUser = sessionStorage.getItem('yakda_logged_in_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setCurrentUser(u);
        if (u.is_admin) setIsAdmin(true);
      } catch (e) {
        console.error(e);
      }
    }
    const adminSession = sessionStorage.getItem('yakda_admin_logged_in') === 'true';
    if (adminSession) setIsAdmin(true);
  }, []);

  // Sync DB cart and favorites whenever user logs in
  useEffect(() => {
    if (currentUser?.id) {
      fetchCartFromDb(currentUser.id).then((dbCart) => {
        if (dbCart.length > 0) setCart(dbCart);
      });
      fetchFavoritesFromDb(currentUser.id).then((favIds) => {
        if (favIds.length > 0) setWishlist(new Set(favIds));
      });
    }
  }, [currentUser]);

  // Filter products by category
  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter((p) => (p.category || '').toLowerCase() === activeCategory.toLowerCase());

  // Add to Cart
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      let newQty = 1;
      let updatedCart: CartItem[];

      if (existing) {
        newQty = existing.quantity + 1;
        updatedCart = prev.map((item) =>
          item.id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        updatedCart = [
          ...prev,
          {
            id: product.id,
            sku: product.sku,
            title: product.title,
            price: Number(product.price),
            quantity: 1,
            image: product.image,
          },
        ];
      }

      if (currentUser?.id) {
        syncCartItemToDb(currentUser.id, product.id, newQty);
      }

      return updatedCart;
    });

    setIsCartOpen(true);
  };

  // Update Cart Quantity
  const handleUpdateQuantity = (id: string, newQty: number) => {
    setCart((prev) => {
      let updated: CartItem[];
      if (newQty <= 0) {
        updated = prev.filter((item) => item.id !== id);
      } else {
        updated = prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item));
      }

      if (currentUser?.id) {
        syncCartItemToDb(currentUser.id, id, newQty);
      }

      return updated;
    });
  };

  // Remove From Cart
  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    if (currentUser?.id) {
      syncCartItemToDb(currentUser.id, id, 0);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async (product: Product) => {
    const isFav = wishlist.has(product.id);
    setWishlist((prev) => {
      const next = new Set(prev);
      if (isFav) {
        next.delete(product.id);
      } else {
        next.add(product.id);
      }
      return next;
    });

    if (currentUser?.id) {
      await toggleFavoriteInDb(currentUser.id, product.id);
    }
  };

  // Initiate Checkout
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
    if (user.is_admin) setIsAdmin(true);
    sessionStorage.setItem('yakda_logged_in_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    sessionStorage.removeItem('yakda_logged_in_user');
    sessionStorage.removeItem('yakda_admin_logged_in');
    setIsProfileOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between pb-16 md:pb-0">
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

      {/* Main Storefront Body */}
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <HeroSection />

        {/* Category Pills & Filter Bar */}
        <CategoryPills
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={(slug) => setActiveCategory(slug)}
        />

        {/* Featured Products Grid */}
        <section id="favorites-section" className="py-10 px-margin-mobile max-w-[1280px] mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-2">
            <div>
              <h3 className="text-2xl font-bold text-[#1A2A4E] uppercase tracking-wide">
                This Week&apos;s Favorites
              </h3>
              <p className="text-xs md:text-sm text-[#1A2A4E]/70 mt-1">
                Top picks engineered for your modern workspace
              </p>
            </div>
            <span className="text-xs font-semibold text-gray-500">
              Showing {filteredProducts.length} items
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm bg-white rounded-2xl border border-gray-200">
              No products found in category &quot;{activeCategory}&quot;.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
