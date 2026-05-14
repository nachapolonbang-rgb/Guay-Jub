'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Navbar from '@/src/backend/components/Navbar';
import { useCart } from '@/src/backend/context/CartContext';
import { useShop } from '@/src/backend/context/ShopContext';

/* ── Types ─────────────────────────────────────────── */
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
  'ก๋วยจั๊บ':    '/images/preview.png',
  'ผัก':          '/images/preview-1.png',
  'เครื่องดื่ม': '/images/preview.png',
};

const CATEGORY_META: Record<string, { label: string; icon: string }> = {
  'ก๋วยจั๊บ':    { label: 'ก๋วยจั๊บ',    icon: '🍜' },
  'ผัก':          { label: 'ผัก',          icon: '🥬' },
  'เครื่องดื่ม': { label: 'เครื่องดื่ม', icon: '🥤' },
};

function normalizeMenuItem(item: unknown): MenuItem {
  const raw = item as Record<string, unknown>;
  const category = String(raw.category ?? 'อื่นๆ');
  return {
    id:          Number(raw.id ?? 0),
    name:        String(raw.name ?? ''),
    price:       Number(raw.price ?? 0),
    category,
    image:       DEFAULT_IMAGES[category] ?? '/images/preview.png',
    badge:       Number(raw.sold ?? 0) > 0 ? 'hot' : undefined,
    isAvailable: Boolean(raw.isAvailable ?? true),
  };
}

/* ── Toast ──────────────────────────────────────────── */
function Toast({ show, msg }: { show: boolean; msg: string }) {
  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%',
      transform: `translateX(-50%) translateY(${show ? 0 : 12}px)`,
      opacity: show ? 1 : 0,
      pointerEvents: 'none',
      transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
      background: 'linear-gradient(135deg,#1a0a00,#3d1800)',
      color: '#FFD58A',
      padding: '10px 22px',
      borderRadius: 999,
      fontSize: 13,
      fontWeight: 600,
      boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
      zIndex: 100,
      display: 'flex', alignItems: 'center', gap: 8,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: 16 }}>✓</span> {msg}
    </div>
  );
}

/* ── Shop Closed Overlay ───────────────────────────── */
function ShopClosedBanner() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(10,4,0,0.72)',
      backdropFilter: 'blur(8px)',
      padding: 24,
      animation: 'fadeIn 0.3s ease',
    }}>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes popIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}`}</style>
      <div style={{
        background: '#fff',
        borderRadius: 28,
        padding: '48px 40px',
        maxWidth: 360, width: '100%',
        textAlign: 'center',
        boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
        animation: 'popIn 0.35s cubic-bezier(.34,1.56,.64,1)',
      }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🔒</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a0a00', margin: '0 0 8px' }}>
          ร้านปิดอยู่
        </h2>
        <p style={{ fontSize: 14, color: '#9a7a60', lineHeight: 1.7, margin: 0 }}>
          ขณะนี้ร้านยังไม่เปิดรับออเดอร์<br />
          กรุณากลับมาใหม่ในภายหลัง
        </p>
      </div>
    </div>
  );
}

/* ── Animated Card ──────────────────────────────────── */
function MenuCard({
  item, added, isOpen, onAdd,
}: {
  item: MenuItem;
  added: boolean;
  isOpen: boolean;
  onAdd: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: hovered
          ? '0 20px 50px rgba(220,100,20,0.18)'
          : '0 2px 16px rgba(0,0,0,0.07)',
        transform: visible
          ? hovered ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)'
          : 'translateY(24px)',
        opacity: visible ? (isOpen ? 1 : 0.5) : 0,
        transition: 'all 0.45s cubic-bezier(.4,0,.2,1)',
        cursor: isOpen ? 'default' : 'not-allowed',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', width: '100%', height: 180, overflow: 'hidden', background: '#FFF0E0' }}>
        <Image
          src={item.image}
          alt={item.name}
          fill
          style={{
            objectFit: 'cover',
            transform: hovered ? 'scale(1.07)' : 'scale(1)',
            transition: 'transform 0.5s cubic-bezier(.4,0,.2,1)',
          }}
        />
        {/* Badge */}
        {item.badge && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: item.badge === 'hot' ? '#FF4D1A' : '#00B87A',
            color: '#fff', fontSize: 10, fontWeight: 700,
            padding: '3px 10px', borderRadius: 999,
            letterSpacing: 1, textTransform: 'uppercase',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}>
            {item.badge === 'hot' ? '🔥 ฮิต' : '✨ ใหม่'}
          </div>
        )}
        {/* Category chip */}
        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: 'rgba(255,255,255,0.92)',
          fontSize: 11, padding: '3px 10px', borderRadius: 999,
          color: '#7a4a20', fontWeight: 600,
          backdropFilter: 'blur(4px)',
        }}>
          {CATEGORY_META[item.category]?.icon ?? '🍽️'} {CATEGORY_META[item.category]?.label ?? item.category}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px 16px' }}>
        <h3 style={{
          margin: '0 0 4px',
          fontSize: 16, fontWeight: 700,
          color: '#1a0a00',
          letterSpacing: '-0.2px',
        }}>
          {item.name}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <span style={{
            fontSize: 20, fontWeight: 800,
            color: '#E05A00',
            letterSpacing: '-0.5px',
          }}>
            ฿{item.price}
          </span>

          <button
            disabled={!isOpen}
            onClick={onAdd}
            style={{
              width: 40, height: 40,
              borderRadius: '50%',
              border: 'none',
              background: !isOpen
                ? '#e5e7eb'
                : added
                  ? '#16a34a'
                  : 'linear-gradient(135deg, #FF7A20, #E05A00)',
              color: !isOpen ? '#9ca3af' : '#fff',
              fontSize: added ? 18 : 22,
              fontWeight: 700,
              cursor: isOpen ? 'pointer' : 'not-allowed',
              boxShadow: isOpen && !added ? '0 4px 16px rgba(224,90,0,0.4)' : 'none',
              transform: added ? 'scale(1.1)' : 'scale(1)',
              transition: 'all 0.25s cubic-bezier(.34,1.56,.64,1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {added ? '✓' : '+'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────── */
export default function MenuPage() {
  const { cart, addToCart } = useCart();
  const { isOpen } = useShop();

  const [menu, setMenu]           = useState<MenuItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [toast, setToast]         = useState({ show: false, msg: '' });
  const [addedItemIds, setAddedItemIds] = useState<number[]>([]);

  function showToast(msg: string) {
    setToast({ show: true, msg });
    window.setTimeout(() => setToast(prev => ({ ...prev, show: false })), 1800);
  }

  function markAdded(id: number) {
    setAddedItemIds(prev => [...prev, id]);
    window.setTimeout(() => setAddedItemIds(prev => prev.filter(i => i !== id)), 1500);
  }

  useEffect(() => {
    fetch('/api/menu')
      .then(r => r.json())
      .then(data => {
        const items = Array.isArray(data) ? data : [];
        setMenu(items.map(normalizeMenuItem).filter(i => i.isAvailable));
      })
      .catch(() => setMenu([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { key: 'all', label: 'ทั้งหมด', icon: '🍽️' },
    ...Array.from(new Set(menu.map(i => i.category))).map(cat => ({
      key: cat,
      label: CATEGORY_META[cat]?.label ?? cat,
      icon:  CATEGORY_META[cat]?.icon  ?? '🍽️',
    })),
  ];

  const filtered = menu.filter(item =>
    (activeCat === 'all' || item.category === activeCat) &&
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#FFF6EE 0%,#FEE8CC 100%)' }}>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -400px 0 }
          100% { background-position: 400px 0 }
        }
        .skeleton {
          background: linear-gradient(90deg, #f0e4d4 25%, #f8efe4 50%, #f0e4d4 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 14px;
        }
        @keyframes slideDown {
          from { opacity:0; transform:translateY(-8px) }
          to   { opacity:1; transform:translateY(0) }
        }
      `}</style>

      {!isOpen && <ShopClosedBanner />}

      <Navbar />

      {/* Closed bar */}
      {!isOpen && (
        <div style={{
          background: 'linear-gradient(90deg,#c0392b,#e74c3c)',
          color: '#fff',
          textAlign: 'center',
          fontSize: 12,
          fontWeight: 700,
          padding: '8px 16px',
          letterSpacing: 0.5,
          animation: 'slideDown 0.3s ease',
        }}>
          🔒 ร้านปิดรับออเดอร์ชั่วคราว — กรุณาติดต่อเจ้าหน้าที่
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px 80px' }}>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 28 }}>
          <span style={{
            position: 'absolute', left: 20, top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 18, pointerEvents: 'none',
          }}>🔍</span>
          <input
            type="text"
            placeholder="ค้นหาเมนู..."
            disabled={!isOpen}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 20px 14px 50px',
              borderRadius: 999,
              border: '2px solid',
              borderColor: isOpen ? '#F4C08A' : '#e5e7eb',
              background: isOpen ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)',
              fontSize: 15,
              color: '#1a0a00',
              outline: 'none',
              boxSizing: 'border-box',
              boxShadow: '0 4px 20px rgba(220,100,20,0.08)',
              backdropFilter: 'blur(6px)',
              transition: 'all 0.2s ease',
              opacity: isOpen ? 1 : 0.5,
              cursor: isOpen ? 'text' : 'not-allowed',
            }}
          />
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
          {categories.map((cat, i) => {
            const active = activeCat === cat.key;
            return (
              <button
                key={cat.key}
                disabled={!isOpen}
                onClick={() => setActiveCat(cat.key)}
                style={{
                  padding: '9px 18px',
                  borderRadius: 999,
                  border: 'none',
                  background: active
                    ? 'linear-gradient(135deg,#FF7A20,#E05A00)'
                    : 'rgba(255,255,255,0.85)',
                  color: active ? '#fff' : '#7a4a20',
                  fontWeight: active ? 700 : 500,
                  fontSize: 13,
                  cursor: isOpen ? 'pointer' : 'not-allowed',
                  opacity: isOpen ? 1 : 0.4,
                  boxShadow: active
                    ? '0 4px 16px rgba(224,90,0,0.35)'
                    : '0 2px 8px rgba(0,0,0,0.06)',
                  transform: active ? 'scale(1.04)' : 'scale(1)',
                  transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
                  animation: `fadeIn 0.3s ease ${i * 0.05}s both`,
                  backdropFilter: 'blur(4px)',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <span style={{ fontSize: 16 }}>{cat.icon}</span>
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {loading ? (
          /* Skeleton */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ borderRadius: 20, overflow: 'hidden', background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div className="skeleton" style={{ height: 180 }} />
                <div style={{ padding: '14px 16px 18px' }}>
                  <div className="skeleton" style={{ height: 18, width: '65%', marginBottom: 10 }} />
                  <div className="skeleton" style={{ height: 14, width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#c0906a', fontSize: 15 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🍽️</div>
            ไม่พบเมนูในหมวดนี้
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
            {filtered.map(item => (
              <MenuCard
                key={item.id}
                item={item}
                added={addedItemIds.includes(item.id)}
                isOpen={isOpen}
                onAdd={() => {
                  if (!isOpen) return;
                  addToCart(item);
                  markAdded(item.id);
                  showToast(`เพิ่ม ${item.name} ลงตะกร้าแล้ว`);
                }}
              />
            ))}
          </div>
        )}

        {/* Cart summary */}
        {totalQty > 0 && isOpen && (
          <div style={{
            position: 'fixed', bottom: 24, left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg,#1a0a00,#3d1800)',
            color: '#FFD58A',
            padding: '14px 28px',
            borderRadius: 999,
            fontSize: 14, fontWeight: 700,
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            display: 'flex', alignItems: 'center', gap: 10,
            zIndex: 40,
            animation: 'popIn 0.3s cubic-bezier(.34,1.56,.64,1)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}>
            🛒
            <span>{totalQty} รายการในตะกร้า</span>
            <span style={{
              background: '#FF7A20', color: '#fff',
              borderRadius: 999, padding: '2px 10px', fontSize: 12,
            }}>ดูตะกร้า →</span>
          </div>
        )}

      </div>

      <Toast show={toast.show} msg={toast.msg} />
    </div>
  );
}