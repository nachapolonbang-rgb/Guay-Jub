'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Calendar, Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface OrderItem { name: string; qty: number; price: number; }
interface Order {
  id: number; total: number; status: string;
  guestName?: string; guestPhone?: string;
  createdAt: string; items: OrderItem[];
}

function toDateStr(d: Date) { return d.toISOString().split('T')[0]; }

function formatThaiShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' });
}

type Period = 'week' | 'month';

export default function ReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('week');
  const [offset, setOffset] = useState(0); // 0 = current, -1 = prev, etc.

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error();
      setOrders(await res.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ---- Date range based on period + offset ----
  const { dateRange, labels } = useMemo(() => {
    const today = new Date();
    const days: string[] = [];

    if (period === 'week') {
      // offset weeks
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay() + 1 + offset * 7); // Mon
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        days.push(toDateStr(d));
      }
    } else {
      // offset months
      const ref = new Date(today.getFullYear(), today.getMonth() + offset, 1);
      const daysInMonth = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(ref.getFullYear(), ref.getMonth(), i);
        days.push(toDateStr(d));
      }
    }

    const labels = days.map(d => {
      const date = new Date(d);
      if (period === 'week') return date.toLocaleDateString('th-TH', { weekday: 'short' });
      return String(date.getDate());
    });

    return { dateRange: days, labels };
  }, [period, offset]);

  // ---- Aggregate data ----
  const chartData = useMemo(() => {
    return dateRange.map((dateStr, i) => {
      const dayOrders = orders.filter(o => o.createdAt.split('T')[0] === dateStr);
      const doneOrders = dayOrders.filter(o => o.status === 'done');
      return {
        dateStr,
        label: labels[i],
        revenue: doneOrders.reduce((s, o) => s + o.total, 0),
        orderCount: dayOrders.length,
      };
    });
  }, [orders, dateRange, labels]);

  // ---- Summary stats ----
  const summary = useMemo(() => {
    const revenue     = chartData.reduce((s, d) => s + d.revenue, 0);
    const orderCount  = chartData.reduce((s, d) => s + d.orderCount, 0);
    const avgPerDay   = chartData.filter(d => d.revenue > 0).length;
    const avgRevenue  = avgPerDay ? Math.round(revenue / avgPerDay) : 0;
    const peakDay     = [...chartData].sort((a, b) => b.revenue - a.revenue)[0];
    return { revenue, orderCount, avgRevenue, peakDay };
  }, [chartData]);

  // ---- Best sellers ----
  const bestSellers = useMemo(() => {
    const map: Record<string, number> = {};
    const doneOrders = orders.filter(o =>
      dateRange.includes(o.createdAt.split('T')[0]) && o.status === 'done'
    );
    doneOrders.forEach(o => o.items.forEach(item => {
      map[item.name] = (map[item.name] ?? 0) + item.qty;
    }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [orders, dateRange]);

  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);

  // ---- Period label ----
  const periodLabel = useMemo(() => {
    if (dateRange.length === 0) return '';
    const start = formatThaiShort(dateRange[0]);
    const end   = formatThaiShort(dateRange[dateRange.length - 1]);
    if (offset === 0) return period === 'week' ? 'สัปดาห์นี้' : 'เดือนนี้';
    return `${start} – ${end}`;
  }, [dateRange, offset, period]);

  return (
    <div className="p-5 lg:p-7 min-h-screen bg-zinc-100">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Reports</h1>
          <p className="text-xs text-zinc-400 mt-0.5">สรุปยอดขายและวิเคราะห์ข้อมูล</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 bg-white border border-zinc-200 hover:border-zinc-400 text-zinc-700 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <Download size={14} /> รีเฟรช
        </button>
      </div>

      {/* Period switcher */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex rounded-xl overflow-hidden border border-zinc-200 bg-white">
          {(['week', 'month'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => { setPeriod(p); setOffset(0); }}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                period === p ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-50'
              }`}
            >
              {p === 'week' ? 'รายสัปดาห์' : 'รายเดือน'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-3 py-2">
          <button onClick={() => setOffset(o => o - 1)} className="p-0.5 rounded hover:bg-zinc-100 text-zinc-400 transition-colors">
            <ChevronLeft size={15} />
          </button>
          <span className="text-sm font-medium text-zinc-700 min-w-[100px] text-center">{periodLabel}</span>
          <button
            onClick={() => setOffset(o => Math.min(o + 1, 0))}
            disabled={offset === 0}
            className="p-0.5 rounded hover:bg-zinc-100 text-zinc-400 disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-zinc-200 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {[
              {
                label: 'ยอดขายรวม',
                value: `฿${summary.revenue.toLocaleString()}`,
                sub: `${summary.orderCount} ออเดอร์`,
                icon: <BarChart3 size={14} className="text-emerald-500" />,
                color: 'text-zinc-900',
              },
              {
                label: 'เฉลี่ย/วัน',
                value: summary.avgRevenue ? `฿${summary.avgRevenue.toLocaleString()}` : '–',
                sub: 'วันที่มีการขาย',
                icon: <TrendingUp size={14} className="text-blue-500" />,
                color: 'text-zinc-900',
              },
              {
                label: 'ออเดอร์ทั้งหมด',
                value: String(summary.orderCount),
                sub: 'รายการ',
                icon: <Calendar size={14} className="text-amber-500" />,
                color: 'text-zinc-900',
              },
              {
                label: 'วันที่ขายดีที่สุด',
                value: summary.peakDay?.revenue ? `฿${summary.peakDay.revenue.toLocaleString()}` : '–',
                sub: summary.peakDay?.revenue ? formatThaiShort(summary.peakDay.dateStr) : 'ยังไม่มีข้อมูล',
                icon: <TrendingUp size={14} className="text-emerald-500" />,
                color: 'text-zinc-900',
              },
            ].map(m => (
              <div key={m.label} className="bg-white rounded-2xl p-4 border border-zinc-100">
                <div className="flex items-center gap-1.5 mb-2">
                  {m.icon}
                  <p className="text-xs text-zinc-400">{m.label}</p>
                </div>
                <p className={`text-2xl font-semibold ${m.color}`}>{m.value}</p>
                <p className="text-xs text-zinc-400 mt-1">{m.sub}</p>
              </div>
            ))}
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-2xl border border-zinc-100 p-5 mb-4">
            <p className="text-sm font-medium text-zinc-800 mb-5">ยอดขายแต่ละวัน</p>

            {chartData.every(d => d.revenue === 0) ? (
              <div className="h-40 flex items-center justify-center text-sm text-zinc-400">
                ไม่มีข้อมูลในช่วงเวลานี้
              </div>
            ) : (
              <div className="flex items-end gap-1.5 h-48 overflow-x-auto pb-1">
                {chartData.map((d, i) => {
                  const barH = d.revenue > 0 ? Math.max((d.revenue / maxRevenue) * 100, 6) : 0;
                  const isToday = d.dateStr === toDateStr(new Date());
                  return (
                    <div key={i} className="flex flex-col items-center gap-1.5 flex-1 min-w-[28px] group relative">
                      {/* Tooltip */}
                      {d.revenue > 0 && (
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-10">
                          <div className="bg-zinc-900 text-white text-[10px] rounded-lg px-2 py-1 whitespace-nowrap shadow-lg">
                            ฿{d.revenue.toLocaleString()} · {d.orderCount} ออเดอร์
                          </div>
                          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-900" />
                        </div>
                      )}
                      <div className="w-full flex items-end justify-center" style={{ height: '160px' }}>
                        <div
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            isToday ? 'bg-emerald-500' : d.revenue > 0 ? 'bg-zinc-800' : 'bg-zinc-100'
                          }`}
                          style={{ height: `${barH}%` }}
                        />
                      </div>
                      <span className={`text-[9px] font-medium ${isToday ? 'text-emerald-600' : 'text-zinc-400'}`}>
                        {d.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-50">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span className="text-xs text-zinc-400">วันนี้</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-zinc-800" />
                <span className="text-xs text-zinc-400">วันอื่น</span>
              </div>
            </div>
          </div>

          {/* Best sellers */}
          <div className="bg-white rounded-2xl border border-zinc-100 p-5">
            <p className="text-sm font-medium text-zinc-800 mb-4">🏆 เมนูขายดี</p>
            {bestSellers.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-6">ไม่มีข้อมูล</p>
            ) : (
              <div className="space-y-3">
                {bestSellers.map(([name, count], i) => {
                  const max = bestSellers[0][1];
                  const pct = Math.round((count / max) * 100);
                  return (
                    <div key={name} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-zinc-300 w-4 shrink-0">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1.5">
                          <p className="text-sm font-medium text-zinc-800">{name}</p>
                          <p className="text-xs text-zinc-500 font-medium">{count} ชิ้น</p>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-emerald-400' : i === 2 ? 'bg-emerald-300' : 'bg-zinc-300'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}