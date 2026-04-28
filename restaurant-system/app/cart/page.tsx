'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/src/backend/components/Navbar';

type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  qty: number;
};

const DISCOUNT_CODES: Record<string, number> = {
  SAVE10: 10,
  FOOD20: 20,
  VIP50: 50,
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const data = localStorage.getItem('cart');
    if (data) setCart(JSON.parse(data));
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const increase = (id: number) => {
    saveCart(cart.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i));
  };

  const decrease = (id: number) => {
    saveCart(
      cart
        .map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i)
        .filter(i => i.qty > 0)
    );
  };

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const total = Math.max(subtotal - discount, 0);

  const applyCode = () => {
    const value = DISCOUNT_CODES[code.toUpperCase()];
    if (!value) {
      setError('โค้ดไม่ถูกต้อง');
      setDiscount(0);
      return;
    }

    setError('');
    setDiscount(value);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F2]">

      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">

        <h1 className="text-3xl font-black text-[#3d200a] mb-8">
          🛒 ตะกร้าของคุณ
        </h1>

        {cart.length === 0 ? (
          <div className="text-center text-gray-500 mt-20 text-lg">
            ยังไม่มีสินค้าในตะกร้า 😢
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">

            {/* LEFT: LIST */}
            <div className="md:col-span-2 space-y-4">

              {cart.map(item => (
                <div
                  key={item.id}
                  className="
                    bg-white p-4 rounded-2xl shadow 
                    flex items-center justify-between
                    border border-orange-100
                  "
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      className="w-20 h-20 rounded-xl object-cover"
                    />

                    <div>
                      <h3 className="font-bold text-[#3d200a]">
                        {item.name}
                      </h3>
                      <p className="text-orange-500 font-bold">
                        ฿{item.price}
                      </p>
                    </div>
                  </div>

                  {/* QTY */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => decrease(item.id)}
                      className="w-8 h-8 bg-gray-200 rounded-full hover:bg-red-200"
                    >
                      -
                    </button>

                    <span className="font-bold">{item.qty}</span>

                    <button
                      onClick={() => increase(item.id)}
                      className="w-8 h-8 bg-gray-200 rounded-full hover:bg-green-200"
                    >
                      +
                    </button>
                  </div>

                  <div className="font-bold text-[#3d200a]">
                    ฿{item.price * item.qty}
                  </div>
                </div>
              ))}

            </div>

            {/* RIGHT: SUMMARY */}
            <div className="bg-white p-6 rounded-2xl shadow border border-orange-100 h-fit">

              <h2 className="font-bold text-lg mb-4 text-[#3d200a]">
                สรุปคำสั่งซื้อ
              </h2>

              {/* DISCOUNT */}
              <div className="mb-4">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="ใส่โค้ดส่วนลด"
                  className="
                    w-full p-3 rounded-xl 
                    border border-gray-300 
                    focus:ring-2 focus:ring-orange-300
                    outline-none text-black
                  "
                />

                <button
                  onClick={applyCode}
                  className="
                    w-full mt-2 
                    bg-orange-500 text-white 
                    py-2 rounded-xl font-bold
                    hover:bg-orange-600
                  "
                >
                  ใช้โค้ด
                </button>

                {error && (
                  <p className="text-red-500 text-sm mt-2">
                    {error}
                  </p>
                )}

                {discount > 0 && (
                  <p className="text-green-600 text-sm mt-2">
                    ใช้โค้ดสำเร็จ - ฿{discount}
                  </p>
                )}
              </div>

              {/* SUMMARY */}
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>ยอดรวม</span>
                  <span>฿{subtotal}</span>
                </div>

                <div className="flex justify-between text-green-600">
                  <span>ส่วนลด</span>
                  <span>- ฿{discount}</span>
                </div>

                <div className="flex justify-between text-lg font-bold text-[#3d200a] border-t pt-3 mt-3">
                  <span>สุทธิ</span>
                  <span className="text-orange-500">฿{total}</span>
                </div>
              </div>

              {/* PAY BUTTON */}
              <button className="
                w-full mt-6 
                bg-[#3d200a] text-white 
                py-4 rounded-xl 
                text-lg font-bold
                hover:bg-[#2a1607]
                transition
              ">
                💳 ชำระเงิน
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}