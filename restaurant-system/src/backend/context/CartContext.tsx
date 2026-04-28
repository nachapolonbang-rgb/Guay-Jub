'use client';

import { createContext, useContext, useState } from 'react';

type Food = {
  id: number;
  name: string;
  price: number;
  image: string;
};

type CartContextType = {
  cart: Food[];
  addToCart: (item: Food) => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Food[]>([]);

  const addToCart = (item: Food) => {
    setCart(prev => [...prev, item]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}