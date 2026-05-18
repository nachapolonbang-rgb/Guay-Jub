'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/src/backend/components/Navbar';
import {
  CalendarDays, Sparkles, Music2, UtensilsCrossed,
  Megaphone, ArrowRight, Bell, CheckCircle2, Clock,
  Tag, Flame, X, ChevronLeft, ChevronRight,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────
type Status = 'upcoming' | 'active' | 'ended';

type Promo = {
  id: number;
  title: string;
  desc: string;
  detail?: string;
  date: string;
  status: Status;
  tag: string;
  emoji: string;
  discount?: string;
};

// ─── Data ────────────────────────────────────────────
const FALLBACK_PROMOS: Promo[] = [
  {
    id: 1, emoji: '🏪',
    title: 'ร้านเปิดทุกวัน',
    desc: 'เปิดให้บริการทุกวัน เวลา 10:00–22:00 น. พร้อมบริการนั่งทานและสั่งกลับบ้าน',
    detail: 'ร้านแม่เขาข้าวเปิดให้บริการทุกวัน ตั้งแต่เวลา 10:00–22:00 น.\n\nบริการของเรา:\n• นั่งทานที่ร้าน (Dine-in)\n• สั่งกลับ (Take-away)\n• รับออเดอร์ผ่านไลน์และโทรศัพท์\n\nสถานที่จอดรถมีให้ฟรีสำหรับลูกค้าทุกท่าน',
    date: 'ทุกวัน', status: 'active', tag: 'ข่าวสาร',
  },
  {
    id: 2, emoji: '🍜',
    title: 'เมนูใหม่กำลังมา',
    desc: 'เตรียมพบก๋วยเตี๋ยวสูตรพิเศษและของหวานใหม่ประจำร้านเร็ว ๆ นี้',
    detail: 'เร็ว ๆ นี้จะมีเมนูใหม่จากครัวแม่เขาข้าว!\n\nเมนูที่กำลังจะมา:\n🍜 ก๋วยเตี๋ยวน้ำตกสูตรโบราณ\n🍮 ขนมหวานฤดูร้อนสูตรพิเศษ\n🥗 สลัดไทยโบราณ\n\nติดตามอัปเดตได้ทางเพจของร้าน',
    date: 'สัปดาห์หน้า', status: 'upcoming', tag: 'เมนูใหม่',
  },
  {
    id: 3, emoji: '🎵',
    title: 'ดนตรีสดหน้าร้าน',
    desc: 'ทุกคืนวันศุกร์ บรรยากาศดนตรีสด + อาหารร้อน ๆ จากครัวของเรา',
    detail: 'ทุกคืนวันศุกร์ตั้งแต่เวลา 18:00 น.\n\nวงดนตรีสดจากศิลปินท้องถิ่น:\n• เพลงไทยโบราณ\n• เพลงลูกทุ่งยุค 90s\n• เพลงสากลอะคูสติก\n\nไม่มีค่าเข้าชม แนะนำจองโต๊ะล่วงหน้า',
    date: 'ทุกศุกร์ 18:00', status: 'active', tag: 'กิจกรรม',
  },
  {
    id: 4, emoji: '🔧',
    title: 'ปิดปรับปรุงระบบครัว',
    desc: 'ปิดชั่วคราว 20 พ.ค. เพื่อพัฒนาคุณภาพบริการ',
    detail: 'ทางร้านจะปิดให้บริการชั่วคราวในวันที่ 20 พฤษภาคม 2026\n\nกำหนดการ:\n• 20 พ.ค. 2026 — ปิดทั้งวัน\n• 21 พ.ค. 2026 — เปิดตามปกติ\n\nขออภัยในความไม่สะดวก 🙏',
    date: '20 พ.ค. 2026', status: 'upcoming', tag: 'ประกาศ',
  },
  {
    id: 5, emoji: '🎉',
    title: 'ลด 20% เมนูพิเศษ',
    desc: 'ทุกวันอังคาร–พุธ รับส่วนลด 20% เมนูแนะนำ ไม่จำกัดจำนวนจาน',
    detail: 'โปรโมชั่นพิเศษ! รับส่วนลด 20% ทุกวันอังคาร–พุธ\n\nเมนูที่ร่วมรายการ:\n• ข้าวผัดกะเพราหมูสับ\n• ต้มยำกุ้งน้ำข้น\n• ผัดไทยกุ้งสด\n• ยำวุ้นเส้นทะเล\n\nเงื่อนไข:\n✅ ไม่จำกัดจำนวนจาน\n✅ Dine-in และ Take-away\n❌ ไม่รวมเครื่องดื่ม',
    date: 'อังคาร – พุธ', status: 'active', tag: 'โปรโมชั่น', discount: '20%',
  },
];

function mapPromotion(item: any): Promo {
  return {
    id: Number(item.id ?? 0),
    title: String(item.title ?? ''),
    desc: String(item.description ?? ''),
    detail: item.detail ? String(item.detail) : undefined,
    date: String(item.date ?? ''),
    status: item.status === 'upcoming' || item.status === 'ended' ? item.status : 'active',
    tag: String(item.tag ?? 'ข่าวสาร'),
    emoji: item.emoji ?? '📢',
    discount: item.discount ? String(item.discount) : undefined,
  };
}

// ─── Palette ─────────────────────────────────────────
const p = {
  bg: '#faf5ee', card: '#ffffff', accent: '#c46b2d', accentSoft: '#f6e4d5',
  green: '#16a34a', greenSoft: '#dcfce7', amber: '#92400e', amberSoft: '#fef3c7',
  text: '#1c1208', muted: '#7b6a60', border: '#e8d9c8', surface: '#fffaf4',
};

// ─── Helpers ─────────────────────────────────────────
function statusInfo(s: Status) {
  if (s === 'active')   return { label: 'กำลังจัด', bg: p.greenSoft, fg: p.green,   Icon: CheckCircle2 };
  if (s === 'upcoming') return { label: 'เร็ว ๆ นี้', bg: p.amberSoft, fg: p.amber, Icon: Clock };
  return { label: 'สิ้นสุดแล้ว', bg: '#e5e7eb', fg: '#4b5563', Icon: null };
}
function cardGrad(tag: string) {
  if (tag === 'โปรโมชั่น') return 'linear-gradient(135deg,#fce7d6,#fff3ec)';
  if (tag === 'กิจกรรม')   return 'linear-gradient(135deg,#dbeafe,#eff6ff)';
  if (tag === 'เมนูใหม่')  return 'linear-gradient(135deg,#fef9c3,#fffde7)';
  if (tag === 'ประกาศ')    return 'linear-gradient(135deg,#fce7f3,#fff5f9)';
  return 'linear-gradient(135deg,#f0fdf4,#f7fff9)';
}
function tagIcon(tag: string) {
  if (tag === 'กิจกรรม')   return <Music2 size={14} />;
  if (tag === 'เมนูใหม่')  return <UtensilsCrossed size={14} />;
  if (tag === 'ประกาศ')    return <Megaphone size={14} />;
  if (tag === 'โปรโมชั่น') return <Tag size={14} />;
  return <Bell size={14} />;
}

// ─── Modal ───────────────────────────────────────────
function Modal({ promo, onClose, onPrev, onNext, hasPrev, hasNext }: {
  promo: Promo; onClose: () => void; onPrev: () => void;
  onNext: () => void; hasPrev: boolean; hasNext: boolean;
}) {
  const st = statusInfo(promo.status);
  const lines = (promo.detail || promo.desc).split('\n');

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft'  && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [hasPrev, hasNext]);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(28,18,8,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 28, maxWidth: 520, width: '100%', maxHeight: '88vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 40px 100px rgba(0,0,0,0.2)', animation: 'slideUp 0.26s cubic-bezier(.22,.97,.36,1)' }}>
        <div style={{ background: cardGrad(promo.tag), minHeight: 170, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
          <span style={{ fontSize: 76 }}>{promo.emoji}</span>
          <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.85)', border: 'none', cursor: 'pointer', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.text }}>
            <X size={15} />
          </button>
          <div style={{ position: 'absolute', top: 12, left: 12, background: st.bg, color: st.fg, padding: '5px 11px', borderRadius: 999, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
            {st.Icon && <st.Icon size={10} />} {st.label}
          </div>
          {promo.discount && (
            <div style={{ position: 'absolute', bottom: 12, right: 12, background: p.accent, color: '#fff', fontWeight: 900, fontSize: 16, width: 52, height: 52, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(196,107,45,0.4)' }}>
              {promo.discount}
            </div>
          )}
        </div>

        <div style={{ padding: '22px 26px', overflowY: 'auto', flex: 1 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, background: p.accentSoft, color: p.accent, fontSize: 11, fontWeight: 800, marginBottom: 12 }}>
            {tagIcon(promo.tag)} {promo.tag}
          </span>
          <h2 style={{ fontSize: 24, lineHeight: 1.3, color: p.text, marginBottom: 8, fontWeight: 900 }}>{promo.title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: p.accent, fontWeight: 700, fontSize: 13, marginBottom: 18 }}>
            <CalendarDays size={13} /> {promo.date}
          </div>
          <div style={{ borderTop: `1px solid ${p.border}`, paddingTop: 16 }}>
            {lines.map((line, i) => {
              if (!line) return <div key={i} style={{ height: 8 }} />;
              const isHead = !line.startsWith('•') && !line.startsWith('✅') && !line.startsWith('❌') && !line.match(/^[🍜🍮🥗]/) && line.endsWith(':');
              return (
                <p key={i} style={{ fontSize: isHead ? 11 : 14, fontWeight: isHead ? 800 : 400, color: isHead ? p.text : p.muted, lineHeight: 1.85, marginBottom: isHead ? 3 : 0, letterSpacing: isHead ? '0.06em' : 0, textTransform: isHead ? 'uppercase' : 'none' }}>
                  {line}
                </p>
              );
            })}
          </div>
        </div>

        <div style={{ padding: '14px 26px', borderTop: `1px solid ${p.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#faf8f5', flexShrink: 0 }}>
          <button onClick={onPrev} disabled={!hasPrev} style={{ background: hasPrev ? p.accentSoft : '#f0ece8', color: hasPrev ? p.accent : '#ccc', border: 'none', cursor: hasPrev ? 'pointer' : 'not-allowed', borderRadius: 12, padding: '9px 15px', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit' }}>
            <ChevronLeft size={14} /> ก่อนหน้า
          </button>
          <button onClick={onClose} style={{ background: p.accent, color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 12, padding: '9px 20px', fontWeight: 800, fontSize: 13, fontFamily: 'inherit' }}>
            ปิด
          </button>
          <button onClick={onNext} disabled={!hasNext} style={{ background: hasNext ? p.accentSoft : '#f0ece8', color: hasNext ? p.accent : '#ccc', border: 'none', cursor: hasNext ? 'pointer' : 'not-allowed', borderRadius: 12, padding: '9px 15px', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit' }}>
            ถัดไป <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────
export default function PromotionsPage() {
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const [modal, setModal] = useState<Promo | null>(null);
  const [promos, setPromos] = useState<Promo[]>(FALLBACK_PROMOS);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPromotions() {
      try {
        const res = await fetch('/api/promotions');
        const data = await res.json();

        if (Array.isArray(data)) {
          const mapped = data.map(mapPromotion);
          setPromos(mapped);
        } else {
          setError('ไม่สามารถโหลดโปรโมชั่นได้ในขณะนี้');
        }
      } catch (err) {
        console.error(err);
        setError('ไม่สามารถเชื่อมต่อกับ API โปรโมชั่นได้');
      } finally {
        setHasLoaded(true);
      }
    }

    fetchPromotions();
  }, []);

  const displayPromos = hasLoaded ? promos : FALLBACK_PROMOS;
  const visible = filter === 'all' ? displayPromos : displayPromos.filter(x => x.status === filter);
  const activeCount = displayPromos.filter(x => x.status === 'active').length;
  const upcomingCount = displayPromos.filter(x => x.status === 'upcoming').length;
  const featured = displayPromos.find(x => x.status === 'active' && x.tag === 'โปรโมชั่น') ?? displayPromos[0];

  const idx = modal ? visible.findIndex(x => x.id === modal.id) : -1;
  const goPrev = () => { if (idx > 0) setModal(visible[idx - 1]); };
  const goNext = () => { if (idx < visible.length - 1) setModal(visible[idx + 1]); };

  return (
    <div style={{ minHeight: '100vh', background: p.bg, fontFamily: "'Noto Sans Thai','Sarabun',sans-serif", overflowX: 'hidden' }}>
      <Navbar />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
        @keyframes pulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes shine   { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes slideUp { from{opacity:0;transform:translateY(28px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        .enter       { animation: fadeUp .4s ease both; }
        .float       { animation: float 3.4s ease-in-out infinite; }
        .pulse-anim  { animation: pulse 2s ease-in-out infinite; }
        .card-hover  { transition: transform .24s cubic-bezier(.22,.97,.36,1), box-shadow .24s ease; cursor: pointer; }
        .card-hover:hover { transform: translateY(-5px) scale(1.01); box-shadow: 0 22px 52px rgba(196,107,45,0.12)!important; }
        .emoji-hover { transition: transform .24s ease; }
        .card-hover:hover .emoji-hover { transform: scale(1.16) rotate(5deg); }
        .btn { border:none; cursor:pointer; font-family:inherit; transition: all .17s ease; }
        .btn:hover { filter:brightness(1.06); transform:translateY(-1px); }
        .shine-text {
          background: linear-gradient(90deg,#fff 0%,#ffe4c4 40%,#fff 60%,#ffe4c4 100%);
          background-size:200% auto; -webkit-background-clip:text;
          -webkit-text-fill-color:transparent; animation: shine 2.2s linear infinite;
        }
        .hero-wrap { max-width:1200px; margin:0 auto; padding:44px 24px 52px; position:relative; z-index:2; }
        .feat-grid { display:grid; grid-template-columns:1.15fr 0.85fr; }
        .feat-body { padding:38px 42px; }
        .feat-vis  { background:linear-gradient(135deg,#f4e1cf,#f8efe5); min-height:280px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; }
        .grid3     { display:grid; grid-template-columns:repeat(auto-fill,minmax(290px,1fr)); gap:22px; }
        @media(max-width:900px){
          .feat-grid { grid-template-columns:1fr; }
          .feat-vis  { min-height:160px; }
          .feat-body { padding:26px 22px; }
          .hero-wrap { padding:32px 20px 44px; }
        }
        @media(max-width:600px){
          .hero-wrap { padding:22px 16px 32px; }
          .feat-grid { border-radius:20px!important; }
          .grid3     { grid-template-columns:1fr; gap:16px; }
        }
      `}</style>

      {/* ══ HERO ══ */}
      <section style={{ background: 'linear-gradient(135deg,#fff7ef 0%,#f6ecdf 55%,#fffaf5 100%)', borderBottom: `1px solid ${p.border}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 340, height: 340, borderRadius: '50%', background: '#f5d3b8', filter: 'blur(100px)', top: -140, left: -80, opacity: 0.38, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: '#fde68a', filter: 'blur(70px)', top: 0, right: 60, opacity: 0.2, pointerEvents: 'none' }} />

        <div className="hero-wrap">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 999, background: p.accentSoft, color: p.accent, fontWeight: 800, fontSize: 12, border: `1.5px solid ${p.border}`, marginBottom: 18 }}>
            <Sparkles size={13} /> ข่าวสารล่าสุดของร้าน
          </div>

          <h1 style={{ fontSize: 'clamp(32px,5.5vw,62px)', lineHeight: 1.1, color: p.text, fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 14, maxWidth: 620 }}>
            โปรโมชั่น &amp; ข่าวสาร<br />
            <span style={{ color: p.accent }}>ร้านกับข้าวแม่</span>
          </h1>

          <p style={{ fontSize: 15, lineHeight: 1.8, color: p.muted, maxWidth: 460, marginBottom: 26 }}>
            รวมประกาศ เมนูใหม่ กิจกรรม และโปรโมชั่นพิเศษ อัปเดตตลอดเวลา
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: p.greenSoft, color: p.green, fontWeight: 700, padding: '7px 15px', borderRadius: 999, fontSize: 13 }}>
              <Flame size={13} /> กำลังจัด {activeCount} รายการ
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: p.amberSoft, color: p.amber, fontWeight: 700, padding: '7px 15px', borderRadius: 999, fontSize: 13 }}>
              <Bell size={13} /> เร็ว ๆ นี้ {upcomingCount} รายการ
            </span>
          </div>

          <button className="btn" onClick={() => document.getElementById('grid-section')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ background: p.accent, color: '#fff', padding: '12px 24px', borderRadius: 16, fontWeight: 800, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 22px rgba(196,107,45,0.26)' }}>
            ดูโปรโมชั่นทั้งหมด <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ══ FEATURED ══ */}
      {featured && (
        <section style={{ maxWidth: 1200, margin: '-38px auto 0', padding: '0 24px', position: 'relative', zIndex: 5 }}>
          <div className="card-hover feat-grid" onClick={() => setModal(featured)}
            style={{ background: '#fff', borderRadius: 28, border: `1px solid ${p.border}`, overflow: 'hidden', boxShadow: '0 22px 60px rgba(0,0,0,0.07)' }}>

            <div className="feat-body">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: p.greenSoft, color: p.green, padding: '6px 13px', borderRadius: 999, fontWeight: 800, fontSize: 12, marginBottom: 14 }}>
                <Flame size={12} /> แนะนำวันนี้
              </div>

              {featured.discount && (
                <div className="pulse-anim" style={{ display: 'inline-flex', alignItems: 'center', background: p.accent, borderRadius: 13, padding: '7px 17px', marginBottom: 14, boxShadow: '0 6px 18px rgba(196,107,45,0.27)' }}>
                  <span className="shine-text" style={{ fontSize: 'clamp(18px,3vw,24px)', fontWeight: 900 }}>ลด {featured.discount}</span>
                </div>
              )}

              <h2 style={{ fontSize: 'clamp(20px,2.8vw,30px)', lineHeight: 1.25, marginBottom: 10, color: p.text, fontWeight: 900 }}>{featured.title}</h2>
              <p style={{ color: p.muted, lineHeight: 1.85, fontSize: 14, maxWidth: 460, marginBottom: 18 }}>{featured.desc}</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: p.accent, fontWeight: 700, fontSize: 13, marginBottom: 22 }}>
                <CalendarDays size={13} /> {featured.date}
              </div>

              <button className="btn" onClick={e => { e.stopPropagation(); setModal(featured); }}
                style={{ background: p.accent, color: '#fff', borderRadius: 14, padding: '10px 20px', fontWeight: 800, fontSize: 13, boxShadow: '0 5px 16px rgba(196,107,45,0.22)' }}>
                ดูรายละเอียด
              </button>
            </div>

            <div className="feat-vis">
              <div className="float" style={{ fontSize: 90 }}>{featured.emoji}</div>
              <div style={{ display: 'flex', gap: 12 }}>
                {['🍜', '🥢', '🍛'].map((e, i) => (
                  <span key={i} className="float" style={{ fontSize: 26, animationDelay: `${i * 0.5}s` }}>{e}</span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ FILTER + GRID ══ */}
      <section id="grid-section" style={{ maxWidth: 1200, margin: '44px auto 0', padding: '0 24px 72px' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 26 }}>
          <div>
            <h2 style={{ fontSize: 26, marginBottom: 5, color: p.text, fontWeight: 900 }}>ข่าวสารและโปรโมชั่น</h2>
            <p style={{ color: p.muted, fontSize: 13 }}>อัปเดตกิจกรรมและประกาศจากทางร้าน</p>
          </div>

          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {([
              { val: 'all'      as const, label: `ทั้งหมด (${displayPromos.length})` },
              { val: 'active'   as const, label: `กำลังจัด (${activeCount})` },
              { val: 'upcoming' as const, label: `เร็ว ๆ นี้ (${upcomingCount})` },
              { val: 'ended'    as const, label: 'สิ้นสุด' },
            ]).map(f => (
              <button key={f.val} className="btn" onClick={() => setFilter(f.val)}
                style={{ padding: '7px 14px', borderRadius: 999, fontWeight: 700, fontSize: 12, border: `1.5px solid ${filter === f.val ? p.accent : p.border}`, background: filter === f.val ? p.accentSoft : '#fff', color: filter === f.val ? p.accent : p.muted }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {hasLoaded && error ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: p.muted }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>⚠️</div>
            <p style={{ fontSize: 15, fontWeight: 700 }}>{error}</p>
          </div>
        ) : hasLoaded && visible.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: p.muted }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>📭</div>
            <p style={{ fontSize: 15, fontWeight: 700 }}>ไม่มีรายการในหมวดนี้</p>
          </div>
        ) : (
          <div className="grid3">
            {visible.map((promo, i) => {
              const st = statusInfo(promo.status);
              return (
                <div key={promo.id} className="card-hover enter" onClick={() => setModal(promo)}
                  style={{ background: p.card, borderRadius: 22, border: `1.5px solid ${p.border}`, overflow: 'hidden', boxShadow: '0 6px 22px rgba(0,0,0,0.04)', position: 'relative', animationDelay: `${i * 0.06}s` }}>

                  {promo.discount && (
                    <div className="pulse-anim" style={{ position: 'absolute', top: 12, right: 12, zIndex: 3, background: p.accent, color: '#fff', fontWeight: 900, fontSize: 13, width: 46, height: 46, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(196,107,45,0.36)', textAlign: 'center', lineHeight: 1.1 }}>
                      {promo.discount}
                    </div>
                  )}

                  <div style={{ height: 168, background: cardGrad(promo.tag), display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                    <span className="emoji-hover" style={{ fontSize: 58 }}>{promo.emoji}</span>
                    <div style={{ position: 'absolute', top: 10, left: 10, background: st.bg, color: st.fg, padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 3 }}>
                      {st.Icon && <st.Icon size={10} />} {st.label}
                    </div>
                    <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(255,255,255,0.88)', color: p.accent, padding: 6, borderRadius: 9, display: 'flex', backdropFilter: 'blur(4px)' }}>
                      {tagIcon(promo.tag)}
                    </div>
                  </div>

                  <div style={{ padding: '16px 18px 18px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 9px', borderRadius: 999, background: p.accentSoft, color: p.accent, fontSize: 10, fontWeight: 800, marginBottom: 9 }}>
                      {tagIcon(promo.tag)} {promo.tag}
                    </span>
                    <h3 style={{ fontSize: 'clamp(15px,2vw,18px)', lineHeight: 1.35, color: p.text, marginBottom: 6, fontWeight: 800 }}>{promo.title}</h3>
                    <p style={{ color: p.muted, lineHeight: 1.7, fontSize: 13, marginBottom: 14 }}>{promo.desc}</p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: p.accent, fontWeight: 700, fontSize: 12 }}>
                        <CalendarDays size={12} /> {promo.date}
                      </div>
                      <button className="btn" onClick={e => { e.stopPropagation(); setModal(promo); }}
                        style={{ background: p.accentSoft, color: p.accent, borderRadius: 10, padding: '6px 13px', fontWeight: 800, fontSize: 12 }}>
                        อ่านเพิ่มเติม
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ══ MODAL ══ */}
      {modal && (
        <Modal
          promo={modal} onClose={() => setModal(null)}
          onPrev={goPrev} onNext={goNext}
          hasPrev={idx > 0} hasNext={idx < visible.length - 1}
        />
      )}
    </div>
  );
}