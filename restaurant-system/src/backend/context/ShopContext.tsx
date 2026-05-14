'use client';

/**
 * ShopContext
 * -----------
 * Provides a global `isOpen` flag and `toggleShop` action.
 * Persists to localStorage so the state survives page refreshes.
 *
 * Usage:
 *   1. Wrap your app with <ShopProvider> in layout.tsx (alongside CartProvider)
 *   2. Call `useShop()` anywhere to read isOpen / call toggleShop()
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ShopContextValue {
  isOpen: boolean;
  toggleShop: () => void;
  setShopOpen: (open: boolean) => void;
}

const ShopContext = createContext<ShopContextValue | null>(null);

const STORAGE_KEY = 'shop_is_open';

export function ShopProvider({ children }: { children: ReactNode }) {
  // Default to open; hydrate from localStorage after mount
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // โหลดค่าแรก
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) setIsOpen(stored === 'true');

    // ฟัง tab อื่นเปลี่ยน localStorage → อัปเดตทันทีโดยไม่ต้องรีเฟรช
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY && e.newValue !== null) {
        setIsOpen(e.newValue === 'true');
      }
    }

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  function setShopOpen(open: boolean) {
    setIsOpen(open);
    localStorage.setItem(STORAGE_KEY, String(open));
  }

  function toggleShop() {
    setShopOpen(!isOpen);
  }

  return (
    <ShopContext.Provider value={{ isOpen, toggleShop, setShopOpen }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used inside <ShopProvider>');
  return ctx;
}