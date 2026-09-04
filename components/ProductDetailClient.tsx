'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types/database';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const {
    cartCount,
    wishlistCount,
    currentUser,
    isAdmin,
    addToCart,
    wishlist,
    toggleFavorite,
    setIsCartOpen,
    setIsAuthOpen,
    setIsProfileOpen,
    setIsOrdersOpen,
  } = useCart();

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface">
      {/* Header */}
      <Header
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        currentUser={currentUser}
        isAdmin={isAdmin}
        activeCategory="all"
        onSelectCategory={() => {}}
        onOpenSearch={() => { window.location.href = '/'; }}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        searchQuery=""
        onSearchChange={() => {}}
        onOpenOrders={() => setIsOrdersOpen(true)}
      />

      <main className="flex-1 w-full max-w-[1280px] mx-auto px-margin-mobile md:px-gutter pt-24 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-outline mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="capitalize">{product.category}</span>
          <span>/</span>
          <span className="text-on-surface font-semibold truncate max-w-xs">{product.title}</span>
        </div>

        {/* Product Details Container */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-10 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-6 bg-white rounded-2xl border border-outline-variant/60 p-6 flex items-center justify-center aspect-square">
            <img src={product.image || '/images/hero-desk.png'} alt={product.title} className="max-h-full object-contain" />
          </div>

          <div className="md:col-span-6 flex flex-col gap-4">
            {product.badge && (
              <span className="self-start px-3 py-1 bg-[#004d40] text-white text-xs font-black uppercase rounded shadow-xs">
                {product.badge}
              </span>
            )}
            <span className="text-xs text-outline font-semibold">SKU Code: {product.sku}</span>
            <h1 className="text-2xl md:text-3xl font-black text-[#1A2A4E]">{product.title}</h1>
            <div className="text-3xl font-black text-[#D93630]">AED {Number(product.price).toFixed(2)}</div>
            
            <p className="text-xs text-on-surface-variant leading-relaxed border-t border-b border-outline-variant/40 py-4 my-2">
              {product.description || 'Premium office stationery item supplied by Yakda Dubai with next day express delivery across the UAE.'}
            </p>

            {/* Tabby & Tamara Installment Teaser */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-200 my-1">
              <span>Pay 4 interest-free payments of <strong>AED {(Number(product.price) / 4).toFixed(2)}</strong> with</span>
              <span className="px-1.5 py-0.5 bg-[#00F5D4] text-[#1A2A4E] font-black text-[9px] rounded uppercase">tabby</span>
              <span>or</span>
              <span className="px-1.5 py-0.5 bg-[#FFD6A5] text-[#1A2A4E] font-black text-[9px] rounded uppercase">tamara</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
              <div className="flex items-center border border-gray-300 rounded-xl bg-white w-full sm:w-auto h-12">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 text-lg text-[#1A2A4E] hover:bg-gray-100 h-full rounded-l-xl transition-colors"
                >
                  -
                </button>
                <span className="px-4 text-sm font-bold text-[#1A2A4E] w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 text-lg text-[#1A2A4E] hover:bg-gray-100 h-full rounded-r-xl transition-colors"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full sm:flex-1 py-3 h-12 bg-[#D93630] hover:bg-[#b82a25] text-white font-bold text-sm rounded-xl shadow-md transition-all btn-press flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span> Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16">
            <h3 className="text-xl font-black text-[#1A2A4E] mb-6 uppercase tracking-wide">Customers Also Bought</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isFavorite={wishlist.has(p.id)}
                  onToggleFavorite={toggleFavorite}
                  onAddToCart={(prod) => addToCart(prod, 1)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Sticky Bottom Purchase Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white border-t border-gray-200 p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.1)] flex items-center justify-between gap-3 pb-safe">
        <div>
          <span className="text-[10px] text-gray-400 font-bold block">Total Price</span>
          <span className="text-lg font-black text-[#D93630]">AED {(Number(product.price) * quantity).toFixed(2)}</span>
        </div>
        <button
          onClick={handleAddToCart}
          className="flex-1 py-3 bg-[#D93630] hover:bg-[#b82a25] text-white font-black text-xs rounded-xl shadow-md transition-all btn-press flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[18px]">shopping_cart</span> Add to Cart
        </button>
      </div>

      <Footer />
    </div>
  );
}
