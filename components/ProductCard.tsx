'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/database';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({
  product,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
}: ProductCardProps) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden card-hover-effect flex flex-col justify-between group">
      <div className="relative w-full aspect-square bg-white flex items-center justify-center p-4 overflow-hidden">
        {/* Promotional Badge */}
        {product.badge && (
          <span className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-[#004d40] text-white text-[10px] font-black uppercase tracking-wider rounded">
            {product.badge}
          </span>
        )}

        {/* Favorite Heart Trigger */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product);
          }}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-on-surface-variant hover:text-error flex items-center justify-center shadow-xs transition-all btn-press"
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        >
          <span
            className={`material-symbols-outlined text-[18px] ${
              isFavorite ? 'text-error font-bold fill-current' : ''
            }`}
          >
            favorite
          </span>
        </button>

        {/* Image Display */}
        <Link href={`/products/${product.id}`} className="w-full h-full relative block">
          <img
            src={product.image || '/images/hero-desk.png'}
            alt={product.title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>
      </div>

      {/* Card Info Details */}
      <div className="p-4 flex flex-col gap-2 flex-1 justify-between border-t border-outline-variant/40">
        <div>
          <span className="text-[11px] font-semibold text-outline uppercase tracking-wider">
            SKU: {product.sku}
          </span>
          <Link href={`/products/${product.id}`}>
            <h4 className="text-sm font-bold text-on-surface line-clamp-2 mt-0.5 hover:text-primary transition-colors">
              {product.title}
            </h4>
          </Link>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-outline-variant/20">
          <div>
            <span className="text-xs text-outline font-medium">AED</span>
            <span className="text-lg font-black text-[#003833] ml-1">
              {Number(product.price).toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            className="p-2.5 bg-[#004d40] hover:bg-[#003833] text-white rounded-xl shadow-xs transition-all btn-press flex items-center justify-center"
            title="Add to Cart"
          >
            <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
