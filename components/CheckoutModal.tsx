'use client';

import React, { useState } from 'react';
import { CartItem, UserProfile } from '@/types/database';
import { createOrderInDb } from '@/lib/actions/orders';
import { clearCartInDb } from '@/lib/actions/cart';
import { sendOrderNotifications } from '@/lib/actions/notifications';

interface CheckoutModalProps {
  isOpen: boolean;
  cart: CartItem[];
  currentUser: UserProfile | null;
  onClose: () => void;
  onOrderSuccess: () => void;
}

export default function CheckoutModal({
  isOpen,
  cart,
  currentUser,
  onClose,
  onOrderSuccess,
}: CheckoutModalProps) {
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  if (!isOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!phone.trim() || !address.trim()) {
      setErrorMsg('Please fill in phone number and delivery address.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Save Order in Supabase Database tables ('orders' & 'order_items')
      const orderRes = await createOrderInDb({
        userId: currentUser?.id,
        customerEmail: currentUser?.email || 'guest@yakda.ae',
        cartItems: cart,
        totalAmount,
        contactPhone: phone.trim(),
        deliveryAddress: address.trim(),
      });

      if (currentUser?.id) {
        await clearCartInDb(currentUser.id);
      }

      // 2. Send Notifications via Server Action
      const notificationRes = await sendOrderNotifications({
        orderId: orderRes.orderId || 'ORD-NEW',
        customerEmail: currentUser?.email || 'guest@yakda.ae',
        contactPhone: phone.trim(),
        deliveryAddress: address.trim(),
        cartItems: cart,
        totalAmount,
      });

      if (!notificationRes.success) {
        console.error('Notification warning:', notificationRes.error);
        // We still consider the order placed successfully even if notifications fail
      }

      onOrderSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(`Order error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 glass-modal"></div>

      <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Header in Primary Navy Blue */}
        <div className="bg-[#1A2A4E] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#16A2D4] text-[24px]">local_shipping</span>
            <h3 className="text-lg font-bold">Order Checkout</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-[#D93630] border border-red-200 rounded-xl text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {errorMsg}
            </div>
          )}

          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs">
            <span className="text-[#1A2A4E]/70">Customer:</span>
            <span className="font-bold text-[#1A2A4E]">{currentUser?.email || 'Guest Customer'}</span>
          </div>

          {/* Collapsible Order Summary */}
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => setIsSummaryOpen(!isSummaryOpen)}
              className="w-full p-3 bg-gray-50 flex items-center justify-between text-xs font-bold text-[#1A2A4E] hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                Order Summary ({cart.length} items)
              </div>
              <span className="material-symbols-outlined text-[18px]">
                {isSummaryOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            {isSummaryOpen && (
              <div className="p-3 flex flex-col gap-2 max-h-[160px] overflow-y-auto border-t border-gray-200 bg-white">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-start text-xs border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                    <div className="flex-1 pr-2">
                      <p className="font-semibold text-[#1A2A4E] line-clamp-1">{item.title}</p>
                      <p className="text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-[#D93630]">AED {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#1A2A4E]">WhatsApp / Mobile Number *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +971 50 123 4567"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#1A2A4E]">Delivery Address in UAE *</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Building name, street, office number, Dubai, UAE"
              rows={3}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E] resize-none"
              required
            ></textarea>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 font-medium">
            <span className="material-symbols-outlined text-[20px] text-emerald-600">chat</span>
            <span>Order confirmation will be sent directly to your <strong>WhatsApp &amp; Email</strong>.</span>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between mt-2 border border-gray-200">
            <span className="text-xs font-bold text-[#1A2A4E]/80">Total Payable:</span>
            <span className="text-xl font-black text-[#D93630]">AED {totalAmount.toFixed(2)}</span>
          </div>

          {/* Action Button in Deep Red (#D93630) */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#D93630] hover:bg-[#b82a25] text-white font-bold text-xs rounded-xl shadow-md transition-all btn-press flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {isSubmitting ? 'Saving Order to Database...' : 'Confirm Order & Send Notification'}
          </button>
        </form>
      </div>
    </div>
  );
}
