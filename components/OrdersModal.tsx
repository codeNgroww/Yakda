'use client';

import React, { useEffect, useState } from 'react';
import { Order, UserProfile } from '@/types/database';
import { fetchUserOrders } from '@/lib/actions/orders';

interface OrdersModalProps {
  isOpen: boolean;
  currentUser: UserProfile | null;
  onClose: () => void;
  onOpenAuth: () => void;
}

export default function OrdersModal({
  isOpen,
  currentUser,
  onClose,
  onOpenAuth,
}: OrdersModalProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      setIsLoading(true);
      fetchUserOrders(currentUser.id, currentUser.email)
        .then((res) => setOrders(res))
        .catch((err) => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Backdrop */}
      <div onClick={onClose} className="absolute inset-0 glass-modal"></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#1A2A4E] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#16A2D4] text-[24px]">receipt_long</span>
            <div>
              <h3 className="text-lg font-bold">My Account Orders</h3>
              <p className="text-[11px] text-white/70">View history &amp; order tracking details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
          {!currentUser ? (
            <div className="py-12 text-center flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-[48px] text-[#16A2D4]">account_circle</span>
              <h4 className="text-base font-bold text-[#1A2A4E]">Log in to View Your Orders</h4>
              <p className="text-xs text-gray-500 max-w-sm">
                Sign in with your registered account to track active delivery status and past stationery order receipts.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="mt-2 px-6 py-2.5 bg-[#16A2D4] hover:bg-[#1288b3] text-white font-bold text-xs rounded-xl shadow-md transition-all btn-press"
              >
                Sign In / Create Account
              </button>
            </div>
          ) : isLoading ? (
            <div className="py-12 text-center flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-[36px] text-[#16A2D4] animate-spin">sync</span>
              <p className="text-xs font-semibold text-[#1A2A4E]">Fetching your order history...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-[48px] text-gray-300">package_2</span>
              <h4 className="text-base font-bold text-[#1A2A4E]">No Orders Placed Yet</h4>
              <p className="text-xs text-gray-500 max-w-sm">
                When you order office stationery, paper, or supplies, your order receipts will appear here.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 bg-[#D93630] text-white font-bold text-xs rounded-xl shadow-md transition-all btn-press"
              >
                Explore Stationery Catalog
              </button>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                className="p-4 rounded-2xl border border-gray-200 bg-gray-50/70 hover:border-[#16A2D4] transition-all flex flex-col gap-3"
              >
                {/* Order Top Bar */}
                <div className="flex items-center justify-between border-b border-gray-200/80 pb-2.5 text-xs">
                  <div>
                    <span className="font-extrabold text-[#1A2A4E] block">{ord.id}</span>
                    <span className="text-[10px] text-gray-400">
                      {ord.created_at ? new Date(ord.created_at).toLocaleDateString() : 'Recent Order'}
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-[#16A2D4]/10 text-[#16A2D4] font-black text-[10px] uppercase rounded-full border border-[#16A2D4]/20">
                    {ord.status || 'Processing'}
                  </span>
                </div>

                {/* Items Summary */}
                <div className="flex flex-col gap-1.5 text-xs text-gray-700">
                  {Array.isArray(ord.items) &&
                    ord.items.map((it: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-[#1A2A4E] truncate max-w-[240px]">
                          • {it.title} <strong className="text-gray-500">(x{it.quantity})</strong>
                        </span>
                        <span className="font-bold text-[#1A2A4E]">AED {(it.price * it.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                </div>

                {/* Footer Total */}
                <div className="pt-2 border-t border-gray-200/80 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-semibold">Total Amount</span>
                  <span className="text-sm font-black text-[#D93630]">
                    AED {Number(ord.total_amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
