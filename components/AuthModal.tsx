'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/types/database';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const [companyname, setCompanyname] = useState('');
  const [accountType] = useState<'individual' | 'corporate'>('individual');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if ((email.trim() === 'admin@yakda.ae' || email.trim() === 'admin') && password === 'admin123') {
      sessionStorage.setItem('yakda_admin_logged_in', 'true');
      onClose();
      window.location.href = '/admin';
      return;
    }

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter email and password.');
      return;
    }

    const userObj: UserProfile = {
      id: `USR-${Date.now()}`,
      email: email.trim(),
      fullname: fullname.trim() || null,
      companyname: companyname.trim() || null,
      account_type: accountType,
    };

    onLoginSuccess(userObj);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 glass-modal"></div>

      <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-10">
        <div className="bg-[#1A2A4E] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#16A2D4] text-[24px]">account_circle</span>
            <h3 className="text-lg font-bold">
              {isSignUp ? 'Create Customer Account' : 'Sign In to Yakda'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {errorMessage && (
            <div className="p-3 bg-[#D93630]/10 text-[#D93630] text-xs font-semibold rounded-xl border border-[#D93630]/20">
              {errorMessage}
            </div>
          )}

          {isSignUp && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#1A2A4E]">Full Name (Optional)</label>
                <input
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  placeholder="e.g. Salem Al Mansoori"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#1A2A4E]">Company Name (Optional)</label>
                <input
                  type="text"
                  value={companyname}
                  onChange={(e) => setCompanyname(e.target.value)}
                  placeholder="e.g. Al Yakda Trading LLC"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                />
              </div>
            </>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#1A2A4E]">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@company.ae"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#1A2A4E]">Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#1A2A4E] hover:bg-[#13203c] text-white font-bold text-xs rounded-xl shadow-md transition-all btn-press mt-2"
          >
            {isSignUp ? 'Create Account & Continue' : 'Sign In'}
          </button>
        </form>

        <div className="px-6 pb-6 pt-2 text-center border-t border-gray-100">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-[#16A2D4] font-semibold hover:underline"
          >
            {isSignUp
              ? 'Already have an account? Sign In'
              : "Don't have an account? Register Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
