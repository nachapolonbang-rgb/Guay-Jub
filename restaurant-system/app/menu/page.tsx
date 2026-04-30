'use client';

import { useState } from 'react';
import Navbar from '@/src/backend/components/Navbar';
import { useCart } from '@/src/backend/context/CartContext';

type Food = {
  id: number;
  name: string;
  price: number;
  cat: string;
  image: string;
  badge?: 'new' | 'hot';
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

  const { cart, addToCart } = useCart();

  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');

  const filtered = FOODS.filter(f =>
    (activeCat === 'all' || f.cat === activeCat) &&
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="min-h-screen bg-[#FFF6EE]">

      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">

        <input
          type="text"
          placeholder="🔍 ค้นหาเมนู..."
          className="w-full p-4 rounded-full border-2 border-orange-200 mb-8 text-black"
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-3 mb-10 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCat(cat.key)}
              className={`px-4 py-2 rounded-full ${
                activeCat === cat.key
                  ? 'bg-orange-500 text-white'
                  : 'bg-white'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map(item => (
            <div key={item.id} className="bg-white rounded-2xl shadow p-4">

              <img src={item.image} className="w-full h-40 object-cover rounded-xl"/>

              <h3 className="mt-3 font-bold">{item.name}</h3>

              <div className="flex justify-between mt-2">
                <span className="text-orange-500 font-bold">
                  ฿{item.price}
                </span>

                <button
                  onClick={() => addToCart(item)}
                  className="bg-orange-500 text-white w-10 h-10 rounded-full"
                >
                  +
                </button>
              </div>

            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          🛒 {totalQty} รายการ
        </div>

      </div>
    </div>
  );
}