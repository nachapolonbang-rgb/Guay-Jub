'use client';

import { useState, useMemo } from 'react';
import {
  Plus, X, Check, ChevronDown, ChevronUp,
  Clock, Search, Filter, Receipt,
} from 'lucide-react';

// ---- Types ----
type OrderStatus = 'new' | 'cooking' | 'ready' | 'done';

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: number;
  items: OrderItem[];
  status: OrderStatus;
  note: string;
  createdAt: Date;
}

// ---- Config ----
const STATUS_CYCLE: OrderStatus[] = ['new', 'cooking', 'ready', 'done'];

const STATUS_META: Record<OrderStatus, { label: string; bg: string; text: string; dot: string }> = {
  new:     { label: 'ใหม่',        bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-400' },
  cooking: { label: 'กำลังปรุง',  bg: 'bg-amber-50',   text: 'text-amber-700',  dot: 'bg-amber-400' },
  ready:   { label: 'พร้อมรับ',   bg: 'bg-emerald-50', text: 'text-emerald-700',dot: 'bg-emerald-500' },
  done:    { label: 'รับแล้ว',    bg: 'bg-zinc-100',   text: 'text-zinc-500',   dot: 'bg-zinc-400' },
};

const MENU_OPTIONS = [
  { label: 'ก๋วยจั๊บน้ำใส',           price: 50 },
  { label: 'ก๋วยจั๊บน้ำข้น',           price: 60 },
  { label: 'ก๋วยจั๊บพิเศษ',            price: 80 },
  { label: 'ผักบุ้งไฟแดง',             price: 40 },
  { label: 'คะน้าน้ำมันหอย',           price: 45 },
  { label: 'น้ำเปล่า',                  price: 10 },
  { label: 'น้ำอัดลม',                  price: 20 },
];

// ---- Seed data ----
const seed = (id: number, items: OrderItem[], status: OrderStatus, note = '', minsAgo = 0): Order => ({
  id,
  items,
  status,
  note,
  createdAt: new Date(Date.now() - minsAgo * 60000),
});

const INITIAL_ORDERS: Order[] = [
  seed(42, [{ name: 'ก๋วยจั๊บน้ำใส', qty: 2, price: 50 }, { name: 'ผักบุ้งไฟแดง', qty: 1, price: 40 }], 'ready', '', 4),
  seed(41, [{ name: 'ก๋วยจั๊บน้ำข้น', qty: 1, price: 60 }, { name: 'น้ำเปล่า', qty: 2, price: 10 }], 'cooking', 'ไม่ใส่ผักชี', 8),
  seed(40, [{ name: 'ก๋วยจั๊บพิเศษ', qty: 2, price: 80 }], 'cooking', '', 11),
  seed(39, [{ name: 'ก๋วยจั๊บน้ำใส', qty: 1, price: 50 }, { name: 'คะน้าน้ำมันหอย', qty: 1, price: 45 }], 'new', 'เผ็ดน้อย', 2),
  seed(38, [{ name: 'ก๋วยจั๊บน้ำใส', qty: 3, price: 50 }], 'done', '', 25),
  seed(37, [{ name: 'น้ำอัดลม', qty: 2, price: 20 }, { name: 'ผักบุ้งไฟแดง', qty: 1, price: 40 }], 'done', '', 40),
  seed(36, [{ name: 'ก๋วยจั๊บน้ำข้น', qty: 2, price: 60 }, { name: 'ผักบุ้งไฟแดง', qty: 2, price: 40 }], 'done', '', 55),
];

// ---- Helpers ----
function total(items: OrderItem[]) {
  return items.reduce((s, i) => s + i.price * i.qty, 0);
}

function elapsed(d: Date) {
  const m = Math.floor((Date.now() - d.getTime()) / 60000);
  if (m < 1) return 'เพิ่งสั่ง';
  if (m < 60) return `${m} นาทีที่แล้ว`;
  return `${Math.floor(m / 60)} ชม. ที่แล้ว`;
}

// ---- Sub-components ----
function StatusPill({
  status, onClick,
}: { status: OrderStatus; onClick?: () => void }) {
  const m = STATUS_META[status];
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${m.bg} ${m.text} ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-default'}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </button>
  );
}

function Toast({ msg, show }: { msg: string; show: boolean }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-sm shadow-xl transition-all duration-300 whitespace-nowrap ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}>
      <Check size={14} className="text-emerald-400" />
      {msg}
    </div>
  );
}

// ---- Order Card ----
function OrderCard({
  order, onCycle, onDelete,
}: { order: Order; onCycle: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const t = total(order.items);

  return (
    <div className={`bg-white rounded-2xl border border-zinc-100 overflow-hidden transition-all ${order.status === 'done' ? 'opacity-60' : ''}`}>
      {/* Card header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="text-sm font-semibold text-zinc-800 w-10 shrink-0">
          #{String(order.id).padStart(3, '0')}
        </span>

        {/* Items summary */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-zinc-700 truncate">
            {order.items.map(i => `${i.name} ×${i.qty}`).join(', ')}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <Clock size={11} className="text-zinc-300" />
            <span className="text-xs text-zinc-400">{elapsed(order.createdAt)}</span>
            {order.note && (
              <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">
                {order.note}
              </span>
            )}
          </div>
        </div>

        {/* Price */}
        <span className="text-sm font-semibold text-zinc-900 shrink-0">฿{t}</span>

        {/* Status pill */}
        <StatusPill status={order.status} onClick={onCycle} />

        {/* Expand */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="p-1.5 rounded-lg hover:bg-zinc-50 text-zinc-400 transition-colors shrink-0"
        >
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-zinc-50 px-4 pb-4 pt-3 bg-zinc-50/50">
          <div className="space-y-1.5 mb-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-zinc-600">{item.name} <span className="text-zinc-400">×{item.qty}</span></span>
                <span className="text-zinc-700 font-medium">฿{item.price * item.qty}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-semibold pt-2 border-t border-zinc-100">
              <span className="text-zinc-800">รวม</span>
              <span className="text-zinc-900">฿{t}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-between">
            {/* Status stepper */}
            <div className="flex items-center gap-1">
              {STATUS_CYCLE.map((s, i) => {
                const idx = STATUS_CYCLE.indexOf(order.status);
                const isPast = i <= idx;
                const m = STATUS_META[s];
                return (
                  <div key={s} className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full transition-colors ${isPast ? m.dot : 'bg-zinc-200'}`} />
                    {i < STATUS_CYCLE.length - 1 && (
                      <div className={`w-4 h-px transition-colors ${i < idx ? 'bg-zinc-300' : 'bg-zinc-100'}`} />
                    )}
                  </div>
                );
              })}
              <span className="ml-2 text-xs text-zinc-400">{STATUS_META[order.status].label}</span>
            </div>

            <div className="flex gap-2">
              {order.status !== 'done' && (
                <button
                  onClick={onCycle}
                  className="text-xs px-3 py-1.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-700 transition-colors font-medium"
                >
                  ขั้นตอนถัดไป →
                </button>
              )}
              <button
                onClick={onDelete}
                className="text-xs px-3 py-1.5 rounded-xl border border-zinc-200 text-zinc-400 hover:text-red-500 hover:border-red-200 transition-colors"
              >
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Add Order Modal ----
interface FormLine { menuIdx: number; qty: number }

function AddOrderModal({
  onClose, onConfirm,
}: { onClose: () => void; onConfirm: (lines: FormLine[], note: string) => void }) {
  const [lines, setLines] = useState<FormLine[]>([{ menuIdx: 0, qty: 1 }]);
  const [note, setNote] = useState('');

  function addLine() { setLines(l => [...l, { menuIdx: 0, qty: 1 }]); }
  function removeLine(i: number) { setLines(l => l.filter((_, idx) => idx !== i)); }
  function setMenu(i: number, v: number) { setLines(l => l.map((x, idx) => idx === i ? { ...x, menuIdx: v } : x)); }
  function setQty(i: number, v: number) { setLines(l => l.map((x, idx) => idx === i ? { ...x, qty: Math.max(1, v) } : x)); }

  const preview = lines.reduce((s, l) => s + MENU_OPTIONS[l.menuIdx].price * l.qty, 0);

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/30">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-zinc-900">ออร์เดอร์ใหม่</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2 mb-4">
          {lines.map((line, i) => (
            <div key={i} className="flex items-center gap-2">
              <select
                value={line.menuIdx}
                onChange={e => setMenu(i, Number(e.target.value))}
                className="flex-1 text-sm border border-zinc-200 rounded-xl px-3 py-2 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                {MENU_OPTIONS.map((m, mi) => (
                  <option key={mi} value={mi}>{m.label} — ฿{m.price}</option>
                ))}
              </select>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => setQty(i, line.qty - 1)} className="w-7 h-7 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 text-sm">−</button>
                <span className="text-sm font-medium w-5 text-center">{line.qty}</span>
                <button onClick={() => setQty(i, line.qty + 1)} className="w-7 h-7 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 text-sm">+</button>
              </div>
              <span className="text-xs text-zinc-400 w-12 text-right shrink-0">
                ฿{MENU_OPTIONS[line.menuIdx].price * line.qty}
              </span>
              {lines.length > 1 && (
                <button onClick={() => removeLine(i)} className="p-1 text-zinc-300 hover:text-red-400 transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addLine}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 mb-4 transition-colors"
        >
          <Plus size={13} /> เพิ่มรายการ
        </button>

        <input
          type="text"
          placeholder="หมายเหตุ เช่น ไม่ใส่ผักชี, เผ็ดน้อย"
          value={note}
          onChange={e => setNote(e.target.value)}
          className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-zinc-50"
        />

        <div className="flex items-center justify-between mb-4 px-3 py-2.5 bg-zinc-50 rounded-xl">
          <span className="text-sm text-zinc-500">รวมทั้งหมด</span>
          <span className="text-sm font-semibold text-zinc-900">฿{preview}</span>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm rounded-xl border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-colors">
            ยกเลิก
          </button>
          <button
            onClick={() => onConfirm(lines, note)}
            className="flex-1 py-2.5 text-sm rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors"
          >
            ยืนยันออร์เดอร์
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Main Page ----
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ทั้งหมด'>('ทั้งหมด');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '' });
  const [nextId, setNextId] = useState(43);

  function showToast(msg: string) {
    setToast({ show: true, msg });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2400);
  }

  function cycleStatus(id: number) {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      const idx = STATUS_CYCLE.indexOf(o.status);
      const next = STATUS_CYCLE[Math.min(idx + 1, STATUS_CYCLE.length - 1)];
      if (next !== o.status) showToast(`#${String(o.id).padStart(3, '0')} → ${STATUS_META[next].label}`);
      return { ...o, status: next };
    }));
  }

  function deleteOrder(id: number) {
    setOrders(prev => {
      const o = prev.find(x => x.id === id);
      if (o) showToast(`ลบออร์เดอร์ #${String(o.id).padStart(3, '0')} แล้ว`);
      return prev.filter(x => x.id !== id);
    });
  }

  function addOrder(lines: FormLine[], note: string) {
    const items: OrderItem[] = lines.map(l => ({
      name: MENU_OPTIONS[l.menuIdx].label,
      qty: l.qty,
      price: MENU_OPTIONS[l.menuIdx].price,
    }));
    const newOrder: Order = { id: nextId, items, status: 'new', note, createdAt: new Date() };
    setOrders(prev => [newOrder, ...prev]);
    setNextId(n => n + 1);
    setShowModal(false);
    showToast(`เพิ่มออร์เดอร์ #${String(nextId).padStart(3, '0')} แล้ว`);
  }

  // ---- Filtered ----
  const filtered = useMemo(() => orders.filter(o => {
    const matchStatus = filterStatus === 'ทั้งหมด' || o.status === filterStatus;
    const matchSearch = String(o.id).includes(search) ||
      o.items.some(i => i.name.includes(search)) ||
      o.note.includes(search);
    return matchStatus && matchSearch;
  }), [orders, filterStatus, search]);

  // ---- Stats ----
  const stats = useMemo(() => ({
    total: orders.length,
    new: orders.filter(o => o.status === 'new').length,
    cooking: orders.filter(o => o.status === 'cooking').length,
    ready: orders.filter(o => o.status === 'ready').length,
    done: orders.filter(o => o.status === 'done').length,
    revenue: orders.filter(o => o.status === 'done').reduce((s, o) => s + total(o.items), 0),
  }), [orders]);

  return (
    <div className="p-5 lg:p-7 min-h-screen bg-zinc-100">
      <Toast show={toast.show} msg={toast.msg} />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">ออร์เดอร์</h1>
          <p className="text-xs text-zinc-400 mt-0.5">วันเสาร์ที่ 3 พ.ค. 2568 · เปิด 08:00 – 14:00</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={15} />
          รับออร์เดอร์
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        {[
          { label: 'รายได้วันนี้', value: `฿${stats.revenue.toLocaleString()}`, highlight: true },
          { label: 'ออร์เดอร์ใหม่', value: stats.new, dot: STATUS_META.new.dot },
          { label: 'กำลังปรุง', value: stats.cooking, dot: STATUS_META.cooking.dot },
          { label: 'พร้อมรับ', value: stats.ready, dot: STATUS_META.ready.dot },
          { label: 'รับแล้ว', value: stats.done, dot: STATUS_META.done.dot },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 border ${s.highlight ? 'bg-emerald-500 border-emerald-400' : 'bg-white border-zinc-100'}`}>
            <div className="flex items-center gap-1.5 mb-1">
              {s.dot && <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />}
              <p className={`text-xs ${s.highlight ? 'text-emerald-100' : 'text-zinc-400'}`}>{s.label}</p>
            </div>
            <p className={`text-xl font-semibold ${s.highlight ? 'text-white' : 'text-zinc-900'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="ค้นหาออร์เดอร์ หรือเมนู..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['ทั้งหมด', ...STATUS_CYCLE] as const).map(s => {
            const meta = s !== 'ทั้งหมด' ? STATUS_META[s] : null;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border transition-colors font-medium ${
                  filterStatus === s
                    ? 'bg-zinc-900 text-white border-zinc-900'
                    : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400'
                }`}
              >
                {meta && <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />}
                {s === 'ทั้งหมด' ? 'ทั้งหมด' : meta!.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ml-0.5 ${filterStatus === s ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                  {s === 'ทั้งหมด' ? stats.total : orders.filter(o => o.status === s).length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 py-20 flex flex-col items-center gap-3 text-zinc-400">
          <Receipt size={28} className="text-zinc-200" />
          <p className="text-sm">ไม่พบออร์เดอร์</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onCycle={() => cycleStatus(order.id)}
              onDelete={() => deleteOrder(order.id)}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <AddOrderModal
          onClose={() => setShowModal(false)}
          onConfirm={addOrder}
        />
      )}
    </div>
  );
}