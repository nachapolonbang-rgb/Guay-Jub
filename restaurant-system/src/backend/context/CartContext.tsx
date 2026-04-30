'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Food = {
  id: number;
  name: string;
  price: number;
  image: string;
};

type CartItem = Food & {
  qty: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Food) => void;
  increase: (id: number) => void;
  decrease: (id: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // ✅ โหลดจาก localStorage ตอนเริ่ม
  useEffect(() => {
    const data = localStorage.getItem('cart');
    if (data) setCart(JSON.parse(data));
  }, []);

  // ✅ save ทุกครั้งที่ cart เปลี่ยน
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // ✅ เพิ่มสินค้า
  const addToCart = (item: Food) => {
    setCart(prev => {
      const found = prev.find(i => i.id === item.id);

      if (found) {
        return prev.map(i =>
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i
        );
      }

      return [...prev, { ...item, qty: 1 }];
    });
  };

  // ✅ เพิ่มจำนวน
  const increase = (id: number) => {
    setCart(prev =>
      prev.map(i =>
        i.id === id ? { ...i, qty: i.qty + 1 } : i
      )
    );
  };

  // ✅ ลดจำนวน
  const decrease = (id: number) => {
    setCart(prev =>
      prev
        .map(i =>
          i.id === id ? { ...i, qty: i.qty - 1 } : i
        )
        .filter(i => i.qty > 0)
    );
  };

  // ✅ ล้างตะกร้า
  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, increase, decrease, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}