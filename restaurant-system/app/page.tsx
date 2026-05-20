'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/src/backend/components/Navbar';
import { useCart } from '@/src/backend/context/CartContext';

/* ─── Types ─────────────────────────────────────────── */
interface MenuItem {
  id:          number;
  name:        string;
  price:       number;
  image?:      string;
  category:    string;
  isAvailable: boolean;
  sold:        number;
  ingredients: string[];
}

/* ─── Fallback images ────────────────────────────────── */
const FALLBACK: Record<string, string> = {
  'ก๋วยจั๊บ':    '/images/preview.png',
  'ผัก':          '/images/preview-1.png',
  'เครื่องดื่ม': '/images/preview.png',
};
const DEFAULT_FALLBACK = '/images/preview.png';

function getImage(item: MenuItem) {
  if (item.image?.trim()) return item.image;
  return FALLBACK[item.category] ?? DEFAULT_FALLBACK;
}

function normalizeItem(raw: Record<string, unknown>): MenuItem {
  let ingredients: string[] = [];
  try {
    const v = raw.ingredients;
    ingredients = typeof v === 'string' ? JSON.parse(v) : Array.isArray(v) ? v : [];
  } catch { ingredients = []; }

  return {
    id:          Number(raw.id ?? 0),
    name:        String(raw.name ?? ''),
    price:       Number(raw.price ?? 0),
    image:       raw.image ? String(raw.image) : undefined,
    category:    String(raw.category ?? ''),
    isAvailable: Boolean(raw.isAvailable ?? true),
    sold:        Number(raw.sold ?? 0),
    ingredients,
  };
}

/* ─── จุดเด่นของร้าน ─────────────────────────────────── */
const HIGHLIGHTS = [
  {
    icon: '🍲',
    title: 'ปรุงสดทุกวัน',
    desc: 'วัตถุดิบสด ใหม่ทุกเช้า ไม่ใส่ผงชูรส ทำด้วยใจเหมือนอาหารที่บ้าน',
    color: '#FFF3E8',
    border: '#FFD4A8',
  },
  {
    icon: '👵',
    title: 'สูตรต้นตำรับ',
    desc: 'สืบทอดสูตรโบราณจากรุ่นสู่รุ่น รสชาติที่คุ้นเคยและอบอุ่นใจ',
    color: '#FFF8F0',
    border: '#FFD4A8',
  },
  {
    icon: '💛',
    title: 'ราคาเป็นมิตร',
    desc: 'อิ่มอร่อยในราคาที่เข้าถึงได้ เพราะอยากให้ทุกคนได้ลิ้มรส',
    color: '#FFFBF0',
    border: '#FFD4A8',
  },
];

const SPEECH = ['ยินดีต้อนรับค่ะ! 🍜', 'อร่อยแน่นอนค่ะ! 🎉', 'รับเมนูไหนดีคะ? 😊'];

/* ─── Toast ──────────────────────────────────────────── */
function Toast({ show, msg }: { show: boolean; msg: string }) {
  return (
    <div style={{
      position: 'fixed', bottom: 28, left: '50%',
      transform: `translateX(-50%) translateY(${show ? 0 : 12}px)`,
      opacity: show ? 1 : 0, pointerEvents: 'none',
      transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
      background: '#3d200a', color: '#FFD58A',
      padding: '11px 24px', borderRadius: 999,
      fontSize: 13, fontWeight: 700,
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      zIndex: 999, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
    }}>
      ✓ {msg}
    </div>
  );
}

/* ─── Skeleton card ──────────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 24, overflow: 'hidden', border: '1px solid #FFE8D0' }}>
      <div style={{ height: 220, background: 'linear-gradient(90deg,#f5e8d8 25%,#fdf0e4 50%,#f5e8d8 75%)', backgroundSize: '400px 100%', animation: 'shimmer 1.4s infinite' }} />
      <div style={{ padding: '18px 20px 20px' }}>
        <div style={{ height: 18, width: '60%', borderRadius: 8, background: '#f5e8d8', marginBottom: 10 }} />
        <div style={{ height: 13, width: '80%', borderRadius: 8, background: '#f5e8d8', marginBottom: 6 }} />
        <div style={{ height: 13, width: '50%', borderRadius: 8, background: '#f5e8d8', marginBottom: 18 }} />
        <div style={{ height: 44, borderRadius: 14, background: '#f5e8d8' }} />
      </div>
    </div>
  );
}

/* ─── Menu Card ──────────────────────────────────────── */
function MenuCard({
  item, isAdded, onAdd,
}: {
  item: MenuItem; isAdded: boolean; onAdd: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const img = getImage(item);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff', borderRadius: 24, overflow: 'hidden',
        border: '1px solid #FFE8D0',
        boxShadow: hovered ? '0 20px 50px rgba(220,80,20,0.16)' : '0 2px 16px rgba(0,0,0,0.06)',
        transform: hovered ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
        transition: 'all 0.35s cubic-bezier(.4,0,.2,1)',
      }}
    >
      <div style={{ position: 'relative', height: 220, overflow: 'hidden', background: '#FFF0E4' }}>
        <Image
          src={img} alt={item.name} fill
          style={{
            objectFit: 'cover',
            transform: hovered ? 'scale(1.07)' : 'scale(1)',
            transition: 'transform 0.5s cubic-bezier(.4,0,.2,1)',
          }}
        />
        {item.sold > 0 && (
          <div style={{
            position: 'absolute', top: 12, left: 12,
            background: '#FF4D1A', color: '#fff',
            fontSize: 10, fontWeight: 700,
            padding: '3px 10px', borderRadius: 999,
            letterSpacing: 1, textTransform: 'uppercase',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}>
            🔥 ขายดี
          </div>
        )}
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)',
          borderRadius: 999, padding: '4px 12px',
          fontWeight: 800, fontSize: 14, color: '#E05A00',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          ฿{item.price}
        </div>
      </div>

      <div style={{ padding: '18px 20px 20px' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: '#1a0800' }}>
          {item.name}
        </h3>
        {item.ingredients.length > 0 && (
          <p style={{ margin: '0 0 14px', fontSize: 12, color: '#b08060', lineHeight: 1.5 }}>
            {item.ingredients.slice(0, 4).join(' · ')}
            {item.ingredients.length > 4 && ' ...'}
          </p>
        )}
        {item.sold > 0 && (
          <p style={{ margin: '0 0 14px', fontSize: 12, color: '#E05A00', fontWeight: 600 }}>
            🍽 ขายไปแล้ว {item.sold.toLocaleString()} จาน
          </p>
        )}
        <button
          onClick={onAdd}
          style={{
            width: '100%', padding: '12px 0', borderRadius: 14,
            border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: isAdded
              ? 'linear-gradient(135deg,#16a34a,#15803d)'
              : hovered
                ? 'linear-gradient(135deg,#FF7A20,#e3523d)'
                : 'linear-gradient(135deg,#FFE8D0,#FFD0A0)',
            color: (isAdded || hovered) ? '#fff' : '#9a4a10',
            boxShadow: (isAdded || hovered) ? '0 6px 20px rgba(220,80,20,0.3)' : 'none',
            transition: 'all 0.25s cubic-bezier(.4,0,.2,1)',
          }}
        >
          <span style={{ fontSize: 16 }}>{isAdded ? '✓' : '🛒'}</span>
          {isAdded ? 'เพิ่มแล้ว!' : 'เพิ่มลงตะกร้า'}
        </button>
      </div>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────── */
export default function Home() {
  const router = useRouter();
  const { addToCart, cart } = useCart();

  const chefImage = '/images/preview.png';
  const bgNoodle  = '/images/preview-1.png';

  const [topMenu,    setTopMenu]    = useState<MenuItem[]>([]);
  const [menuLoad,   setMenuLoad]   = useState(true);
  const [speechIdx,  setSpeechIdx]  = useState(0);
  const [showSpeech, setShowSpeech] = useState(false);
  const [mousePos,   setMousePos]   = useState({ x: 0, y: 0 });
  const [addedIds,   setAddedIds]   = useState<number[]>([]);
  const [toast,      setToast]      = useState({ show: false, msg: '' });
  const [mounted,    setMounted]    = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    fetch('/api/menu')
      .then(r => r.json())
      .then((data: unknown[]) => {
        if (!Array.isArray(data)) return;
        const items = data
          .map(d => normalizeItem(d as Record<string, unknown>))
          .filter(i => i.isAvailable)
          .sort((a, b) => b.sold - a.sold)
          .slice(0, 3);
        setTopMenu(items);
      })
      .catch(() => setTopMenu([]))
      .finally(() => setMenuLoad(false));
  }, []);

  useEffect(() => {
    const move = (e: MouseEvent) => setMousePos({
      x: (e.clientX / window.innerWidth  - 0.5) * 2,
      y: (e.clientY / window.innerHeight - 0.5) * 2,
    });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  useEffect(() => {
    const show = () => {
      setSpeechIdx(i => (i + 1) % SPEECH.length);
      setShowSpeech(true);
      setTimeout(() => setShowSpeech(false), 2800);
    };
    const t  = setTimeout(show, 1500);
    const id = setInterval(show, 5500);
    return () => { clearTimeout(t); clearInterval(id); };
  }, []);

  function handleAdd(item: MenuItem) {
    addToCart({ id: item.id, name: item.name, image: getImage(item), price: item.price });
    setAddedIds(prev => [...prev, item.id]);
    setToast({ show: true, msg: `เพิ่ม ${item.name} ลงตะกร้าแล้ว` });
    setTimeout(() => setAddedIds(prev => prev.filter(i => i !== item.id)), 1400);
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2000);
  }

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="min-h-screen text-gray-800 font-sans overflow-x-hidden relative" style={{ backgroundColor: '#FFF9F5' }}>
      <style>{`
        @keyframes fadeIn     { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeInUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bounceSlow { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes speechPop  { from{opacity:0;transform:translateY(6px) scale(.94)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes shimmer    { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes pulseRing  { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.5);opacity:0} }
        .chef-float  { animation: bounceSlow 3.6s ease-in-out infinite; }
        .hero-text   { animation: fadeIn 0.8s ease both; }
        .speech-pop  { animation: speechPop 0.3s cubic-bezier(.34,1.56,.64,1) both; }
        .fade-up-1   { animation: fadeInUp 0.7s ease both; animation-delay: 0.1s; }
        .fade-up-2   { animation: fadeInUp 0.7s ease both; animation-delay: 0.25s; }
        .fade-up-3   { animation: fadeInUp 0.7s ease both; animation-delay: 0.4s; }
        .highlight-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(220,80,20,0.12) !important; }
        .highlight-card { transition: all 0.3s cubic-bezier(.4,0,.2,1); }
      `}</style>

      <Navbar />

      {/* ════ HERO ════ */}
      <section className="relative flex flex-col md:flex-row items-center justify-center px-10 pt-10 pb-32 min-h-[650px] z-10">
        {/* รูปซ้าย */}
        <div className="relative w-full md:w-1/2 flex justify-center items-center">
          <img src={bgNoodle} className="absolute w-[500px] md:w-[650px] z-0 opacity-100 filter drop-shadow-2xl"
            style={{ transform: `translate(${mousePos.x * 3}px,${mousePos.y * 3}px)`, transition: 'transform 0.08s linear' }} />
          <div className="relative z-10 mt-20 translate-x-10 md:translate-x-20">
            {showSpeech && (
              <div className="speech-pop absolute -top-16 left-1/2 -translate-x-1/2 bg-white border border-orange-100 rounded-2xl px-6 py-2 shadow-xl z-20 whitespace-nowrap font-bold text-[#5a2d0c] text-sm"
                style={{ boxShadow: '0 8px 24px rgba(200,80,20,0.15)' }}>
                {SPEECH[speechIdx]}
                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-orange-100 rotate-45" />
              </div>
            )}
            <img src={chefImage} className="chef-float w-64 md:w-[400px] drop-shadow-2xl cursor-pointer select-none"
              style={{ transform: `translate(${mousePos.x * 2}px,${mousePos.y * 2}px)`, transition: 'transform 0.08s linear', filter: 'drop-shadow(0 24px 40px rgba(100,40,10,0.18))' }}
              onClick={() => { setSpeechIdx(i => (i + 1) % SPEECH.length); setShowSpeech(true); }} />
          </div>
        </div>

        {/* ข้อความขวา */}
        <div className="w-full md:w-1/2 z-10 mt-16 md:mt-0 md:pl-20">
          <div className="fade-up-1">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#FFE8D0,#FFD0A0)', color: '#9a4a10', fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 999, marginBottom: 18, letterSpacing: 1.2, textTransform: 'uppercase' }}>
              🍜 อาหารบ้านๆ รสมือแม่
            </div>
          </div>
          <div className="fade-up-2">
            <h1 className="text-[60px] md:text-[80px] font-black mb-4 leading-none text-[#3d200a]">
              ร้านยายทอง<br />
              <span style={{ background: 'linear-gradient(135deg,#e3523d,#FF8C42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                โฮมเมด
              </span>
            </h1>
            <p className="text-[#8b5e3c] mb-10 max-w-sm text-lg leading-relaxed font-medium">
              อาหารรสมือแม่ที่ปรุงด้วยความรักและใส่ใจทุกจาน พร้อมเสิร์ฟความอิ่มอร่อยแบบบ้านๆ ให้คุณทุกวัน
            </p>
          </div>
          <div className="fade-up-3">
            <div className="flex gap-4 flex-wrap">
              <Link href="/menu" style={{ background: 'linear-gradient(135deg,#FF7A20,#e3523d)', color: '#fff', padding: '14px 32px', borderRadius: 999, fontWeight: 800, fontSize: 15, textDecoration: 'none', boxShadow: '0 8px 24px rgba(220,80,20,0.35)', display: 'inline-block' }}>
                🛒 สั่งเลย
              </Link>
              <Link href="/menu" style={{ background: '#fff', color: '#3d200a', padding: '14px 28px', borderRadius: 999, fontWeight: 700, fontSize: 15, border: '1.5px solid #FFD0A0', textDecoration: 'none', display: 'inline-block' }}>
                ดูเมนูทั้งหมด →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════ เมนูขายดี ════ */}
      <section className="px-10 py-24 relative z-10" style={{ background: 'linear-gradient(160deg,#fff 0%,#FFF5EC 100%)' }}>
        <div className="max-w-6xl mx-auto text-center mb-16">
          <p style={{ fontSize: 11, fontWeight: 700, color: '#E05A00', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
            เมนูแนะนำ
          </p>
          <h2 className="text-4xl font-black text-[#3d200a] mb-4">เมนูเด็ดประจำร้าน</h2>
          <div className="h-1.5 w-16 mx-auto rounded-full" style={{ background: 'linear-gradient(90deg,#FF7A20,#e3523d)' }} />
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {menuLoad ? (
            [1,2,3].map(i => <SkeletonCard key={i} />)
          ) : topMenu.length === 0 ? (
            <div className="col-span-3 text-center py-16 text-[#c0906a]">
              <div style={{ fontSize: 48, marginBottom: 12 }}>🍽️</div>
              <p>ยังไม่มีเมนูในระบบ</p>
              <Link href="/admin/menu" style={{ color: '#E05A00', fontWeight: 700, fontSize: 14 }}>
                เพิ่มเมนูได้ที่หน้า Admin →
              </Link>
            </div>
          ) : (
            topMenu.map(item => (
              <MenuCard
                key={item.id}
                item={item}
                isAdded={addedIds.includes(item.id)}
                onAdd={() => handleAdd(item)}
              />
            ))
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Link href="/menu" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#E05A00', fontWeight: 700, fontSize: 15, border: '2px solid #E05A00', padding: '12px 28px', borderRadius: 999, textDecoration: 'none' }}>
            ดูเมนูทั้งหมด →
          </Link>
        </div>
      </section>

      {/* ════ จุดเด่นของร้าน ════ */}
      <section className="py-24 px-10" style={{ background: '#fff' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p style={{ fontSize: 11, fontWeight: 700, color: '#E05A00', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
              ทำไมต้องเรา
            </p>
            <h2 className="text-4xl font-black text-[#3d200a] mb-4">จุดเด่นของร้านเรา</h2>
            <div className="h-1.5 w-16 mx-auto rounded-full" style={{ background: 'linear-gradient(90deg,#FF7A20,#e3523d)' }} />
            <p style={{ color: '#8b5e3c', marginTop: 16, fontSize: 15, maxWidth: 480, margin: '16px auto 0' }}>
              เราใส่ใจทุกรายละเอียด เพื่อให้คุณได้รับประสบการณ์ที่ดีที่สุดในทุกมื้ออาหาร
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HIGHLIGHTS.map((h, i) => (
              <div
                key={i}
                className="highlight-card"
                style={{
                  background: h.color,
                  border: `1.5px solid ${h.border}`,
                  borderRadius: 24,
                  padding: '36px 32px',
                  textAlign: 'center',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{
                  fontSize: 52,
                  marginBottom: 20,
                  display: 'block',
                  lineHeight: 1,
                }}>
                  {h.icon}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#3d200a', margin: '0 0 12px' }}>
                  {h.title}
                </h3>
                <p style={{ fontSize: 14, color: '#8b5e3c', lineHeight: 1.8, margin: 0 }}>
                  {h.desc}
                </p>
              </div>
            ))}
          </div>

          {/* CTA ใต้ส่วนจุดเด่น */}
          <div style={{
            marginTop: 56,
            background: 'linear-gradient(135deg,#3d200a,#6b3010)',
            borderRadius: 28,
            padding: '40px 48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 24,
          }}>
            <div>
              <h3 style={{ color: '#FFD58A', fontWeight: 800, fontSize: 24, margin: '0 0 8px' }}>
                พร้อมสั่งอาหารแล้วใช่ไหม? 🍜
              </h3>
              <p style={{ color: 'rgba(255,200,120,0.7)', margin: 0, fontSize: 14 }}>
                เลือกเมนูโปรดของคุณได้เลย อร่อยรับประกัน!
              </p>
            </div>
            <Link href="/menu" style={{
              background: 'linear-gradient(135deg,#FF7A20,#e3523d)',
              color: '#fff',
              padding: '14px 36px',
              borderRadius: 999,
              fontWeight: 800,
              fontSize: 15,
              textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}>
              🛒 ดูเมนูทั้งหมด
            </Link>
          </div>
        </div>
      </section>

      {/* ════ FOOTER ════ */}
      <footer style={{ background: 'linear-gradient(135deg,#2a1200,#1a0800)', padding: '36px 40px' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(255,255,255,0.15)', overflow: 'hidden', padding: 6 }}>
              <img src='/images/logo.png' alt='logo' style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ color: '#FFD58A', fontWeight: 800, fontSize: 16 }}>ยายทอง</div>
              <div style={{ color: 'rgba(255,220,150,0.45)', fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>homemade</div>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#FFD58A', fontWeight: 800, fontSize: 20, margin: '0 0 4px' }}>ขอบคุณที่แวะมาเยี่ยม 🙏</h3>
            <p style={{ color: 'rgba(255,200,120,0.4)', fontSize: 10, margin: 0, letterSpacing: 1.5, textTransform: 'uppercase' }}>© 2026 ร้านยายทอง สงวนลิขสิทธิ์</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { src: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png', alt: 'FB'   },
              { src: 'https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg',                alt: 'Line' },
              { src: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg',      alt: 'IG'   },
            ].map(({ src, alt }) => (
              <a key={alt} href='#' style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.12)', padding: 9, overflow: 'hidden' }}>
                <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* Floating cart */}
      {mounted && totalQty > 0 && (
        <button onClick={() => router.push('/cart')}
          style={{ position: 'fixed', bottom: 80, right: 24, background: 'linear-gradient(135deg,#FF7A20,#e3523d)', color: '#fff', border: 'none', borderRadius: 999, padding: '13px 20px', fontWeight: 800, fontSize: 14, boxShadow: '0 8px 28px rgba(220,80,20,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, zIndex: 50 }}>
          🛒 <span>{totalQty} รายการ</span>
          <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 999, padding: '2px 10px', fontSize: 12 }}>ดูตะกร้า →</span>
        </button>
      )}

      <Toast show={toast.show} msg={toast.msg} />
    </div>
  );
}