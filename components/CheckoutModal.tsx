'use client';

import React, { useState } from 'react';
import { CartItem, UserProfile } from '@/types/database';

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

    // Construct Notification Links
    const itemsSummary = cart
      .map((i) => `• ${i.title} (x${i.quantity}) - AED ${(i.price * i.quantity).toFixed(2)}`)
      .join('\n');

    // 1. WhatsApp Text Payload for 97145534286
    const waText = encodeURIComponent(
      `*New Order Placed - Yakda*\n` +
      `---------------------------\n` +
      `Customer: ${currentUser?.email || 'Guest'}\n` +
      `Phone: ${phone.trim()}\n` +
      `Address: ${address.trim()}\n\n` +
      `*Items Summary:*\n${itemsSummary}\n\n` +
      `*Total Amount:* AED ${totalAmount.toFixed(2)}\n` +
      `Thank you for ordering with Yakda!`
    );

    // 2. Email Subject & Body Payload for inquiry@alyakda.com
    const emailSubject = encodeURIComponent(`New Order Placed - Yakda (AED ${totalAmount.toFixed(2)})`);
    const emailBody = encodeURIComponent(
      `Customer Email: ${currentUser?.email || 'Guest'}\n` +
      `Phone Number: ${phone.trim()}\n` +
      `Delivery Address: ${address.trim()}\n\n` +
      `Order Items:\n${itemsSummary}\n\n` +
      `Total Order Amount: AED ${totalAmount.toFixed(2)}`
    );

    // Trigger Notifications in background
    window.open(`https://wa.me/97145534286?text=${waText}`, '_blank');
    window.open(`mailto:inquiry@alyakda.com?subject=${emailSubject}&body=${emailBody}`, '_blank');

    setIsSubmitting(false);
    onOrderSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 glass-modal"></div>

      <div className="relative w-full max-w-lg bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl p-6 z-10">
        <div className="flex items-center justify-between border-b border-outline-variant pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">local_shipping</span>
            <h3 className="text-lg font-bold text-on-surface">Order Checkout</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="p-3 bg-surface-container-low border border-outline-variant/60 rounded-xl flex items-center justify-between text-xs">
            <span className="text-on-surface-variant">Customer:</span>
            <span className="font-bold text-on-surface">{currentUser?.email || 'Guest'}</span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">WhatsApp / Mobile Number *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +971 50 123 4567"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-surface-container-high border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Delivery Address in UAE *</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Building name, street, office number, Dubai, UAE"
              rows={3}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-surface-container-high border border-outline-variant focus:outline-none focus:border-primary text-on-surface resize-none"
              required
            ></textarea>
          </div>

          <div className="p-4 bg-surface-container rounded-xl flex items-center justify-between mt-2">
            <span className="text-xs font-bold text-on-surface-variant">Total Payable:</span>
            <span className="text-xl font-black text-[#003833]">AED {totalAmount.toFixed(2)}</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#004d40] hover:bg-[#003833] text-white font-bold text-xs rounded-xl shadow-md transition-all btn-press flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {isSubmitting ? 'Processing Order...' : 'Confirm Order & Send Notification'}
          </button>
        </form>
      </div>
    </div>
  );
}
