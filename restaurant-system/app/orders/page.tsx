'use client';

import { useEffect, useState } from 'react';
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

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  new:        { label: 'รอดำเนินการ', color: '#B45309', bg: '#FEF3C7' },
  preparing:  { label: 'กำลังทำ',     color: '#1D4ED8', bg: '#DBEAFE' },
  ready:      { label: 'พร้อมเสิร์ฟ', color: '#065F46', bg: '#D1FAE5' },
  completed:  { label: 'สำเร็จ',      color: '#374151', bg: '#F3F4F6' },
  cancelled:  { label: 'ยกเลิก',      color: '#991B1B', bg: '#FEE2E2' },
};

const PAYMENT_LABEL: Record<string, { label: string; color: string }> = {
  pending:  { label: 'รอชำระ',   color: '#B45309' },
  paid:     { label: 'ชำระแล้ว', color: '#065F46' },
  cancelled:{ label: 'ยกเลิก',  color: '#991B1B' },
};

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('โหลดข้อมูลไม่สำเร็จ');
      const data = await res.json();
      setOrders(data);
    } catch (e: any) {
      setError(e.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id: number) => setExpanded(prev => prev === id ? null : id);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('th-TH', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-[#FFF8F2] relative overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700;800&display=swap');
        * { font-family: 'Sarabun', sans-serif; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes popIn {
          from { transform: scale(0.8); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes expandDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }

        .slide-up    { animation: slideUp    0.45s ease both; }
        .slide-right { animation: slideRight 0.45s ease both; }
        .fade-in     { animation: fadeIn     0.3s ease both; }
        .pop-in      { animation: popIn      0.3s cubic-bezier(0.34,1.56,0.64,1) both; }
        .expand-down { animation: expandDown 0.25s ease both; }

        .d-1 { animation-delay: 0.05s; }
        .d-2 { animation-delay: 0.10s; }
        .d-3 { animation-delay: 0.15s; }
        .d-4 { animation-delay: 0.20s; }
        .d-5 { animation-delay: 0.25s; }

        .card-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(61,26,0,0.09);
        }

        .spinner {
          width: 36px; height: 36px;
          border: 3px solid #F3DDD0;
          border-top-color: #E8530A;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        .skeleton {
          background: linear-gradient(90deg, #F3DDD0 25%, #FFF0E6 50%, #F3DDD0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.2s infinite;
          border-radius: 10px;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .back-btn {
          transition: all 0.2s ease;
        }
        .back-btn:hover {
          border-color: #E8530A;
          color: #E8530A;
          transform: translateX(-2px);
        }

        .refresh-btn {
          transition: all 0.2s ease;
        }
        .refresh-btn:hover {
          background: #FFF0E6;
          color: #E8530A;
        }

        .toggle-icon {
          transition: transform 0.25s ease;
        }
        .toggle-icon.open {
          transform: rotate(180deg);
        }
      `}</style>

      <Navbar />

      <div className="max-w-3xl mx-auto px-5 py-8">

        {/* HEADER */}
        <div className={`flex items-center justify-between mb-7 ${mounted ? 'slide-right' : 'opacity-0'}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/cart')}
              className="back-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#F3DDD0] bg-white text-[#7C3A10] text-xs font-semibold"
            >
              ← กลับตะกร้า
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-[#3D1A00]">ประวัติการสั่งซื้อ</h1>
              {!loading && (
                <p className="text-sm text-[#9A6651] mt-0.5">{orders.length} รายการ</p>
              )}
            </div>
          </div>
          <button
            onClick={fetchOrders}
            className="refresh-btn p-2 rounded-xl border border-[#F3DDD0] bg-white text-[#9A6651] text-sm"
            title="รีเฟรช"
          >
            🔄
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="space-y-3 fade-in">
            {[1, 2, 3].map(n => (
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

        {/* ERROR */}
        {!loading && error && (
          <div className="text-center py-20 fade-in">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-[#9A6651] font-medium">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-4 px-5 py-2 rounded-xl bg-[#E8530A] text-white text-sm font-bold hover:bg-[#C8440A] active:scale-95 transition-all"
            >
              ลองใหม่
            </button>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-24 fade-in">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-[#9A6651] text-base font-medium">ยังไม่มีประวัติการสั่งซื้อ</p>
            <p className="text-[#C4A99A] text-sm mt-1">สั่งเมนูที่ชอบได้เลย!</p>
            <button
              onClick={() => router.push('/menu')}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3D1A00] text-white text-sm font-bold hover:bg-[#5C2A00] active:scale-95 transition-all"
            >
              🍽 ไปดูเมนู
            </button>
          </div>
        )}

        {/* ORDER LIST */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-3">
            {orders.map((order, i) => {
              const st = STATUS_LABEL[order.status]  ?? { label: order.status,        color: '#374151', bg: '#F3F4F6' };
              const pm = PAYMENT_LABEL[order.paymentStatus] ?? { label: order.paymentStatus, color: '#374151' };
              const isOpen = expanded === order.id;

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl border border-[#F3DDD0] overflow-hidden card-hover
                    ${mounted ? `slide-up d-${Math.min(i + 1, 5) as 1|2|3|4|5}` : 'opacity-0'}`}
                  onClick={() => toggle(order.id)}
                >
                  {/* CARD HEADER */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-[#3D1A00] text-sm">
                            # {order.id}
                          </span>
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ color: st.color, background: st.bg }}
                          >
                            {st.label}
                          </span>
                          <span
                            className="text-xs font-semibold"
                            style={{ color: pm.color }}
                          >
                            {pm.label}
                          </span>
                        </div>

                        <p className="text-xs text-[#9A6651] mt-1">
                          {order.guestName && <span className="font-semibold text-[#7C3A10]">{order.guestName}</span>}
                          {order.guestName && order.guestPhone && <span className="mx-1">·</span>}
                          {order.guestPhone}
                        </p>

                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span className="text-xs text-[#C4A99A]">
                            {order.orderType === 'dine-in' ? '🍽 นั่งกินที่ร้าน' : '🥡 Take Away'}
                          </span>
                          {order.paymentMethod && (
                            <span className="text-xs text-[#C4A99A]">
                              {order.paymentMethod === 'cash' ? '💵 เงินสด' : '📱 QR'}
                            </span>
                          )}
                          <span className="text-xs text-[#C4A99A]">🕐 {formatDate(order.createdAt)}</span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                        <span className="text-lg font-extrabold text-[#E8530A]">
                          ฿{order.total.toLocaleString()}
                        </span>
                        <span className="text-xs text-[#C4A99A]">
                          {order.items.length} เมนู
                        </span>
                        <span className={`toggle-icon text-[#C4A99A] text-xs ${isOpen ? 'open' : ''}`}>
                          ▼
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* EXPANDED: ITEMS */}
                  {isOpen && (
                    <div className="border-t border-[#FFF0E6] expand-down">
                      <div className="px-4 py-3 space-y-2">
                        <p className="text-xs font-bold text-[#7C3A10] uppercase tracking-widest mb-2">
                          🛒 รายการอาหาร
                        </p>
                        {order.items.map(item => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-[#FFF0E6] text-[#E8530A] text-xs font-bold flex items-center justify-center flex-shrink-0">
                                {item.qty}
                              </span>
                              <span className="text-[#3D1A00] font-medium">{item.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-[#3D1A00]">
                                ฿{(item.price * item.qty).toLocaleString()}
                              </span>
                              {item.qty > 1 && (
                                <span className="text-xs text-[#C4A99A] ml-1">
                                  (฿{item.price} × {item.qty})
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-between items-center pt-2 border-t border-[#FFF0E6] mt-2">
                          <span className="text-xs font-semibold text-[#9A6651]">รวมทั้งหมด</span>
                          <span className="font-extrabold text-[#E8530A]">
                            ฿{order.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}