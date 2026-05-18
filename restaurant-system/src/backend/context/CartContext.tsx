'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

/* ── Types ─────────────────────────────────────────── */
export type Customization = {
  removed:  string[];
  toppings: string[];
  note:     string;
};

export type Food = {
  id:             number;
  name:           string;
  price:          number;
  image:          string;
  customization?: Customization;
};

export type CartItem = Food & {
  qty:     number;
  cartKey: string; // id + customization → สั่งเมนูเดิมต่างตัวเลือกได้
};

type CartContextType = {
  cart:       CartItem[];
  addToCart:  (item: Food) => void;
  increase:   (cartKey: string) => void;
  decrease:   (cartKey: string) => void;
  clearCart:  () => void;
  totalPrice: number;
  totalQty:   number;
};

const CartContext = createContext<CartContextType | null>(null);

/* ── Helper ─────────────────────────────────────────── */
function makeCartKey(item: Food): string {
  return `${item.id}__${JSON.stringify(item.customization ?? {})}`;
}

/* ── Provider ───────────────────────────────────────── */
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // โหลดจาก localStorage ตอนเริ่ม
  useEffect(() => {
    try {
      const data = localStorage.getItem('cart');
      if (data) setCart(JSON.parse(data));
    } catch {}
  }, []);

  // save ทุกครั้งที่ cart เปลี่ยน
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  function addToCart(item: Food) {
    const cartKey = makeCartKey(item);
    setCart(prev => {
      const existing = prev.find(i => i.cartKey === cartKey);
      if (existing) {
        return prev.map(i => i.cartKey === cartKey ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1, cartKey }];
    });
  }

  function increase(cartKey: string) {
    setCart(prev => prev.map(i => i.cartKey === cartKey ? { ...i, qty: i.qty + 1 } : i));
  }

  function decrease(cartKey: string) {
    setCart(prev =>
      prev.map(i => i.cartKey === cartKey ? { ...i, qty: i.qty - 1 } : i)
          .filter(i => i.qty > 0)
    );
  }

  function clearCart() {
    setCart([]);
  }

  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const totalQty   = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, increase, decrease, clearCart, totalPrice, totalQty }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}