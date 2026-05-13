'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/src/backend/components/Navbar';

type OrderItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
};

type Order = {
  id: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  orderType: string;
  guestName: string | null;
  guestPhone: string | null;
  createdAt: string;
  items: OrderItem[];
};

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  new:       { label: 'รอดำเนินการ', color: '#B45309', bg: '#FEF3C7', dot: '#F59E0B' },
  cooking:   { label: 'กำลังทำ',     color: '#1D4ED8', bg: '#DBEAFE', dot: '#3B82F6' },
  ready:     { label: 'พร้อมเสิร์ฟ', color: '#065F46', bg: '#D1FAE5', dot: '#10B981' },
  completed: { label: 'สำเร็จ',      color: '#374151', bg: '#F3F4F6', dot: '#9CA3AF' },
  done:      { label: 'สำเร็จ',      color: '#374151', bg: '#F3F4F6', dot: '#9CA3AF' },
  cancelled: { label: 'ยกเลิก',      color: '#991B1B', bg: '#FEE2E2', dot: '#EF4444' },
};

const PAYMENT_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'รอชำระ',   color: '#B45309', bg: '#FEF9EE' },
  paid:      { label: 'ชำระแล้ว', color: '#065F46', bg: '#ECFDF5' },
  cancelled: { label: 'ยกเลิก',   color: '#991B1B', bg: '#FFF5F5' },
};

// ---- Status Timeline Steps ----
const STATUS_STEPS = [
  { key: 'new',     icon: '📋', label: 'รับออร์เดอร์' },
  { key: 'cooking', icon: '👨‍🍳', label: 'กำลังปรุง'  },
  { key: 'ready',   icon: '🔔', label: 'พร้อมรับ'    },
  { key: 'done',    icon: '✅', label: 'รับแล้ว'     },
];

const STATUS_ORDER = ['new', 'cooking', 'ready', 'done', 'completed'];

function getStatusIndex(status: string) {
  const idx = STATUS_ORDER.indexOf(status);
  return idx === -1 ? 0 : idx;
}

// ---- Order Card ----
function OrderCard({ order, defaultOpen = false }: { order: Order; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const st = STATUS_LABEL[order.status] ?? { label: order.status, color: '#374151', bg: '#F3F4F6', dot: '#9CA3AF' };
  const pm = PAYMENT_LABEL[order.paymentStatus] ?? { label: order.paymentStatus, color: '#374151', bg: '#F3F4F6' };
  const statusIdx = getStatusIndex(order.status);
  const isDone = order.status === 'done' || order.status === 'completed';

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString('th-TH', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div
      className="bg-white rounded-2xl border border-[#F3DDD0] overflow-hidden"
      style={{ boxShadow: open ? '0 4px 20px rgba(61,26,0,0.07)' : '0 1px 4px rgba(61,26,0,0.04)' }}
    >
      {/* Card Header — clickable */}
      <button
        className="w-full text-left px-4 py-4 flex items-start gap-3 hover:bg-[#FFFAF7] transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        {/* Order number */}
        <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xs font-extrabold text-[#E8530A] bg-[#FFF0E6] border border-[#FFD9C2]">
          #{String(order.id).padStart(3, '0')}
        </div>

        <div className="flex-1 min-w-0">
          {/* Status + Payment row */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ color: st.color, background: st.bg }}
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: st.dot }} />
              {st.label}
            </span>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ color: pm.color, background: pm.bg }}
            >
              {pm.label}
            </span>
            {order.paymentMethod && (
              <span className="text-xs text-[#C4A99A]">
                {order.paymentMethod === 'cash' ? '💵 เงินสด' : '📱 QR'}
              </span>
            )}
          </div>

          {/* Guest info */}
          {(order.guestName || order.guestPhone) && (
            <p className="text-xs text-[#9A6651] mb-0.5">
              {order.guestName && <span className="font-semibold text-[#7C3A10]">{order.guestName}</span>}
              {order.guestName && order.guestPhone && <span className="mx-1">·</span>}
              {order.guestPhone && <span className="font-mono">{order.guestPhone}</span>}
            </p>
          )}

          <p className="text-xs text-[#C4A99A]">🕐 {formatDate(order.createdAt)}</p>
        </div>

        {/* Total + chevron */}
        <div className="shrink-0 text-right flex flex-col items-end gap-1">
          <span className="text-base font-extrabold text-[#E8530A]">฿{order.total.toLocaleString()}</span>
          <span className="text-[10px] text-[#C4A99A]">{order.items.length} เมนู</span>
          <span
            className="text-[#C4A99A] text-xs leading-none"
            style={{ transform: open ? 'rotate(180deg)' : 'none', display: 'inline-block', transition: 'transform .2s' }}
          >▼</span>
        </div>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="border-t border-[#FFF0E6]">

          {/* Status Timeline */}
          <div className="px-4 pt-4 pb-3">
            <p className="text-[10px] font-bold text-[#C4A99A] uppercase tracking-widest mb-3">สถานะออร์เดอร์</p>
            <div className="flex items-center gap-0">
              {STATUS_STEPS.map((step, i) => {
                const active = i <= statusIdx;
                const current = STATUS_ORDER[statusIdx] === step.key;
                return (
                  <div key={step.key} className="flex items-center" style={{ flex: i < STATUS_STEPS.length - 1 ? '1' : 'none' }}>
                    {/* Step circle */}
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                        style={{
                          background: active ? (current ? '#E8530A' : '#FFF0E6') : '#F5F5F5',
                          border: `2px solid ${active ? (current ? '#E8530A' : '#FFD9C2') : '#E5E5E5'}`,
                          fontSize: current ? '1rem' : '0.85rem',
                          boxShadow: current ? '0 0 0 4px rgba(232,83,10,0.12)' : 'none',
                        }}
                      >
                        {isDone && i <= statusIdx ? '✓' : step.icon}
                      </div>
                      <span
                        className="text-[9px] font-semibold text-center leading-tight"
                        style={{ color: active ? (current ? '#E8530A' : '#9A6651') : '#D1C4BE', whiteSpace: 'nowrap' }}
                      >
                        {step.label}
                      </span>
                    </div>
                    {/* Connector */}
                    {i < STATUS_STEPS.length - 1 && (
                      <div
                        className="flex-1 h-0.5 mb-4 mx-1 rounded-full transition-colors"
                        style={{ background: i < statusIdx ? '#FFD9C2' : '#F0F0F0' }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Items list */}
          <div className="px-4 pb-4 border-t border-[#FFF9F6] pt-3">
            <p className="text-[10px] font-bold text-[#C4A99A] uppercase tracking-widest mb-2">รายการอาหาร</p>
            <div className="space-y-2">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#FFF0E6] text-[#E8530A] text-[10px] font-bold flex items-center justify-center shrink-0">
                      {item.qty}
                    </span>
                    <span className="text-[#3D1A00] font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#3D1A00]">฿{(item.price * item.qty).toLocaleString()}</span>
                    {item.qty > 1 && (
                      <span className="text-xs text-[#C4A99A] ml-1">(฿{item.price} ×{item.qty})</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#FFF0E6]">
              <span className="text-xs font-semibold text-[#9A6651]">รวมทั้งหมด</span>
              <span className="font-extrabold text-[#E8530A] text-base">฿{order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Main Page ----
export default function OrdersPage() {
  const router = useRouter();

  // Phone-search state only — ไม่โหลด all orders อัตโนมัติ
  const [phone, setPhone]             = useState('');
  const [phoneOrders, setPhoneOrders] = useState<Order[] | null>(null);
  const [searching, setSearching]     = useState(false);
  const [searchError, setSearchError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  async function searchByPhone() {
    const trimmed = phone.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }
    setSearching(true);
    setSearchError('');
    setHasSearched(true);
    try {
      const res = await fetch(`/api/orders/by-phone?phone=${encodeURIComponent(trimmed)}`);
      if (!res.ok) throw new Error('ค้นหาไม่สำเร็จ');
      setPhoneOrders(await res.json());
    } catch (e: any) {
      setSearchError(e.message || 'เกิดข้อผิดพลาด');
      setPhoneOrders(null);
    } finally {
      setSearching(false);
    }
  }

  function clearSearch() {
    setPhone('');
    setPhoneOrders(null);
    setHasSearched(false);
    setSearchError('');
    inputRef.current?.focus();
  }

  return (
    <div className="min-h-screen bg-[#FFF8F2] relative overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700;800&display=swap');
        * { font-family: 'Sarabun', sans-serif; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulseRing {
          0%   { box-shadow: 0 0 0 0 rgba(232,83,10,0.3); }
          70%  { box-shadow: 0 0 0 8px rgba(232,83,10,0); }
          100% { box-shadow: 0 0 0 0 rgba(232,83,10,0); }
        }

        .slide-up  { animation: slideUp 0.4s ease both; }
        .fade-in   { animation: fadeIn  0.3s ease both; }

        .d-1 { animation-delay: 0.04s; }
        .d-2 { animation-delay: 0.08s; }
        .d-3 { animation-delay: 0.12s; }
        .d-4 { animation-delay: 0.16s; }
        .d-5 { animation-delay: 0.20s; }

        .skeleton {
          background: linear-gradient(90deg, #F3DDD0 25%, #FFF0E6 50%, #F3DDD0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.2s infinite;
          border-radius: 8px;
        }
        .spinner {
          width: 20px; height: 20px;
          border: 2.5px solid #FFD9C2;
          border-top-color: #E8530A;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          display: inline-block;
        }
        .search-btn {
          transition: all .18s ease;
        }
        .search-btn:hover:not(:disabled) {
          background: #C8440A;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(232,83,10,0.25);
        }
        .search-btn:active:not(:disabled) {
          transform: scale(0.97);
        }
        .phone-input:focus {
          outline: none;
          border-color: #E8530A;
          box-shadow: 0 0 0 3px rgba(232,83,10,0.12);
        }
        .clear-btn {
          transition: all .15s ease;
        }
        .clear-btn:hover {
          color: #E8530A;
          background: #FFF0E6;
        }
        .pulse-dot {
          animation: pulseRing 2s infinite;
        }
      `}</style>

      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* ── Header ── */}
        <div className={`flex items-center justify-between mb-5 ${mounted ? 'slide-up' : 'opacity-0'}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/cart')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#F3DDD0] bg-white text-[#7C3A10] text-xs font-semibold hover:border-[#E8530A] hover:text-[#E8530A] transition-all"
            >
              ← กลับตะกร้า
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-[#3D1A00]">ประวัติการสั่งซื้อ</h1>
              <p className="text-xs text-[#9A6651] mt-0.5">
                {phoneOrders !== null
                  ? `พบ ${phoneOrders.length} ออร์เดอร์ สำหรับ ${phone}`
                  : 'กรุณากรอกเบอร์โทรเพื่อค้นหา'}
              </p>
            </div>
          </div>
          <button
            onClick={searchByPhone}
            disabled={!phone.trim()}
            className="p-2 rounded-xl border border-[#F3DDD0] bg-white text-[#9A6651] hover:bg-[#FFF0E6] hover:text-[#E8530A] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="รีเฟรช"
          >
            🔄
          </button>
        </div>

        {/* ── Phone Search Box ── */}
        <div className={`mb-5 ${mounted ? 'slide-up d-2' : 'opacity-0'}`}>
          <div
            className="bg-white rounded-2xl border border-[#F3DDD0] p-4"
            style={{ boxShadow: '0 2px 12px rgba(61,26,0,0.06)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">📞</span>
              <p className="text-sm font-bold text-[#3D1A00]">ค้นหาด้วยเบอร์โทร</p>
              {hasSearched && phoneOrders !== null && (
                <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-[#065F46] bg-[#D1FAE5] px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] inline-block pulse-dot" />
                  กำลังกรอง
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4A99A] text-sm select-none">
                  📱
                </span>
                <input
                  ref={inputRef}
                  type="tel"
                  placeholder="ใส่เบอร์โทร เช่น 0812345678"
                  value={phone}
                  onChange={e => {
                    setPhone(e.target.value);
                    if (!e.target.value.trim()) clearSearch();
                  }}
                  onKeyDown={e => e.key === 'Enter' && searchByPhone()}
                  className="phone-input w-full pl-9 pr-10 py-2.5 text-sm border border-[#F3DDD0] rounded-xl bg-[#FFFAF7] text-[#3D1A00] font-medium placeholder:text-[#D1C4BE] transition-all"
                />
                {phone && (
                  <button
                    onClick={clearSearch}
                    className="clear-btn absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-xs text-[#C4A99A]"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                onClick={searchByPhone}
                disabled={searching || !phone.trim()}
                className="search-btn shrink-0 px-4 py-2.5 rounded-xl bg-[#E8530A] text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {searching ? <span className="spinner" /> : 'ค้นหา'}
              </button>

              {hasSearched && (
                <button
                  onClick={clearSearch}
                  className="clear-btn shrink-0 px-3 py-2.5 rounded-xl border border-[#F3DDD0] bg-white text-[#9A6651] text-xs font-semibold"
                >
                  ล้าง
                </button>
              )}
            </div>

            {searchError && (
              <p className="text-xs text-red-600 mt-2 flex items-center gap-1">⚠️ {searchError}</p>
            )}
          </div>
        </div>

        {/* ── PHONE SEARCH RESULTS ── */}
        {hasSearched && (
          <div className="fade-in">
            {searching && (
              <div className="space-y-3">
                {[1, 2].map(n => (
                  <div key={n} className="bg-white rounded-2xl border border-[#F3DDD0] p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="skeleton h-4 w-24" />
                      <div className="skeleton h-5 w-16" />
                    </div>
                    <div className="skeleton h-3 w-40 mb-2" />
                    <div className="skeleton h-3 w-32" />
                  </div>
                ))}
              </div>
            )}

            {!searching && phoneOrders !== null && phoneOrders.length === 0 && (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-[#9A6651] font-semibold">ไม่พบออร์เดอร์</p>
                <p className="text-[#C4A99A] text-sm mt-1">
                  ไม่มีประวัติการสั่งซื้อสำหรับเบอร์ <span className="font-bold text-[#7C3A10]">{phone}</span>
                </p>
                <button
                  onClick={clearSearch}
                  className="mt-4 px-5 py-2 rounded-xl border border-[#F3DDD0] text-[#9A6651] text-sm font-semibold hover:bg-[#FFF0E6] transition-all"
                >
                  ล้างการค้นหา
                </button>
              </div>
            )}

            {!searching && phoneOrders !== null && phoneOrders.length > 0 && (
              <>
                {/* Summary bar */}
                <div className="flex items-center justify-between px-1 mb-3">
                  <p className="text-xs font-bold text-[#7C3A10]">
                    📞 {phone} — {phoneOrders.length} ออร์เดอร์
                  </p>
                  <p className="text-xs text-[#9A6651]">
                    รวม ฿{phoneOrders.reduce((s, o) => s + o.total, 0).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-3">
                  {phoneOrders.map((order, i) => (
                    <div
                      key={order.id}
                      className={`slide-up d-${Math.min(i + 1, 5) as 1|2|3|4|5}`}
                    >
                      <OrderCard order={order} defaultOpen={i === 0} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Empty state — ยังไม่ได้ค้นหา ── */}
        {!hasSearched && (
          <div className={`text-center py-20 ${mounted ? 'fade-in' : 'opacity-0'}`}>
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-[#9A6651] text-base font-semibold">ค้นหาด้วยเบอร์โทร</p>
            <p className="text-[#C4A99A] text-sm mt-1">ใส่เบอร์โทรด้านบนเพื่อดูประวัติการสั่งซื้อ</p>
          </div>
        )}
      </div>
    </div>
  );
}