'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/src/backend/components/Navbar';
import { useCart } from '@/src/backend/context/CartContext';

/* ─── Data ─────────────────────────────────────────── */
const MENU_ITEMS = [
  { id: 1, name: 'Noodle soup', price: 30, image: '/images/noodle-pink-bowl.png', desc: 'Rich soup with plenty of ingredients.', category: 'ก๋วยจั๊บ', isAvailable: true },
  { id: 2, name: 'Noodle soup', price: 20, image: '/images/noodle-white-bowl.png', desc: 'Rich soup with plenty of ingredients.', category: 'ก๋วยจั๊บ', isAvailable: true },
  { id: 3, name: 'Jelly', price: 20, image: '/images/jelly-dessert.png', desc: 'This is a very delicious Thai dessert.', category: 'ผัก', isAvailable: true },
];

const SPEECH = ['ยินดีต้อนรับค่ะ! 🍜', 'อร่อยแน่นอนค่ะ! 🎉', 'รับเมนูไหนดีคะ? 😊'];

/* ─── Toast ─────────────────────────────────────────── */
function Toast({ show, msg }: { show: boolean; msg: string }) {
  return (
    <div style={{
      position: 'fixed', bottom: 28, left: '50%',
      transform: `translateX(-50%) translateY(${show ? 0 : 12}px)`,
      opacity: show ? 1 : 0,
      pointerEvents: 'none',
      transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
      background: '#3d200a',
      color: '#FFD58A',
      padding: '11px 24px',
      borderRadius: 999,
      fontSize: 13, fontWeight: 700,
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      zIndex: 999,
      display: 'flex', alignItems: 'center', gap: 8,
      whiteSpace: 'nowrap',
    }}>
      ✓ {msg}
    </div>
  );
}

/* ─── Main ──────────────────────────────────────────── */
export default function Home() {
  const router = useRouter();
  const { addToCart, cart } = useCart();

  const chefImage = '/images/preview.png';
  const bgNoodle  = '/images/preview-1.png';

  const [speechIdx, setSpeechIdx]   = useState(0);
  const [showSpeech, setShowSpeech] = useState(false);
  const [mousePos, setMousePos]     = useState({ x: 0, y: 0 });
  const [addedId, setAddedId]       = useState<number | null>(null);
  const [toast, setToast]           = useState({ show: false, msg: '' });
  const [mounted, setMounted]       = useState(false);

  // hover state per card
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => { setMounted(true); }, []);

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

  function handleAddToCart(item: typeof MENU_ITEMS[0]) {
    addToCart(item);
    setAddedId(item.id);
    setToast({ show: true, msg: `เพิ่ม ${item.name} ลงตะกร้าแล้ว` });
    setTimeout(() => setAddedId(null), 1400);
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2000);
  }

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div
      className="min-h-screen text-gray-800 font-sans overflow-x-hidden relative"
      style={{ backgroundColor: '#FFF9F5' }}
    >
      <style>{`
        @keyframes fadeIn      { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bounceSlow  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes speechPop   { from{opacity:0;transform:translateY(6px) scale(.94)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes cartBounce  { 0%{transform:scale(1)} 40%{transform:scale(1.22)} 70%{transform:scale(.92)} 100%{transform:scale(1)} }
        .chef-float { animation: bounceSlow 3.6s ease-in-out infinite; }
        .hero-text  { animation: fadeIn 0.8s ease both; }
        .speech-pop { animation: speechPop 0.3s cubic-bezier(.34,1.56,.64,1) both; }
      `}</style>

      <Navbar />

      {/* ════ HERO ════ */}
      <section className="relative flex flex-col md:flex-row items-center justify-center px-10 pt-10 pb-32 min-h-[650px] z-10">

        {/* LEFT – chef + bowl */}
        <div className="relative w-full md:w-1/2 flex justify-center items-center">
          {/* Bowl */}
          <img
            src={bgNoodle}
            className="absolute w-[500px] md:w-[650px] z-0 opacity-100 filter drop-shadow-2xl"
            style={{
              transform: `translate(${mousePos.x * 3}px, ${mousePos.y * 3}px)`,
              transition: 'transform 0.08s linear',
            }}
          />

          {/* Chef + speech */}
          <div className="relative z-10 mt-20 translate-x-10 md:translate-x-20">
            {showSpeech && (
              <div className="speech-pop absolute -top-16 left-1/2 -translate-x-1/2 bg-white border border-orange-100 rounded-2xl px-6 py-2 shadow-xl z-20 whitespace-nowrap font-bold text-[#5a2d0c] text-sm"
                style={{ boxShadow: '0 8px 24px rgba(200,80,20,0.15)' }}
              >
                {SPEECH[speechIdx]}
                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-orange-100 rotate-45" />
              </div>
            )}
            <img
              src={chefImage}
              className="chef-float w-64 md:w-[400px] drop-shadow-2xl cursor-pointer select-none"
              style={{
                transform: `translate(${mousePos.x * 2}px, ${mousePos.y * 2}px)`,
                transition: 'transform 0.08s linear',
                filter: 'drop-shadow(0 24px 40px rgba(100,40,10,0.18))',
              }}
              onClick={() => { setSpeechIdx(i => (i + 1) % SPEECH.length); setShowSpeech(true); }}
            />
          </div>
        </div>

        {/* RIGHT – text */}
        <div className="w-full md:w-1/2 z-10 mt-16 md:mt-0 md:pl-20">
          <div className="hero-text" style={{ animationDelay: '0.1s' }}>
            {/* eyebrow */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'linear-gradient(135deg,#FFE8D0,#FFD0A0)',
              color: '#9a4a10', fontSize: 12, fontWeight: 700,
              padding: '5px 14px', borderRadius: 999, marginBottom: 18,
              letterSpacing: 1.2, textTransform: 'uppercase',
            }}>
              🍜 อาหารบ้านๆ รสมือแม่
            </div>

            <h1 className="text-[60px] md:text-[80px] font-black mb-4 leading-none text-[#3d200a]">
              Grandma's <br />
              <span style={{
                background: 'linear-gradient(135deg,#e3523d,#FF8C42)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                restaurant
              </span>
            </h1>

            <p className="text-[#8b5e3c] mb-10 max-w-sm text-lg leading-relaxed font-medium">
              Get ready to savor Grandma's delicious home-cooked meals and many other special dishes from us.
            </p>

            {/* CTA buttons */}
            <div className="flex gap-4 flex-wrap">
              <Link
                href="/menu"
                style={{
                  background: 'linear-gradient(135deg,#FF7A20,#e3523d)',
                  color: '#fff',
                  padding: '14px 32px',
                  borderRadius: 999,
                  fontWeight: 800, fontSize: 15,
                  textDecoration: 'none',
                  boxShadow: '0 8px 24px rgba(220,80,20,0.35)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  display: 'inline-block',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.05)';
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 12px 32px rgba(220,80,20,0.45)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)';
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 24px rgba(220,80,20,0.35)';
                }}
              >
                🛒 Order Now
              </Link>

              <Link
                href="/menu"
                style={{
                  background: '#fff',
                  color: '#3d200a',
                  padding: '14px 28px',
                  borderRadius: 999,
                  fontWeight: 700, fontSize: 15,
                  border: '1.5px solid #FFD0A0',
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                  display: 'inline-block',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#FFF0E0'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#fff'; }}
              >
                ดูเมนูทั้งหมด →
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 32, marginTop: 40, paddingTop: 32, borderTop: '1px solid #FFE0C0' }}>
              {[['200+','เมนู'],['4.9★','Rating'],['5K+','ลูกค้า']].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#E05A00', letterSpacing: '-0.5px' }}>{n}</div>
                  <div style={{ fontSize: 12, color: '#b08060', fontWeight: 600 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════ MENU SECTION ════ */}
      <section className="px-10 py-24 relative z-10" style={{ background: 'linear-gradient(160deg,#fff 0%,#FFF5EC 100%)' }}>
        <div className="max-w-6xl mx-auto text-center mb-16">
          <p style={{ fontSize: 11, fontWeight: 700, color: '#E05A00', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
            เมนูแนะนำ
          </p>
          <h2 className="text-4xl font-black text-[#3d200a] mb-4">เมนูเด็ดประจำร้าน</h2>
          <div className="h-1.5 w-16 mx-auto rounded-full" style={{ background: 'linear-gradient(90deg,#FF7A20,#e3523d)' }} />
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {MENU_ITEMS.map((item) => {
            const isAdded   = addedId === item.id;
            const isHovered = hoveredCard === item.id;
            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredCard(item.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  background: '#fff',
                  borderRadius: 24,
                  overflow: 'hidden',
                  border: '1px solid #FFE8D0',
                  boxShadow: isHovered
                    ? '0 20px 50px rgba(220,80,20,0.16)'
                    : '0 2px 16px rgba(0,0,0,0.06)',
                  transform: isHovered ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
                  transition: 'all 0.35s cubic-bezier(.4,0,.2,1)',
                }}
              >
                {/* Image */}
                <div style={{ position: 'relative', height: 220, overflow: 'hidden', background: '#FFF0E4' }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: '100%', height: '100%', objectFit: 'cover',
                      transform: isHovered ? 'scale(1.07)' : 'scale(1)',
                      transition: 'transform 0.5s cubic-bezier(.4,0,.2,1)',
                    }}
                  />
                  {/* price badge */}
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    background: 'rgba(255,255,255,0.92)',
                    backdropFilter: 'blur(6px)',
                    borderRadius: 999, padding: '4px 12px',
                    fontWeight: 800, fontSize: 14, color: '#E05A00',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}>
                    ฿{item.price}
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: '18px 20px 20px' }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: '#1a0800' }}>{item.name}</h3>
                  <p style={{ margin: '0 0 18px', fontSize: 13, color: '#9a7060', lineHeight: 1.6 }}>{item.desc}</p>

                  <button
                    onClick={() => handleAddToCart(item)}
                    style={{
                      width: '100%',
                      padding: '12px 0',
                      borderRadius: 14,
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 700, fontSize: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      background: isAdded
                        ? 'linear-gradient(135deg,#16a34a,#15803d)'
                        : isHovered
                          ? 'linear-gradient(135deg,#FF7A20,#e3523d)'
                          : 'linear-gradient(135deg,#FFE8D0,#FFD0A0)',
                      color: (isAdded || isHovered) ? '#fff' : '#9a4a10',
                      boxShadow: (isAdded || isHovered) ? '0 6px 20px rgba(220,80,20,0.3)' : 'none',
                      transition: 'all 0.25s cubic-bezier(.4,0,.2,1)',
                      animation: isAdded ? 'cartBounce 0.45s ease' : 'none',
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{isAdded ? '✓' : '🛒'}</span>
                    {isAdded ? 'เพิ่มแล้ว!' : 'เพิ่มลงตะกร้า'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* See all */}
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Link href="/menu" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            color: '#E05A00', fontWeight: 700, fontSize: 15,
            border: '2px solid #E05A00',
            padding: '12px 28px', borderRadius: 999,
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => {
              const a = e.currentTarget as HTMLAnchorElement;
              a.style.background = '#E05A00'; a.style.color = '#fff';
            }}
            onMouseLeave={e => {
              const a = e.currentTarget as HTMLAnchorElement;
              a.style.background = 'transparent'; a.style.color = '#E05A00';
            }}
          >
            ดูเมนูทั้งหมด →
          </Link>
        </div>
      </section>

      {/* ════ REVIEWS ════ */}
      <section className="bg-white py-20 px-10 border-t border-orange-50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Info */}
          <div className="space-y-6">
            <h4 className="font-black text-xl text-[#3d200a]">Customer reviews</h4>
            <div className="space-y-4 text-sm text-gray-600 font-medium">
              {[
                { icon: '📍', text: 'Uthai Thani Province, Lan Sak District, Din Daeng Market.' },
                { icon: '📞', text: '081-040-8048' },
                { icon: '🕒', text: 'Saturday, Sunday' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex gap-4 items-start">
                  <span style={{
                    background: '#FFF0E0', padding: '8px 10px', borderRadius: 12,
                    fontSize: 18, lineHeight: 1, flexShrink: 0,
                  }}>{icon}</span>
                  <p style={{ margin: 0, lineHeight: 1.6 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Review cards */}
          {[
            { name: 'คุณสมชาย', text: 'อร่อยเหมือนข้าวแม่ทำจริงๆ ครับ ประทับใจมาก', color: '#84cc16' },
            { name: 'Customer', text: 'Easy to order, fast delivery, excellent taste.', color: '#fb923c' },
          ].map((r, idx) => (
            <div key={idx} style={{
              background: '#FFFAF5',
              border: '1px solid #FFE0C0',
              borderRadius: 20,
              padding: '28px 26px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 10, right: 18,
                fontSize: 72, color: '#FFD0A0', lineHeight: 1,
                fontWeight: 900, pointerEvents: 'none', opacity: 0.7,
              }}>"</div>
              <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
                {Array.from({ length: 5 }).map((_, k) => (
                  <span key={k} style={{ color: '#FB923C', fontSize: 16 }}>★</span>
                ))}
              </div>
              <p style={{ fontSize: 14, color: '#5a3828', lineHeight: 1.75, margin: '0 0 20px', fontStyle: 'italic', fontWeight: 500 }}>
                "{r.text}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid #FFE0C0', paddingTop: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: '#9a6050' }}>{r.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════ FOOTER ════ */}
      <footer style={{ background: 'linear-gradient(135deg,#2a1200,#1a0800)', padding: '36px 40px' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1.5px solid rgba(255,255,255,0.15)', overflow: 'hidden', padding: 6,
            }}>
              <img src='/images/logo.png' alt='logo' style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ color: '#FFD58A', fontWeight: 800, fontSize: 16 }}>กับข้าวแม่</div>
              <div style={{ color: 'rgba(255,220,150,0.45)', fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>homemade</div>
            </div>
          </div>

          {/* Center */}
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#FFD58A', fontWeight: 800, fontSize: 20, margin: '0 0 4px' }}>I hope you like it. 🙏</h3>
            <p style={{ color: 'rgba(255,200,120,0.4)', fontSize: 10, margin: 0, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              © 2026 Grandma's Restaurant. All rights reserved.
            </p>
          </div>

          {/* Socials */}
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { src: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png', alt: 'FB' },
              { src: 'https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg', alt: 'Line' },
              { src: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg', alt: 'IG' },
            ].map(({ src, alt }) => (
              <a key={alt} href='#' style={{
                width: 40, height: 40,
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.12)',
                padding: 9, overflow: 'hidden',
                transition: 'all 0.2s ease',
              }}
                onMouseEnter={e => {
                  const a = e.currentTarget as HTMLAnchorElement;
                  a.style.background = 'rgba(255,255,255,0.2)';
                  a.style.transform = 'scale(1.12)';
                }}
                onMouseLeave={e => {
                  const a = e.currentTarget as HTMLAnchorElement;
                  a.style.background = 'rgba(255,255,255,0.08)';
                  a.style.transform = 'scale(1)';
                }}
              >
                <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* ════ Floating cart ════ */}
      {mounted && totalQty > 0 && (
        <button
          onClick={() => router.push('/cart')}
          style={{
            position: 'fixed', bottom: 80, right: 24,
            background: 'linear-gradient(135deg,#FF7A20,#e3523d)',
            color: '#fff',
            border: 'none', borderRadius: 999,
            padding: '13px 20px',
            fontWeight: 800, fontSize: 14,
            boxShadow: '0 8px 28px rgba(220,80,20,0.4)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 10,
            zIndex: 50,
            animation: 'cartBounce 0.5s ease',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.06)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
        >
          🛒
          <span>{totalQty} รายการ</span>
          <span style={{
            background: 'rgba(255,255,255,0.25)',
            borderRadius: 999, padding: '2px 10px', fontSize: 12,
          }}>ดูตะกร้า →</span>
        </button>
      )}

      <Toast show={toast.show} msg={toast.msg} />
    </div>
  );
}