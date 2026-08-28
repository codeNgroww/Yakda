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
  const [accountType, setAccountType] = useState<'individual' | 'corporate'>('individual');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Admin Credentials Guard
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

      <div className="relative w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl p-6 z-10">
        <div className="flex items-center justify-between border-b border-outline-variant pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">account_circle</span>
            <h3 className="text-lg font-bold text-on-surface">
              {isSignUp ? 'Create Customer Account' : 'Sign In to Yakda'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-error-container text-error text-xs font-semibold rounded-xl">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isSignUp && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Full Name (Optional)</label>
                <input
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  placeholder="e.g. Salem Al Mansoori"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-surface-container-high border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Company Name (Optional)</label>
                <input
                  type="text"
                  value={companyname}
                  onChange={(e) => setCompanyname(e.target.value)}
                  placeholder="e.g. Al Yakda Trading LLC"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-surface-container-high border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
                />
              </div>
            </>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@company.ae"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-surface-container-high border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-surface-container-high border border-outline-variant focus:outline-none focus:border-primary text-on-surface"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#004d40] hover:bg-[#003833] text-white font-bold text-xs rounded-xl shadow-md transition-all btn-press mt-2"
          >
            {isSignUp ? 'Create Account & Continue' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-outline-variant text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-primary font-semibold hover:underline"
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
