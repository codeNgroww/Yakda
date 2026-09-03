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
import FilterSortBar, { SortOption } from '@/components/FilterSortBar';
import PromoBanners from '@/components/PromoBanners';
import SkeletonLoader from '@/components/SkeletonLoader';
import QuickViewModal from '@/components/QuickViewModal';
import EcoHeroSection from '@/components/EcoHeroSection';
import EcoAttributesBar from '@/components/EcoAttributesBar';
import EcoWhySection from '@/components/EcoWhySection';
import MobileCategoryDrawer from '@/components/MobileCategoryDrawer';
import MobileFilterDrawer from '@/components/MobileFilterDrawer';
import OrdersModal from '@/components/OrdersModal';
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
  const [activeSubCategory, setActiveSubCategory] = useState('all');
  const [selectedEcoAttribute, setSelectedEcoAttribute] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set(['8494']));
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Modals & Mobile Drawers state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Restore local session
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

  // Sync DB cart and favorites when user is logged in
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

  // Handle Category Selection with Skeleton Loading Simulation
  const handleSelectCategory = (slug: string) => {
    setIsLoadingProducts(true);
    setActiveCategory(slug);
    setActiveSubCategory('all');
    setTimeout(() => {
      setIsLoadingProducts(false);
    }, 250);
  };

  // Filter Products
  let filteredProducts = products.filter((p) => {
    // 1. Category Filter
    if (activeCategory !== 'all') {
      const pCat = (p.category || '').toLowerCase();
      const combinedText = `${p.title} ${p.description || ''} ${p.badge || ''} ${pCat}`.toLowerCase();

      if (activeCategory === 'eco') {
        const isEcoMatch =
          pCat === 'eco' ||
          combinedText.includes('recycled') ||
          combinedText.includes('eco') ||
          combinedText.includes('bamboo') ||
          combinedText.includes('biodegradable') ||
          combinedText.includes('sustainable') ||
          combinedText.includes('fsc') ||
          combinedText.includes('plastic-free') ||
          combinedText.includes('kraft');

        if (!isEcoMatch) return false;

        // Eco Attribute Filter
        if (selectedEcoAttribute !== 'all') {
          if (selectedEcoAttribute === 'recycled' && !combinedText.includes('recycled') && !combinedText.includes('recycle')) return false;
          if (selectedEcoAttribute === 'sustainable' && !combinedText.includes('sustainable') && !combinedText.includes('bamboo')) return false;
          if (selectedEcoAttribute === 'fsc' && !combinedText.includes('fsc') && !combinedText.includes('forest')) return false;
          if (selectedEcoAttribute === 'plastic-free' && !combinedText.includes('plastic') && !combinedText.includes('kraft')) return false;
          if (selectedEcoAttribute === 'biodegradable' && !combinedText.includes('biodegradable') && !combinedText.includes('natural')) return false;
        }
      } else if (pCat !== activeCategory.toLowerCase()) {
        return false;
      }
    }
    // 2. SubCategory Filter
    if (activeSubCategory !== 'all') {
      const pCat = (p.category || '').toLowerCase();
      if (!pCat.includes(activeSubCategory.toLowerCase())) {
        return false;
      }
    }
    // 3. Badge Filter
    if (selectedBadge !== 'all') {
      if ((p.badge || '').toLowerCase() !== selectedBadge.toLowerCase()) {
        return false;
      }
    }
    // 4. In Stock Filter
    if (inStockOnly && p.in_stock === false) {
      return false;
    }
    // 5. Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      const matchCat = (p.category || '').toLowerCase().includes(q);
      if (!matchTitle && !matchSku && !matchCat) return false;
    }
    return true;
  });

  // Sort Products
  filteredProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'newest') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    if (sortBy === 'popular') return (b.badge ? 1 : 0) - (a.badge ? 1 : 0);
    return 0; // Default featured
  });

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
      {/* Off-White Header (#FAF9F6) */}
      <Header
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.size}
        currentUser={currentUser}
        isAdmin={isAdmin}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenOrders={() => setIsOrdersOpen(true)}
      />

      {/* Main Storefront Body */}
      <main className={`flex-1 pt-16 md:pt-18 transition-colors ${activeCategory === 'eco' ? 'bg-[#F7F6EF]' : ''}`}>
        {/* Hero Section */}
        {activeCategory === 'eco' ? (
          <>
            <EcoHeroSection
              onScrollToCatalog={() => {
                const el = document.getElementById('favorites-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onShopAllProducts={() => handleSelectCategory('all')}
            />
            <EcoAttributesBar
              selectedAttribute={selectedEcoAttribute}
              onSelectAttribute={setSelectedEcoAttribute}
            />
          </>
        ) : (
          <HeroSection
            onOpenSearch={() => setIsSearchOpen(true)}
            onSelectEcoCategory={() => handleSelectCategory('eco')}
          />
        )}

        {/* Category & Sub-Category Pills Bar */}
        <CategoryPills
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
        />

        {/* Promotional Campaign Banners (Noon Style) - Hidden in Eco Mode to keep eco theme calm */}
        {activeCategory !== 'eco' && (
          <PromoBanners onSelectCategory={handleSelectCategory} />
        )}

        {/* Featured Products & Catalog Grid */}
        <section id="favorites-section" className="py-8 px-margin-mobile max-w-[1280px] mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 gap-2">
            <div>
              <h3 className={`text-2xl font-black uppercase tracking-wide ${activeCategory === 'eco' ? 'text-[#2C3E30]' : 'text-[#1A2A4E]'}`}>
                {activeCategory === 'all'
                  ? "This Week's Favorites"
                  : activeCategory === 'eco'
                  ? '🌿 Eco-Friendly Curated Catalog'
                  : `Category: ${activeCategory}`}
              </h3>
              <p className={`text-xs md:text-sm mt-1 ${activeCategory === 'eco' ? 'text-[#2C3E30]/75' : 'text-[#1A2A4E]/70'}`}>
                {activeCategory === 'eco'
                  ? 'Sustainable, FSC certified, and 100% recycled office supplies'
                  : 'Top engineered stationery essentials for your modern workspace'}
              </p>
            </div>
          </div>

          {/* Mobile Filter & Category Control Strip (< md) */}
          <div className="md:hidden flex items-center gap-2 mb-4">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="flex-1 py-2.5 px-3 bg-white border border-gray-200 rounded-xl shadow-2xs font-bold text-xs text-[#1A2A4E] flex items-center justify-center gap-2 btn-press"
            >
              <span className="material-symbols-outlined text-[18px] text-[#16A2D4]">tune</span>
              <span>Filter &amp; Sort</span>
              {(selectedBadge !== 'all' || inStockOnly || sortBy !== 'featured') && (
                <span className="w-2 h-2 rounded-full bg-[#D93630]"></span>
              )}
            </button>

            <button
              onClick={() => setIsMobileCategoryOpen(true)}
              className="flex-1 py-2.5 px-3 bg-white border border-gray-200 rounded-xl shadow-2xs font-bold text-xs text-[#1A2A4E] flex items-center justify-center gap-2 btn-press"
            >
              <span className="material-symbols-outlined text-[18px] text-[#16A2D4]">grid_view</span>
              <span>Categories</span>
            </button>
          </div>

          {/* Interactive Filter & Sort Bar (Desktop & Tablet >= md) */}
          <div className="hidden md:block">
            <FilterSortBar
              activeSubCategory={activeSubCategory}
              onSelectSubCategory={setActiveSubCategory}
              selectedBadge={selectedBadge}
              onSelectBadge={setSelectedBadge}
              inStockOnly={inStockOnly}
              onToggleInStock={() => setInStockOnly(!inStockOnly)}
              sortBy={sortBy}
              onSortChange={setSortBy}
              totalProductsCount={filteredProducts.length}
            />
          </div>

          {/* Product Grid / Skeleton Loaders / Empty State */}
          {isLoadingProducts ? (
            <SkeletonLoader />
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 px-6 text-center bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-[48px] text-[#527A5A]">search_off</span>
              <h4 className="text-lg font-bold text-[#1A2A4E]">No matching eco products found</h4>
              <p className="text-xs text-gray-500 max-w-md">
                We couldn&apos;t find any eco products matching your active filter criteria. Try resetting attribute filters.
              </p>
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setActiveSubCategory('all');
                  setSelectedEcoAttribute('all');
                  setSelectedBadge('all');
                  setInStockOnly(false);
                  setSearchQuery('');
                }}
                className="mt-2 px-6 py-2.5 bg-[#527A5A] hover:bg-[#3D5C43] text-white font-bold text-xs rounded-xl shadow-xs transition-all btn-press"
              >
                Reset All Filters &amp; Browse Full Catalog
              </button>
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
                  onQuickView={(p) => setQuickViewProduct(p)}
                  isEcoTheme={activeCategory === 'eco'}
                />
              ))}
            </div>
          )}
        </section>

        {/* Eco Why Section in Eco Mode */}
        {activeCategory === 'eco' && <EcoWhySection />}

        {/* Client Testimonials Section */}
        <Testimonials />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Quick View */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />

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

      <MobileCategoryDrawer
        isOpen={isMobileCategoryOpen}
        onClose={() => setIsMobileCategoryOpen(false)}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
      />

      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        selectedBadge={selectedBadge}
        onSelectBadge={setSelectedBadge}
        inStockOnly={inStockOnly}
        onToggleInStock={() => setInStockOnly(!inStockOnly)}
        sortBy={sortBy}
        onSortChange={setSortBy}
        totalProductsCount={filteredProducts.length}
      />

      <OrdersModal
        isOpen={isOrdersOpen}
        currentUser={currentUser}
        onClose={() => setIsOrdersOpen(false)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />
    </div>
  );
}
