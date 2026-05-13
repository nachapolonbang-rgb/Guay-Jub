'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus, CheckCheck, TrendingUp, Lightbulb,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Calendar,
} from 'lucide-react';

// ---- Types ----
type OrderStatus = 'PENDING' | 'new' | 'cooking' | 'ready' | 'done';

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: number;
  total: number;
  status: OrderStatus;
  guestName?: string;
  guestPhone?: string;
  orderType?: string;
  createdAt: string;
  items: OrderItem[];
}

// ---- Helpers ----
function toDateStr(d: Date) {
  return d.toISOString().split('T')[0]; // "2025-05-03"
}

function formatDateThai(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('th-TH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function isToday(dateStr: string) {
  return dateStr === toDateStr(new Date());
}

// ---- Stock (static) ----
const STOCK = [
  { name: 'ก๋วยจั๊บ',    status: 'ok'  },
  { name: 'หมูสามชั้น',  status: 'ok'  },
  { name: 'ผักบุ้ง',     status: 'low' },
  { name: 'คะน้า',       status: 'ok'  },
  { name: 'เครื่องใน',   status: 'low' },
  { name: 'พริกไทยดำ',   status: 'out' },
] as const;

const STOCK_CLASS  = { ok: 'bg-emerald-100 text-emerald-700', low: 'bg-amber-100 text-amber-700', out: 'bg-red-100 text-red-600' };
const STOCK_LABEL  = { ok: 'พอ', low: 'ใกล้หมด', out: 'หมดแล้ว' };

// ---- Toast ----
function Toast({ msg, show }: { msg: string; show: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-sm text-zinc-800 shadow-sm mb-4 transition-all duration-200 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
      {msg}
    </div>
  );
}

// ---- Main Page ----
export default function DashboardPage() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()));
  const [toast, setToast]         = useState({ show: false, msg: '' });

  function showToastMsg(msg: string) {
    setToast({ show: true, msg });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2500);
  }

  // ---- Fetch all orders ----
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error();
      const data: Order[] = await res.json();
      setAllOrders(data);
    } catch {
      showToastMsg('โหลดข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ---- Filter by selected date ----
  const dayOrders = useMemo(() =>
    allOrders.filter(o => o.createdAt.split('T')[0] === selectedDate),
    [allOrders, selectedDate]
  );

  // ---- Stats for selected day ----
  const stats = useMemo(() => {
    const done     = dayOrders.filter(o => o.status === 'done');
    const revenue  = done.reduce((s, o) => s + o.total, 0);
    const avgOrder = done.length ? Math.round(revenue / done.length) : 0;
    const pending  = dayOrders.filter(o => o.status !== 'done').length;
    return { total: dayOrders.length, revenue, avgOrder, pending };
  }, [dayOrders]);

  // ---- Best sellers for selected day ----
  const bestSellers = useMemo(() => {
    const map: Record<string, number> = {};
    dayOrders.forEach(o =>
      o.items.forEach(item => {
        map[item.name] = (map[item.name] ?? 0) + item.qty;
      })
    );
    const sorted = Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const max = sorted[0]?.[1] ?? 1;
    return sorted.map(([name, count]) => ({
      name, count, pct: Math.round((count / max) * 100),
    }));
  }, [dayOrders]);

  // ---- Weekly summary (last 7 days) ----
  const weekData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = toDateStr(d);
      const dayName = d.toLocaleDateString('th-TH', { weekday: 'short' });
      const orders  = allOrders.filter(o => o.createdAt.split('T')[0] === dateStr);
      const revenue = orders.filter(o => o.status === 'done').reduce((s, o) => s + o.total, 0);
      return { dateStr, dayName, revenue, orderCount: orders.length };
    });
  }, [allOrders]);

  // ---- Date navigation ----
  function prevDay() {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(toDateStr(d));
  }
  function nextDay() {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d < tomorrow) setSelectedDate(toDateStr(d));
  }

  const canGoNext = selectedDate < toDateStr(new Date());

  return (
    <div className="p-5 lg:p-7 min-h-screen bg-zinc-100">

      {/* ---- Top bar ---- */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">ร้านก๋วยจั๊บป้าแดง</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Dashboard เจ้าของร้าน</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          เปิดให้บริการ
        </span>
      </div>

      <Toast show={toast.show} msg={toast.msg} />

      {/* ---- Date Picker ---- */}
      <div className="flex items-center gap-3 bg-white rounded-2xl border border-zinc-100 px-4 py-3 mb-5 w-fit">
        <button onClick={prevDay} className="p-1 rounded-lg hover:bg-zinc-50 text-zinc-400 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-zinc-400" />
          <span className="text-sm font-medium text-zinc-800">
            {isToday(selectedDate) ? 'วันนี้ — ' : ''}{formatDateThai(selectedDate)}
          </span>
        </div>
        <button
          onClick={nextDay}
          disabled={!canGoNext}
          className="p-1 rounded-lg hover:bg-zinc-50 text-zinc-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-zinc-200 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ---- Metric cards ---- */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              {
                label: isToday(selectedDate) ? 'ยอดขายวันนี้' : 'ยอดขายวันนั้น',
                value: `฿${stats.revenue.toLocaleString()}`,
                sub: `จาก ${stats.total} ออเดอร์`,
                subColor: 'text-zinc-400',
              },
              {
                label: 'ออเดอร์ทั้งหมด',
                value: String(stats.total),
                sub: `รับแล้ว ${stats.total - stats.pending} รายการ`,
                subColor: 'text-emerald-600',
              },
              {
                label: 'เฉลี่ย/ออเดอร์',
                value: stats.avgOrder ? `฿${stats.avgOrder}` : '–',
                sub: 'เฉพาะออเดอร์ที่รับแล้ว',
                subColor: 'text-zinc-400',
              },
              {
                label: isToday(selectedDate) ? 'รอดำเนินการ' : 'ค้างจ่าย',
                value: String(stats.pending),
                sub: 'ออเดอร์',
                subColor: stats.pending > 0 ? 'text-amber-500' : 'text-zinc-400',
              },
            ].map(m => (
              <div key={m.label} className="bg-white rounded-2xl p-4 border border-zinc-100 hover:-translate-y-0.5 transition-transform">
                <p className="text-xs text-zinc-400 mb-1">{m.label}</p>
                <p className="text-2xl font-semibold text-zinc-900">{m.value}</p>
                <p className={`text-xs mt-1 ${m.subColor}`}>{m.sub}</p>
              </div>
            ))}
          </div>

          {/* ---- Main grid ---- */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">

            {/* ---- Orders list ---- */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-zinc-100 p-4">
              <p className="text-sm font-medium text-zinc-800 mb-3">
                ออเดอร์วันนี้{' '}
                <span className="text-xs text-zinc-400 font-normal">({dayOrders.length} รายการ)</span>
              </p>
              {dayOrders.length === 0 ? (
                <p className="text-sm text-zinc-400 text-center py-8">ไม่มีออเดอร์วันนี้</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {dayOrders.map(o => (
                    <div key={o.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-50">
                      <span className="text-xs font-medium text-zinc-400 w-9 shrink-0">
                        #{String(o.id).padStart(3, '0')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-700 truncate">
                          {o.items.map(i => `${i.name} ×${i.qty}`).join(', ')}
                        </p>
                        {o.guestName && (
                          <p className="text-xs text-zinc-400">{o.guestName} · {o.guestPhone}</p>
                        )}
                      </div>
                      <span className="text-sm font-medium text-zinc-800 shrink-0">฿{o.total}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                        o.status === 'done'    ? 'bg-zinc-100 text-zinc-500' :
                        o.status === 'ready'   ? 'bg-emerald-100 text-emerald-700' :
                        o.status === 'cooking' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {o.status === 'done' ? 'รับแล้ว' : o.status === 'ready' ? 'พร้อมรับ' : o.status === 'cooking' ? 'กำลังปรุง' : 'ใหม่'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ---- Right column ---- */}
            <div className="lg:col-span-2 flex flex-col gap-4">

              {/* Best sellers */}
              <div className="bg-white rounded-2xl border border-zinc-100 p-4">
                <p className="text-sm font-medium text-zinc-800 mb-3">🏆 เมนูขายดีวันนี้</p>
                {bestSellers.length === 0 ? (
                  <p className="text-sm text-zinc-400 text-center py-4">ยังไม่มีข้อมูล</p>
                ) : (
                  <div className="space-y-3">
                    {bestSellers.map((m, i) => (
                      <div key={m.name} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-zinc-300 w-4">{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <p className="text-sm font-medium text-zinc-800">{m.name}</p>
                            <p className="text-xs text-zinc-400">{m.count} ชิ้น</p>
                          </div>
                          <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-emerald-300' : 'bg-zinc-300'
                              }`}
                              style={{ width: `${m.pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Stock */}
              <div className="bg-white rounded-2xl border border-zinc-100 p-4">
                <p className="text-sm font-medium text-zinc-800 mb-3">สต็อกวัตถุดิบ</p>
                <div className="grid grid-cols-2 gap-2">
                  {STOCK.map(s => (
                    <div key={s.name} className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-zinc-50">
                      <span className="text-xs text-zinc-700">{s.name}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${STOCK_CLASS[s.status]}`}>
                        {STOCK_LABEL[s.status]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ---- Weekly bar chart ---- */}
          <div className="bg-white rounded-2xl border border-zinc-100 p-4">
            <p className="text-sm font-medium text-zinc-800 mb-4">ยอดขาย 7 วันย้อนหลัง</p>
            <div className="grid grid-cols-7 gap-2">
              {weekData.map(d => {
                const isSelected = d.dateStr === selectedDate;
                const maxRevenue = Math.max(...weekData.map(x => x.revenue), 1);
                const barPct = Math.round((d.revenue / maxRevenue) * 100);
                return (
                  <button
                    key={d.dateStr}
                    onClick={() => setSelectedDate(d.dateStr)}
                    className={`rounded-xl py-3 px-1 text-center border transition-all hover:-translate-y-0.5 ${
                      isSelected
                        ? 'bg-white border-emerald-400 border-[1.5px] shadow-sm'
                        : 'bg-zinc-50 border-zinc-100 hover:border-zinc-300'
                    }`}
                  >
                    <p className="text-[11px] text-zinc-400 mb-1">{d.dayName}</p>
                    {/* Mini bar */}
                    <div className="w-full h-8 flex items-end justify-center mb-1">
                      <div
                        className={`w-4 rounded-sm transition-all duration-500 ${isSelected ? 'bg-emerald-500' : 'bg-zinc-200'}`}
                        style={{ height: d.revenue > 0 ? `${Math.max(barPct, 10)}%` : '4px' }}
                      />
                    </div>
                    <p className="text-[10px] font-medium text-zinc-800">
                      {d.revenue > 0 ? `฿${d.revenue.toLocaleString()}` : '–'}
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      {d.orderCount > 0 ? `${d.orderCount} ออเดอร์` : isToday(d.dateStr) ? 'วันนี้' : 'ปิด'}
                    </p>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-zinc-400 mt-3">💡 กดวันไหนก็จะดูรายละเอียดวันนั้นได้เลย</p>
          </div>
        </>
      )}
    </div>
  );
}