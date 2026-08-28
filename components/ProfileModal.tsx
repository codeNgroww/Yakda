'use client';

import React from 'react';
import { UserProfile } from '@/types/database';

interface ProfileModalProps {
  isOpen: boolean;
  user: UserProfile | null;
  onClose: () => void;
  onLogout: () => void;
}

export default function ProfileModal({
  isOpen,
  user,
  onClose,
  onLogout,
}: ProfileModalProps) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 glass-modal"></div>

      <div className="relative w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 z-10 text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#1A2A4E] text-white font-black text-2xl flex items-center justify-center shadow-md border-2 border-[#16A2D4]">
          {(user.email || 'U')[0].toUpperCase()}
        </div>

        <div>
          <h4 className="text-base font-bold text-[#1A2A4E]">
            {user.fullname || 'Valued Customer'}
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
          {user.companyname && (
            <span className="mt-2 inline-block px-2.5 py-0.5 bg-gray-100 text-[#1A2A4E] font-semibold text-[11px] rounded border border-gray-200">
              {user.companyname}
            </span>
          )}
        </div>

        <div className="w-full pt-4 border-t border-gray-200 flex flex-col gap-2">
          <button
            onClick={onLogout}
            className="w-full py-2.5 bg-[#D93630]/10 hover:bg-[#D93630]/20 text-[#D93630] font-bold text-xs rounded-xl transition-all btn-press flex items-center justify-center gap-2 border border-[#D93630]/20"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span> Sign Out
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-[#1A2A4E] font-semibold text-xs rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
