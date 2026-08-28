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

      <div className="relative w-full max-w-sm bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl p-6 z-10 text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#004d40] text-white font-black text-2xl flex items-center justify-center shadow-md">
          {(user.email || 'U')[0].toUpperCase()}
        </div>

        <div>
          <h4 className="text-base font-bold text-on-surface">
            {user.fullname || 'Valued Customer'}
          </h4>
          <p className="text-xs text-outline mt-0.5">{user.email}</p>
          {user.companyname && (
            <span className="mt-2 inline-block px-2.5 py-0.5 bg-surface-container text-on-surface-variant font-semibold text-[11px] rounded">
              {user.companyname}
            </span>
          )}
        </div>

        <div className="w-full pt-4 border-t border-outline-variant flex flex-col gap-2">
          <button
            onClick={onLogout}
            className="w-full py-2.5 bg-error-container hover:bg-error-container/80 text-error font-bold text-xs rounded-xl transition-all btn-press flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span> Sign Out
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
