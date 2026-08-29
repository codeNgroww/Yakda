'use client';

import React, { useState } from 'react';
import { CartItem, UserProfile } from '@/types/database';
import { createOrderInDb } from '@/lib/actions/orders';
import { clearCartInDb } from '@/lib/actions/cart';

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

  if (!isOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !address.trim()) {
      alert('Please fill in phone number and delivery address.');
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

      // 2. Format notifications (WhatsApp & Email)
      const itemsSummary = cart
        .map((i) => `• ${i.title} (x${i.quantity}) - AED ${(i.price * i.quantity).toFixed(2)}`)
        .join('\n');

      const waText = encodeURIComponent(
        `*New Order Placed - Yakda*\n` +
        `Order ID: ${orderRes.orderId || 'ORD-NEW'}\n` +
        `---------------------------\n` +
        `Customer: ${currentUser?.email || 'Guest'}\n` +
        `Phone: ${phone.trim()}\n` +
        `Address: ${address.trim()}\n\n` +
        `*Items Summary:*\n${itemsSummary}\n\n` +
        `*Total Amount:* AED ${totalAmount.toFixed(2)}\n` +
        `Thank you for ordering with Yakda!`
      );

      const emailSubject = encodeURIComponent(`New Order Placed - Yakda (${orderRes.orderId || 'ORD-NEW'})`);
      const emailBody = encodeURIComponent(
        `Order ID: ${orderRes.orderId || 'ORD-NEW'}\n` +
        `Customer Email: ${currentUser?.email || 'Guest'}\n` +
        `Phone Number: ${phone.trim()}\n` +
        `Delivery Address: ${address.trim()}\n\n` +
        `Order Items:\n${itemsSummary}\n\n` +
        `Total Order Amount: AED ${totalAmount.toFixed(2)}`
      );

      window.open(`https://wa.me/97145534286?text=${waText}`, '_blank');
      window.open(`mailto:inquiry@alyakda.com?subject=${emailSubject}&body=${emailBody}`, '_blank');

      onOrderSuccess();
      onClose();
    } catch (err: any) {
      alert(`Order error: ${err.message}`);
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
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs">
            <span className="text-[#1A2A4E]/70">Customer:</span>
            <span className="font-bold text-[#1A2A4E]">{currentUser?.email || 'Guest Customer'}</span>
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
