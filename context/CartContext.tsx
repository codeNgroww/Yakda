'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, CartItem, UserProfile } from '@/types/database';
import { fetchCartFromDb, syncCartItemToDb, clearCartInDb } from '@/lib/actions/cart';
import { fetchFavoritesFromDb, toggleFavoriteInDb } from '@/lib/actions/favorites';

// Toast notification type
export type ToastType = { message: string; variant: 'success' | 'error' | 'info' };

interface CartContextType {
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (id: string, newQty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartCount: number;

  // User
  currentUser: UserProfile | null;
  isAdmin: boolean;
  login: (user: UserProfile) => void;
  logout: () => void;

  // Wishlist
  wishlist: Set<string>;
  wishlistCount: number;
  toggleFavorite: (product: Product) => void;

  // Modals
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  isOrdersOpen: boolean;
  setIsOrdersOpen: (open: boolean) => void;

  // Toast
  toast: ToastType | null;
  showToast: (message: string, variant?: 'success' | 'error' | 'info') => void;
}

const CartContext = createContext<CartContextType | null>(null);

const GUEST_CART_KEY = 'yakda_guest_cart';
const USER_SESSION_KEY = 'yakda_logged_in_user';
const ADMIN_SESSION_KEY = 'yakda_admin_logged_in';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  // Modal states (shared so PDP can trigger cart drawer etc.)
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState<ToastType | null>(null);

  const showToast = useCallback((message: string, variant: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Hydrate user session from sessionStorage
  useEffect(() => {
    try {
      const savedUser = sessionStorage.getItem(USER_SESSION_KEY);
      if (savedUser) {
        const u = JSON.parse(savedUser);
        setCurrentUser(u);
        if (u.is_admin) setIsAdmin(true);
      }
      const adminSession = sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
      if (adminSession) setIsAdmin(true);
    } catch {
      // ignore parse errors
    }

    // Hydrate guest cart from localStorage
    try {
      const guestCart = localStorage.getItem(GUEST_CART_KEY);
      if (guestCart) {
        const parsed = JSON.parse(guestCart);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCart(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Sync DB cart/favorites when user logs in
  useEffect(() => {
    if (currentUser?.id) {
      fetchCartFromDb(currentUser.id).then((dbCart) => {
        if (dbCart.length > 0) setCart(dbCart);
      });
      fetchFavoritesFromDb(currentUser.id).then((favIds) => {
        if (favIds.length > 0) setWishlist(new Set(favIds));
      });
    }
  }, [currentUser]);

  // Persist guest cart to localStorage whenever cart changes
  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    }
  }, [cart, currentUser]);

  // --- Cart Actions ---
  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      let newQty = quantity;
      let updatedCart: CartItem[];

      if (existing) {
        newQty = existing.quantity + quantity;
        updatedCart = prev.map((item) =>
          item.id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        updatedCart = [
          ...prev,
          {
            id: product.id,
            sku: product.sku,
            title: product.title,
            price: Number(product.price),
            quantity,
            image: product.image,
          },
        ];
      }

      return updatedCart;
    });

    // Sync to DB if logged in (fire and forget)
    if (currentUser?.id) {
      // Need to compute final quantity for DB sync
      const existing = cart.find((item) => item.id === product.id);
      const finalQty = existing ? existing.quantity + quantity : quantity;
      syncCartItemToDb(currentUser.id, product.id, finalQty);
    }

    setIsCartOpen(true);
    showToast(`${product.title} added to cart`, 'success');
  }, [currentUser, cart, showToast]);

  const updateQuantity = useCallback((id: string, newQty: number) => {
    setCart((prev) => {
      if (newQty <= 0) {
        return prev.filter((item) => item.id !== id);
      }
      return prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item));
    });

    if (currentUser?.id) {
      syncCartItemToDb(currentUser.id, id, newQty);
    }
  }, [currentUser]);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    if (currentUser?.id) {
      syncCartItemToDb(currentUser.id, id, 0);
    }
  }, [currentUser]);

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem(GUEST_CART_KEY);
    if (currentUser?.id) {
      clearCartInDb(currentUser.id);
    }
  }, [currentUser]);

  // --- User Actions ---
  const login = useCallback((user: UserProfile) => {
    setCurrentUser(user);
    if (user.is_admin) setIsAdmin(true);
    sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    // Clear guest cart from localStorage since DB cart takes over
    localStorage.removeItem(GUEST_CART_KEY);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setIsAdmin(false);
    setCart([]);
    setWishlist(new Set());
    sessionStorage.removeItem(USER_SESSION_KEY);
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsProfileOpen(false);
  }, []);

  // --- Wishlist Actions ---
  const toggleFavorite = useCallback(async (product: Product) => {
    const isFav = wishlist.has(product.id);
    setWishlist((prev) => {
      const next = new Set(prev);
      if (isFav) next.delete(product.id);
      else next.add(product.id);
      return next;
    });

    if (currentUser?.id) {
      await toggleFavoriteInDb(currentUser.id, product.id);
    }
  }, [currentUser, wishlist]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        currentUser,
        isAdmin,
        login,
        logout,
        wishlist,
        wishlistCount: wishlist.size,
        toggleFavorite,
        isCartOpen,
        setIsCartOpen,
        isAuthOpen,
        setIsAuthOpen,
        isProfileOpen,
        setIsProfileOpen,
        isOrdersOpen,
        setIsOrdersOpen,
        toast,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
