'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/src/backend/components/Navbar';
import { useRouter } from 'next/navigation';

type Food = {
  id: number;
  name: string;
  price: number;
  cat: string;
  image: string;
  badge?: 'new' | 'hot';
};

type CartItem = Food & {
  qty: number;
};

const FOODS: Food[] = [
  { id:1, name:'กะเพราไข่ดาว', price:60, cat:'rice', image:'/images/krapao.jpg', badge:'hot' },
  { id:2, name:'ข้าวหมูตุ๋น', price:70, cat:'rice', image:'/images/pork.jpg' },
  { id:3, name:'ข้าวหมูกรอบ', price:65, cat:'rice', image:'/images/crispy.jpg', badge:'hot' },
  { id:4, name:'ต้มยำกุ้ง', price:80, cat:'soup', image:'/images/tomyum.jpg' },
  { id:5, name:'แกงเขียวหวาน', price:70, cat:'soup', image:'/images/green-curry.jpg' },
  { id:6, name:'วุ้นมะพร้าว', price:25, cat:'dessert', image:'/images/jelly.jpg', badge:'new' },
];

const categories = [
  { key: 'all', label: 'ทั้งหมด', icon: '🍽️' },
  { key: 'rice', label: 'ข้าว', icon: '🍚' },
  { key: 'soup', label: 'ต้ม/แกง', icon: '🍲' },
  { key: 'dessert', label: 'ของหวาน', icon: '🍧' },
];

export default function MenuPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');

  // 🔹 โหลด cart จาก localStorage
  useEffect(() => {
    const data = localStorage.getItem('cart');
    if (data) setCart(JSON.parse(data));
  }, []);

  // 🔹 เพิ่มสินค้า
  const addToCart = (item: Food) => {
    const existing = localStorage.getItem('cart');
    let currentCart: CartItem[] = existing ? JSON.parse(existing) : [];

    const found = currentCart.find(i => i.id === item.id);

    if (found) {
      found.qty += 1;
    } else {
      currentCart.push({ ...item, qty: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(currentCart));
    setCart(currentCart);
  };

  // 🔹 filter
  const filtered = FOODS.filter(f =>
    (activeCat === 'all' || f.cat === activeCat) &&
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  // 🔹 นับจำนวนจริง
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="min-h-screen bg-[#FFF6EE]">

      <Navbar />

      {/* HERO */}
      <div className="max-w-6xl mx-auto px-6 mt-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#ffe5d0] to-[#ffd2b3] p-6 md:flex items-center gap-6 shadow-lg">
          
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-black text-[#3d200a] mb-2">
              อร่อยเหมือนแม่ทำ ❤️
            </h1>
            <p className="text-gray-600">
              สั่งง่าย ส่งไว ถึงหน้าบ้านคุณ
            </p>
          </div>

          <img src="/images/hero-food.png" className="w-40 md:w-56" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* SEARCH */}
        <input
          type="text"
          placeholder="🔍 ค้นหาเมนู..."
          className="w-full p-4 rounded-full border-2 border-orange-200 focus:ring-2 focus:ring-orange-300 outline-none mb-8 text-black"
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* CATEGORY */}
        <div className="flex gap-3 mb-10 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCat(cat.key)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition ${
                activeCat === cat.key
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-orange-100'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

          {filtered.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition group"
            >
              <div className="h-40 overflow-hidden">
                <img
                  src={item.image}
                  className="w-full h-full object-cover group-hover:scale-110 transition"
                />
              </div>

              <div className="p-4">

                <h3 className="font-bold text-[#3d200a]">
                  {item.name}
                </h3>

                <div className="flex justify-between items-center mt-3">
                  <span className="text-orange-500 font-bold">
                    ฿{item.price}
                  </span>

                  <button
                    onClick={() => addToCart(item)}
                    className="bg-orange-500 text-white w-9 h-9 rounded-full hover:bg-orange-600 transition text-lg"
                  >
                    +
                  </button>
                </div>

                {item.badge === 'hot' && (
                  <div className="text-xs text-red-500 mt-2">
                    🔥 ขายดี
                  </div>
                )}
                {item.badge === 'new' && (
                  <div className="text-xs text-green-500 mt-2">
                    ใหม่
                  </div>
                )}

              </div>
            </div>
          ))}

        </div>

      </div>

      {/* FLOAT CART */}
      <div
        onClick={() => router.push('/cart')}
        className="fixed bottom-6 right-6 bg-orange-500 text-white px-6 py-3 rounded-full shadow-xl font-bold cursor-pointer hover:scale-110 transition"
      >
        🛒 {totalQty}
      </div>

    </div>
  );
}