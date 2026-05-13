'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Navbar from '@/src/backend/components/Navbar';
import { useCart } from '@/src/backend/context/CartContext';

type MenuItem = {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  badge?: 'new' | 'hot';
  isAvailable: boolean;
};

const DEFAULT_IMAGES: Record<string, string> = {
  'ก๋วยจั๊บ': '/images/preview.png',
  'ผัก': '/images/preview-1.png',
  'เครื่องดื่ม': '/images/preview.png',
};

const CATEGORY_META: Record<string, { label: string; icon: string }> = {
  'ก๋วยจั๊บ': { label: 'ก๋วยจั๊บ', icon: '🍜' },
  'ผัก': { label: 'ผัก', icon: '🥬' },
  'เครื่องดื่ม': { label: 'เครื่องดื่ม', icon: '🥤' },
};

function normalizeMenuItem(item: unknown): MenuItem {
  const raw = item as Record<string, unknown>;
  const category = String(raw.category ?? 'อื่นๆ');

  return {
    id: Number(raw.id ?? 0),
    name: String(raw.name ?? ''),
    price: Number(raw.price ?? 0),
    category,
    image: DEFAULT_IMAGES[category] ?? '/images/preview.png',
    badge: Number(raw.sold ?? 0) > 0 ? 'hot' : undefined,
    isAvailable: Boolean(raw.isAvailable ?? true),
  };
}

function Toast({ show, msg }: { show: boolean; msg: string }) {
  return (
    <div className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-zinc-900 px-4 py-2.5 text-sm text-white shadow-xl transition-all duration-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}>
      {msg}
    </div>
  );
}

export default function MenuPage() {
  const { cart, addToCart } = useCart();

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [toast, setToast] = useState({ show: false, msg: '' });
  const [addedItemIds, setAddedItemIds] = useState<number[]>([]);

  function showToast(msg: string) {
    setToast({ show: true, msg });
    window.setTimeout(() => setToast(prev => ({ ...prev, show: false })), 1800);
  }

  function markAdded(id: number) {
    setAddedItemIds(prev => [...prev, id]);
    window.setTimeout(() => setAddedItemIds(prev => prev.filter(itemId => itemId !== id)), 1500);
  }

  useEffect(() => {
    fetch('/api/menu')
      .then(r => r.json())
      .then(data => {
        const items = Array.isArray(data) ? data : [];
        setMenu(items.map(normalizeMenuItem).filter(item => item.isAvailable));
      })
      .catch(() => setMenu([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { key: 'all', label: 'ทั้งหมด', icon: '🍽️' },
    ...Array.from(new Set(menu.map(item => item.category))).map(category => ({
      key: category,
      label: CATEGORY_META[category]?.label ?? category,
      icon: CATEGORY_META[category]?.icon ?? '🍽️',
    })),
  ];

  const filtered = menu.filter(item =>
    (activeCat === 'all' || item.category === activeCat) &&
    item.name.toLowerCase().includes(search.toLowerCase())
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

        {loading ? (
          <div className="py-20 text-center text-zinc-400 text-sm">กำลังโหลดเมนู...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-zinc-400 text-sm">ไม่พบเมนูในหมวดนี้</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {filtered.map(item => {
              const added = addedItemIds.includes(item.id);
              return (
                <div key={item.id} className="bg-white rounded-2xl shadow p-4">

                  <div className="relative w-full h-40 overflow-hidden rounded-xl">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>

                  <h3 className="mt-3 font-bold">{item.name}</h3>

                  <div className="flex justify-between mt-2 items-center gap-3">
                    <span className="text-orange-500 font-bold">฿{item.price}</span>

                    <button
                      onClick={() => {
                        addToCart(item);
                        markAdded(item.id);
                        showToast(`เพิ่ม ${item.name} ลงตะกร้าแล้ว`);
                      }}
                      className={`w-10 h-10 rounded-full font-bold transition-colors ${added ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
                    >
                      {added ? '✓' : '+'}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          🛒 {totalQty} รายการ
        </div>

        <Toast show={toast.show} msg={toast.msg} />

      </div>
    </div>
  );
}