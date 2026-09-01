'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types/database';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

export default function ProductCard({
  product,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onQuickView,
}: ProductCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden card-hover-effect flex flex-col justify-between group shadow-xs hover:border-[#16A2D4]/40 transition-all">
      <div className="relative w-full aspect-square bg-white flex items-center justify-center p-4 overflow-hidden">
        {/* Promotional Badge */}
        {product.badge && (
          <span className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-[#D93630] text-white text-[10px] font-black uppercase tracking-wider rounded shadow-xs">
            {product.badge}
          </span>
        )}

        {/* Action Triggers: Favorite Heart & Quick View */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(product);
            }}
            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-400 hover:text-[#D93630] flex items-center justify-center shadow-xs transition-all btn-press"
            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                isFavorite ? 'text-[#D93630] font-bold fill-current' : ''
              }`}
            >
              favorite
            </span>
          </button>

          {onQuickView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-500 hover:text-[#16A2D4] flex items-center justify-center shadow-xs transition-all opacity-0 group-hover:opacity-100 btn-press"
              title="Quick View"
            >
              <span className="material-symbols-outlined text-[18px]">visibility</span>
            </button>
          )}
        </div>

        {/* Image Display */}
        <Link href={`/products/${product.id}`} className="w-full h-full relative block">
          <img
            src={product.image || '/images/hero-desk.png'}
            alt={product.title}
            onError={(e) => {
              e.currentTarget.src = '/images/hero-desk.png';
            }}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>
      </div>

      {/* Card Info Details */}
      <div className="p-4 flex flex-col gap-2 flex-1 justify-between border-t border-gray-100 bg-white">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              SKU: {product.sku}
            </span>
            <div className="flex items-center text-[#F4B21B] text-[11px] font-bold">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
              <span className="ml-0.5 text-gray-600">4.9</span>
            </div>
          </div>

          <Link href={`/products/${product.id}`}>
            <h4 className="text-xs sm:text-sm font-bold text-[#1A2A4E] line-clamp-2 mt-1 hover:text-[#16A2D4] transition-colors leading-snug">
              {product.title}
            </h4>
          </Link>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <div>
            <span className="text-[11px] text-gray-400 font-bold">AED</span>
            {/* Highlighted Price Tag in Deep Red (#D93630) */}
            <span className="text-lg sm:text-xl font-black text-[#D93630] ml-1">
              {Number(product.price).toFixed(2)}
            </span>
          </div>

          {/* Add to Cart Button in Vibrant Cyan (#16A2D4) */}
          <button
            onClick={() => onAddToCart(product)}
            className="px-3 py-2 bg-[#16A2D4] hover:bg-[#1288b3] text-white rounded-xl shadow-xs transition-all btn-press flex items-center justify-center gap-1 text-xs font-bold"
            title="Add to Cart"
          >
            <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
