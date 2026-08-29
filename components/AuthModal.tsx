'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/types/database';
import { signInUser, signUpUser, requestPasswordReset } from '@/lib/actions/auth';

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
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const [companyname, setCompanyname] = useState('');
  const [accountType, setAccountType] = useState<'individual' | 'corporate'>('individual');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const result = await signInUser(email, password);
        if (result.success && result.user) {
          if (result.isAdmin) {
            sessionStorage.setItem('yakda_admin_logged_in', 'true');
            onClose();
            window.location.href = '/admin';
          } else {
            onLoginSuccess(result.user);
            onClose();
          }
        } else {
          setErrorMessage(result.error || 'Failed to sign in. Please check credentials.');
        }
      } else if (mode === 'signup') {
        const result = await signUpUser({
          email,
          pass: password,
          fullname,
          companyname,
          accountType,
        });
        if (result.success && result.user) {
          onLoginSuccess(result.user);
          onClose();
        } else {
          setErrorMessage(result.error || 'Failed to create account.');
        }
      } else if (mode === 'forgot') {
        const result = await requestPasswordReset(email);
        setSuccessMessage(result.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 glass-modal"></div>

      <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Header */}
        <div className="bg-[#1A2A4E] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#16A2D4] text-[24px]">
              {mode === 'forgot' ? 'lock_reset' : mode === 'signup' ? 'person_add' : 'account_circle'}
            </span>
            <h3 className="text-lg font-bold">
              {mode === 'forgot'
                ? 'Reset Password'
                : mode === 'signup'
                ? 'Create New Account'
                : 'Sign In to Yakda'}
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

          {successMessage && (
            <div className="p-3 bg-[#16A2D4]/10 text-[#16A2D4] text-xs font-semibold rounded-xl border border-[#16A2D4]/20">
              {successMessage}
            </div>
          )}

          {/* Account Type Toggle on Registration */}
          {mode === 'signup' && (
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setAccountType('individual')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  accountType === 'individual'
                    ? 'bg-white text-[#1A2A4E] shadow-xs'
                    : 'text-gray-500 hover:text-[#1A2A4E]'
                }`}
              >
                Individual Customer
              </button>
              <button
                type="button"
                onClick={() => setAccountType('corporate')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  accountType === 'corporate'
                    ? 'bg-[#1A2A4E] text-white shadow-xs'
                    : 'text-gray-500 hover:text-[#1A2A4E]'
                }`}
              >
                Corporate / B2B
              </button>
            </div>
          )}

          {/* Registration Extra Fields */}
          {mode === 'signup' && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#1A2A4E]">Full Name *</label>
                <input
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  placeholder="e.g. Salem Al Mansoori"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                  required
                />
              </div>

              {accountType === 'corporate' && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#1A2A4E]">Company Name *</label>
                  <input
                    type="text"
                    value={companyname}
                    onChange={(e) => setCompanyname(e.target.value)}
                    placeholder="e.g. Al Yakda Trading LLC"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                    required
                  />
                </div>
              )}
            </>
          )}

          {/* Email Address */}
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

          {/* Password (for Sign In & Sign Up) */}
          {mode !== 'forgot' && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-[#1A2A4E]">Password *</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-[11px] text-[#16A2D4] font-semibold hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#16A2D4] text-[#1A2A4E]"
                required
              />
            </div>
          )}

          {/* Action Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#1A2A4E] hover:bg-[#13203c] text-white font-bold text-xs rounded-xl shadow-md transition-all btn-press mt-2 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>Processing...</span>
            ) : mode === 'forgot' ? (
              <span>Send Password Reset Email</span>
            ) : mode === 'signup' ? (
              <span>Create Account & Continue</span>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Footer Mode Switchers */}
        <div className="px-6 pb-6 pt-2 text-center border-t border-gray-100 flex flex-col gap-2">
          {mode === 'signin' && (
            <button
              onClick={() => {
                setMode('signup');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="text-xs text-[#16A2D4] font-semibold hover:underline"
            >
              Don&apos;t have an account? Register Now
            </button>
          )}

          {mode === 'signup' && (
            <button
              onClick={() => {
                setMode('signin');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="text-xs text-[#16A2D4] font-semibold hover:underline"
            >
              Already have an account? Sign In
            </button>
          )}

          {mode === 'forgot' && (
            <button
              onClick={() => {
                setMode('signin');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="text-xs text-[#16A2D4] font-semibold hover:underline"
            >
              ← Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
