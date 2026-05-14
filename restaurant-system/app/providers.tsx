'use client';

import { CartProvider } from '@/src/backend/context/CartContext';
import { ShopProvider } from '@/src/backend/context/ShopContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ShopProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </ShopProvider>
  );
}
