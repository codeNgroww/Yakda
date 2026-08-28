'use client';

import React from 'react';
import { CartItem } from '@/types/database';

interface CartDrawerProps {
  isOpen: boolean;
  cart: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  onInitiateCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  cart,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onInitiateCheckout,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freeDeliveryThreshold = 300;
  const isFreeDeliveryEligible = subtotal >= freeDeliveryThreshold;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 glass-modal transition-opacity"
      ></div>

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-gray-200 shadow-2xl flex flex-col justify-between">
          
          {/* Header in Primary Navy Blue */}
          <div className="p-4 md:p-6 bg-[#1A2A4E] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#16A2D4] text-[22px]">shopping_bag</span>
              <h3 className="text-lg font-bold">Your Cart ({cart.reduce((s, i) => s + i.quantity, 0)})</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Free Delivery Bar Banner */}
          <div className="bg-[#16A2D4]/10 px-4 py-2.5 text-xs text-[#1A2A4E] border-b border-[#16A2D4]/20 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#16A2D4] text-[18px]">local_shipping</span>
            {isFreeDeliveryEligible ? (
              <span className="font-bold text-[#16A2D4]">Congrats! You unlocked FREE Delivery!</span>
            ) : (
              <span>
                Add <strong className="text-[#D93630]">AED {(freeDeliveryThreshold - subtotal).toFixed(2)}</strong> more for FREE shipping
              </span>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-gray-400">
                <span className="material-symbols-outlined text-[48px] text-[#16A2D4]">remove_shopping_cart</span>
                <p className="text-sm font-semibold text-[#1A2A4E]">Your shopping cart is empty</p>
                <button
                  onClick={onClose}
                  className="mt-2 px-5 py-2.5 bg-[#16A2D4] hover:bg-[#1288b3] text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 rounded-xl border border-gray-200 bg-gray-50"
                >
                  <img
                    src={item.image || '/images/hero-desk.png'}
                    alt={item.title}
                    className="w-16 h-16 object-contain bg-white rounded-lg p-1 border border-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-[#1A2A4E] truncate">{item.title}</h5>
                    <span className="text-[11px] text-gray-400">SKU: {item.sku}</span>
                    <div className="text-xs font-black text-[#D93630] mt-1">
                      AED {(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-gray-400 hover:text-[#D93630] transition-colors p-1"
                      title="Remove item"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>

                    <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-0.5 text-xs text-[#1A2A4E] hover:bg-gray-100 transition-colors"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-bold text-[#1A2A4E]">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-0.5 text-xs text-[#1A2A4E] hover:bg-gray-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Checkout Button in Deep Red (#D93630) */}
          {cart.length > 0 && (
            <div className="p-4 md:p-6 border-t border-gray-200 bg-white flex flex-col gap-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-[#1A2A4E]/80">Subtotal</span>
                <span className="font-black text-lg text-[#D93630]">AED {subtotal.toFixed(2)}</span>
              </div>
              <p className="text-[11px] text-gray-400">Taxes and shipping calculated at checkout.</p>
              <button
                onClick={onInitiateCheckout}
                className="w-full py-3.5 bg-[#D93630] hover:bg-[#b82a25] text-white font-bold text-sm rounded-xl shadow-md transition-all btn-press flex items-center justify-center gap-2"
              >
                Proceed to Checkout <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
