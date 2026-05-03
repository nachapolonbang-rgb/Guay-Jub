'use client';

import { useState } from 'react';
import {
  Plus,
  CheckCheck,
  TrendingUp,
  Lightbulb,
  ChevronUp,
  ChevronDown,
  Menu,
} from 'lucide-react';

// ---- Types ----
type OrderStatus = 'new' | 'cooking' | 'ready' | 'done';

interface Order {
  id: number;
  items: string;
  price: number;
  status: OrderStatus;
}

// ---- Status config ----
const STATUS_CYCLE: OrderStatus[] = ['new', 'cooking', 'ready', 'done'];

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: 'ใหม่',
  cooking: 'กำลังปรุง',
  ready: 'พร้อมรับ',
  done: 'รับแล้ว',
};

const STATUS_CLASS: Record<OrderStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  cooking: 'bg-amber-100 text-amber-700',
  ready: 'bg-emerald-100 text-emerald-700',
  done: 'bg-zinc-100 text-zinc-500 border border-zinc-200',
};

// ---- Menu options ----
const MENU_OPTIONS = [
  { label: 'ก๋วยจั๊บน้ำใส', price: 50 },
  { label: 'ก๋วยจั๊บน้ำข้น', price: 60 },
  { label: 'ผักบุ้งไฟแดง', price: 40 },
  { label: 'คะน้าน้ำมันหอย', price: 45 },
];

// ---- Initial data ----
const INITIAL_ORDERS: Order[] = [
  { id: 38, items: 'ก๋วยจั๊บน้ำใส ×2, ผักบุ้งไฟแดง', price: 120, status: 'ready' },
  { id: 37, items: 'ก๋วยจั๊บน้ำข้น ×1, คะน้าน้ำมันหอย', price: 90, status: 'cooking' },
  { id: 36, items: 'ก๋วยจั๊บน้ำใส ×3', price: 150, status: 'cooking' },
  { id: 35, items: 'ก๋วยจั๊บน้ำข้น ×2, ผักบุ้งไฟแดง', price: 130, status: 'done' },
  { id: 34, items: 'ก๋วยจั๊บน้ำใส ×1, คะน้า ×2', price: 160, status: 'done' },
];

const POPULAR_MENU = [
  { name: 'ก๋วยจั๊บน้ำใส', count: 52, unit: 'ชาม', pct: 100 },
  { name: 'ก๋วยจั๊บน้ำข้น', count: 33, unit: 'ชาม', pct: 63 },
  { name: 'ผักบุ้งไฟแดง', count: 24, unit: 'จาน', pct: 46 },
  { name: 'คะน้าน้ำมันหอย', count: 18, unit: 'จาน', pct: 35 },
];

const STOCK = [
  { name: 'ก๋วยจั๊บ', status: 'ok' },
  { name: 'หมูสามชั้น', status: 'ok' },
  { name: 'ผักบุ้ง', status: 'low' },
  { name: 'คะน้า', status: 'ok' },
  { name: 'เครื่องใน', status: 'low' },
  { name: 'พริกไทยดำ', status: 'out' },
] as const;

const STOCK_CLASS = {
  ok: 'bg-emerald-100 text-emerald-700',
  low: 'bg-amber-100 text-amber-700',
  out: 'bg-red-100 text-red-600',
};
const STOCK_LABEL = { ok: 'พอ', low: 'ใกล้หมด', out: 'หมดแล้ว' };

// ---- Toast ----
function Toast({ msg, show }: { msg: string; show: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-sm text-zinc-800 shadow-sm mb-4 transition-all duration-200 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
      }`}
    >
      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
      {msg}
    </div>
  );
}

// ---- Main Page ----
export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [orderCount, setOrderCount] = useState(38);
  const [totalSales, setTotalSales] = useState(4280);

  const [showForm, setShowForm] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(0);
  const [qty, setQty] = useState(1);

  const [toast, setToast] = useState({ show: false, msg: '' });

  // Mobile sidebar toggle (passed down from layout via context in real app,
  // here we manage a simple header hamburger for the page itself)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingCount = orders.filter((o) => o.status !== 'done').length;

  function showToastMsg(msg: string) {
    setToast({ show: true, msg });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500);
  }

  function cycleStatus(id: number) {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const idx = STATUS_CYCLE.indexOf(o.status);
        const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
        showToastMsg(`อัปเดตสถานะเป็น "${STATUS_LABEL[next]}"`);
        return { ...o, status: next };
      })
    );
  }

  function clearQueue() {
    setOrders((prev) => prev.map((o) => ({ ...o, status: 'done' })));
    showToastMsg('เคลียร์คิวทั้งหมดแล้ว');
  }

  function confirmOrder() {
    const menu = MENU_OPTIONS[selectedMenu];
    const price = menu.price * qty;
    const newId = orderCount + 1;
    setOrderCount(newId);
    setTotalSales((s) => s + price);
    setOrders((prev) => [
      { id: newId, items: `${menu.label} ×${qty}`, price, status: 'new' },
      ...prev,
    ]);
    setShowForm(false);
    setQty(1);
    setSelectedMenu(0);
    showToastMsg(`เพิ่มออร์เดอร์ #${String(newId).padStart(3, '0')} เรียบร้อย`);
  }

  const previewPrice = MENU_OPTIONS[selectedMenu].price * qty;

  return (
    <div className="p-5 lg:p-7 min-h-screen bg-zinc-100">
      {/* ---- Top bar ---- */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">ร้านก๋วยจั๊บป้าแดง</h1>
          <p className="text-xs text-zinc-400 mt-0.5">วันเสาร์ที่ 3 พ.ค. 2568 · เปิด 08:00 – 14:00</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          เปิดให้บริการ
        </span>
      </div>

      {/* ---- Toast ---- */}
      <Toast show={toast.show} msg={toast.msg} />

      {/* ---- Metric cards ---- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'ยอดขายวันนี้', value: `฿${totalSales.toLocaleString()}`, sub: '▲ 8% จากเสาร์ที่แล้ว', subColor: 'text-emerald-600' },
          { label: 'ออร์เดอร์วันนี้', value: String(orderCount), sub: '▲ 4 ออร์เดอร์', subColor: 'text-emerald-600' },
          { label: 'เฉลี่ย/ออร์เดอร์', value: '฿113', sub: 'เท่าเดิม', subColor: 'text-zinc-400' },
          { label: 'รอรับของ', value: String(pendingCount), sub: 'ออร์เดอร์', subColor: 'text-zinc-400' },
        ].map((m) => (
          <div
            key={m.label}
            className="bg-white rounded-2xl p-4 border border-zinc-100 hover:-translate-y-0.5 transition-transform"
          >
            <p className="text-xs text-zinc-400 mb-1">{m.label}</p>
            <p className="text-2xl font-semibold text-zinc-900">{m.value}</p>
            <p className={`text-xs mt-1 ${m.subColor}`}>{m.sub}</p>
          </div>
        ))}
      </div>

      {/* ---- Quick Actions ---- */}
      <div className="mb-6">
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Add order */}
          <button
            onClick={() => setShowForm((v) => !v)}
            className="bg-white border border-zinc-100 rounded-2xl p-4 text-left hover:-translate-y-0.5 active:scale-[.97] transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center mb-2">
              <Plus size={16} className="text-emerald-700" />
            </div>
            <p className="text-sm font-medium text-zinc-800">รับออร์เดอร์ใหม่</p>
            <p className="text-xs text-zinc-400 mt-0.5">เพิ่มออร์เดอร์เข้าคิว</p>
          </button>

          {/* Clear queue */}
          <button
            onClick={clearQueue}
            className="bg-white border border-zinc-100 rounded-2xl p-4 text-left hover:-translate-y-0.5 active:scale-[.97] transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center mb-2">
              <CheckCheck size={16} className="text-amber-700" />
            </div>
            <p className="text-sm font-medium text-zinc-800">เคลียร์คิว</p>
            <p className="text-xs text-zinc-400 mt-0.5">เปลี่ยนสถานะทั้งหมด</p>
          </button>

          {/* Analyse profit */}
          <button
            onClick={() => alert('เชื่อมต่อ AI วิเคราะห์กำไร')}
            className="bg-white border border-zinc-100 rounded-2xl p-4 text-left hover:-translate-y-0.5 active:scale-[.97] transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center mb-2">
              <TrendingUp size={16} className="text-red-600" />
            </div>
            <p className="text-sm font-medium text-zinc-800">วิเคราะห์กำไร ↗</p>
            <p className="text-xs text-zinc-400 mt-0.5">ให้ AI ช่วยคำนวณ</p>
          </button>

          {/* Tips */}
          <button
            onClick={() => alert('เชื่อมต่อ AI แนะนำร้าน')}
            className="bg-white border border-zinc-100 rounded-2xl p-4 text-left hover:-translate-y-0.5 active:scale-[.97] transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center mb-2">
              <Lightbulb size={16} className="text-blue-600" />
            </div>
            <p className="text-sm font-medium text-zinc-800">คำแนะนำร้าน ↗</p>
            <p className="text-xs text-zinc-400 mt-0.5">ให้ AI ช่วยแนะนำ</p>
          </button>
        </div>
      </div>

      {/* ---- Add order form ---- */}
      {showForm && (
        <div className="bg-white border border-zinc-100 rounded-2xl p-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-sm font-medium text-zinc-800 mb-3">เพิ่มออร์เดอร์ใหม่</p>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <select
              value={selectedMenu}
              onChange={(e) => setSelectedMenu(Number(e.target.value))}
              className="flex-1 text-sm border border-zinc-200 rounded-xl px-3 py-2 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              {MENU_OPTIONS.map((m, i) => (
                <option key={i} value={i}>{m.label}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 transition"
              >
                <ChevronDown size={16} />
              </button>
              <span className="text-sm font-medium w-5 text-center">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 transition"
              >
                <ChevronUp size={16} />
              </button>
            </div>

            <span className="text-sm text-zinc-400 min-w-[48px]">฿{previewPrice}</span>

            <div className="flex gap-2">
              <button
                onClick={() => { setShowForm(false); setQty(1); setSelectedMenu(0); }}
                className="text-sm px-4 py-2 rounded-xl border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmOrder}
                className="text-sm px-4 py-2 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Main grid ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        {/* Orders list */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-zinc-100 p-4">
          <p className="text-sm font-medium text-zinc-800 mb-3">
            ออร์เดอร์ล่าสุด{' '}
            <span className="text-xs text-zinc-400 font-normal">(กดสถานะเพื่อเปลี่ยน)</span>
          </p>
          <div className="space-y-2">
            {orders.map((o) => (
              <div
                key={o.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-50 hover:translate-x-0.5 transition-transform"
              >
                <span className="text-xs font-medium text-zinc-400 w-9">#{String(o.id).padStart(3, '0')}</span>
                <span className="flex-1 text-sm text-zinc-700 truncate">{o.items}</span>
                <span className="text-sm font-medium text-zinc-800 mr-1">฿{o.price}</span>
                <button
                  onClick={() => cycleStatus(o.id)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-opacity hover:opacity-75 ${STATUS_CLASS[o.status]}`}
                >
                  {STATUS_LABEL[o.status]}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Popular menu */}
          <div className="bg-white rounded-2xl border border-zinc-100 p-4">
            <p className="text-sm font-medium text-zinc-800 mb-3">เมนูยอดนิยมวันนี้</p>
            <div className="space-y-3">
              {POPULAR_MENU.map((m) => (
                <div key={m.name} className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-800 leading-none">{m.name}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{m.count} {m.unit}</p>
                  </div>
                  <div className="w-20 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                      style={{ width: `${m.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stock */}
          <div className="bg-white rounded-2xl border border-zinc-100 p-4">
            <p className="text-sm font-medium text-zinc-800 mb-3">สต็อกวัตถุดิบ</p>
            <div className="grid grid-cols-2 gap-2">
              {STOCK.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-zinc-50 hover:scale-[1.02] transition-transform"
                >
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

      {/* ---- Weekly sales ---- */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-4">
        <p className="text-sm font-medium text-zinc-800 mb-3">ยอดขายรายสัปดาห์</p>
        <div className="grid grid-cols-7 gap-2">
          {[
            { day: 'จ', val: null },
            { day: 'อ', val: null },
            { day: 'พ', val: null },
            { day: 'พฤ', val: null },
            { day: 'ศ', val: null },
            { day: 'ส', val: totalSales, active: true },
            { day: 'อา', val: 3950 },
          ].map((d) => (
            <div
              key={d.day}
              className={`rounded-xl py-2.5 text-center border transition ${
                d.active
                  ? 'bg-white border-emerald-400 border-[1.5px]'
                  : d.val === null
                  ? 'bg-zinc-50 border-zinc-100 opacity-30'
                  : 'bg-zinc-50 border-zinc-100'
              }`}
            >
              <p className="text-[11px] text-zinc-400">{d.day}</p>
              <p className="text-xs font-medium text-zinc-800 mt-0.5">
                {d.val !== null ? d.val.toLocaleString() : '–'}
              </p>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                {d.active ? 'วันนี้' : d.val !== null ? 'ที่แล้ว' : 'ปิด'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}