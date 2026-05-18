'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Plus, X, Check, ChevronDown, ChevronUp,
  Clock, Search, Receipt, User, Phone, Tag, Minus, Sparkles,
} from 'lucide-react';

// ---- Types ----
type OrderStatus = 'new' | 'cooking' | 'ready' | 'done';
type PaymentStatus = 'pending' | 'paid' | 'cancelled';

interface Customization {
  removed:  string[];
  toppings: string[];
  note:     string;
}

interface OrderItem {
  name:           string;
  qty:            number;
  price:          number;
  customization?: Customization;
}

interface Order {
  id:            number;
  items:         OrderItem[];
  status:        OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  note:          string;
  customerName:  string;
  customerPhone: string;
  createdAt:     Date;
}

// ---- Config ----
const STATUS_CYCLE: OrderStatus[] = ['new', 'cooking', 'ready', 'done'];

const STATUS_META: Record<OrderStatus, { label: string; bg: string; text: string; dot: string }> = {
  new:     { label: 'ใหม่',       bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-400' },
  cooking: { label: 'กำลังปรุง', bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400' },
  ready:   { label: 'พร้อมรับ',  bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  done:    { label: 'รับแล้ว',   bg: 'bg-zinc-100',   text: 'text-zinc-500',    dot: 'bg-zinc-400' },
};

const PAYMENT_META: Record<PaymentStatus, { label: string; bg: string; text: string; dot: string }> = {
  pending:   { label: 'รอชำระเงิน', bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400' },
  paid:      { label: 'ชำระแล้ว',  bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  cancelled: { label: 'ยกเลิก',    bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-400' },
};

const MENU_OPTIONS = [
  { label: 'ก๋วยจั๊บน้ำใส',  price: 50 },
  { label: 'ก๋วยจั๊บน้ำข้น',  price: 60 },
  { label: 'ก๋วยจั๊บพิเศษ',   price: 80 },
  { label: 'ผักบุ้งไฟแดง',    price: 40 },
  { label: 'คะน้าน้ำมันหอย',  price: 45 },
  { label: 'น้ำเปล่า',         price: 10 },
  { label: 'น้ำอัดลม',         price: 20 },
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

function parseOrder(raw: any): Order {
  const status = raw.status?.toLowerCase() as OrderStatus;
  const validStatus: OrderStatus = STATUS_CYCLE.includes(status) ? status : 'new';

  const paymentStatus = (raw.paymentStatus?.toLowerCase() ?? 'pending') as PaymentStatus;
  const validPaymentStatus = ['pending', 'paid', 'cancelled'].includes(paymentStatus) ? paymentStatus : 'pending';

  const items: OrderItem[] = (raw.items ?? []).map((item: any) => ({
    name:  item.name,
    qty:   item.qty,
    price: item.price,
    customization: {
    removed:  JSON.parse(item.removedIngredients ?? '[]'),
    toppings: JSON.parse(item.toppings ?? '[]'),
    note:     item.note ?? '',
  },
  }));

  return {
    id:            raw.id,
    items,
    status:        validStatus,
    paymentStatus: validPaymentStatus as PaymentStatus,
    paymentMethod: raw.paymentMethod,
    note:          raw.note ?? '',
    customerName:  raw.guestName  ?? raw.customerName  ?? '',
    customerPhone: raw.guestPhone ?? raw.customerPhone ?? '',
    createdAt:     new Date(raw.createdAt),
  };
}

// ---- Customization badge (compact, for header) ----
function CustomizationBadges({ item }: { item: OrderItem }) {
  const c = item.customization;
  if (!c) return null;

  const hasRemoved  = c.removed?.length > 0;
  const hasToppings = c.toppings?.length > 0;
  const hasNote     = !!c.note;

  if (!hasRemoved && !hasToppings && !hasNote) return null;

  return (
    <span className="flex items-center gap-1 flex-wrap">
      {hasRemoved && c.removed.map(r => (
        <span key={r} className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-red-50 text-red-500 px-1.5 py-0.5 rounded-md">
          <Minus size={9} />
          {r}
        </span>
      ))}
      {hasToppings && c.toppings.map(t => (
        <span key={t} className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded-md">
          <Sparkles size={9} />
          {t}
        </span>
      ))}
      {hasNote && (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-md">
          <Tag size={9} />
          {c.note}
        </span>
      )}
    </span>
  );
}

// ---- Customization detail block (for expanded section) ----
function CustomizationDetail({ item }: { item: OrderItem }) {
  const c = item.customization;
  if (!c) return null;

  const hasRemoved  = c.removed?.length > 0;
  const hasToppings = c.toppings?.length > 0;
  const hasNote     = !!c.note;

  if (!hasRemoved && !hasToppings && !hasNote) return null;

  return (
    <div className="mt-1.5 ml-2 pl-2 border-l-2 border-zinc-100 space-y-1">
      {hasRemoved && (
        <div className="flex items-start gap-1.5">
          <span className="text-[10px] font-semibold text-red-400 mt-0.5 shrink-0">ตัดออก</span>
          <div className="flex flex-wrap gap-1">
            {c.removed.map(r => (
              <span key={r} className="inline-flex items-center gap-0.5 text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded-md font-medium">
                <Minus size={8} />{r}
              </span>
            ))}
          </div>
        </div>
      )}
      {hasToppings && (
        <div className="flex items-start gap-1.5">
          <span className="text-[10px] font-semibold text-violet-400 mt-0.5 shrink-0">ท็อปปิ้ง</span>
          <div className="flex flex-wrap gap-1">
            {c.toppings.map(t => (
              <span key={t} className="inline-flex items-center gap-0.5 text-[10px] bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded-md font-medium">
                <Sparkles size={8} />{t}
              </span>
            ))}
          </div>
        </div>
      )}
      {hasNote && (
        <div className="flex items-start gap-1.5">
          <span className="text-[10px] font-semibold text-amber-400 mt-0.5 shrink-0">หมายเหตุ</span>
          <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">{c.note}</span>
        </div>
      )}
    </div>
  );
}

// ---- Sub-components ----
function StatusPill({ status, onClick }: { status: OrderStatus; onClick?: () => void }) {
  const m = STATUS_META[status] || STATUS_META['new'];
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

function PaymentPill({ paymentStatus }: { paymentStatus: PaymentStatus }) {
  const m = PAYMENT_META[paymentStatus] || PAYMENT_META['pending'];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${m.bg} ${m.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

// ---- Order Card ----
function OrderCard({ order, onCycle, onDelete }: { order: Order; onCycle: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [timeLabel, setTimeLabel] = useState('');

  useEffect(() => {
    setTimeLabel(elapsed(order.createdAt));
    const timer = setInterval(() => setTimeLabel(elapsed(order.createdAt)), 30_000);
    return () => clearInterval(timer);
  }, [order.createdAt]);

  const t = total(order.items);

  // ตรวจว่า order นี้มี customization ใดๆ บ้าง (สำหรับ header)
  const hasAnyCustomization = order.items.some(item => {
    const c = item.customization;
    return c && (c.removed?.length > 0 || c.toppings?.length > 0 || !!c.note);
  });

  return (
    <div className={`bg-white rounded-2xl border border-zinc-100 overflow-hidden transition-all ${order.status === 'done' ? 'opacity-60' : ''}`}>
      {/* Card header */}
      <div className="flex items-start gap-3 px-4 py-3">
        <span className="text-sm font-semibold text-zinc-800 w-10 shrink-0 pt-0.5">
          #{String(order.id).padStart(3, '0')}
        </span>

        <div className="flex-1 min-w-0">
          {/* รายการเมนู + customization badges (header) */}
          <div className="space-y-1 mb-1.5">
            {order.items.map((item, idx) => (
              <div key={idx}>
                <p className="text-sm text-zinc-700">
                  {item.name} <span className="text-zinc-400">×{item.qty}</span>
                  <span className="text-zinc-400 text-xs ml-1">฿{item.price * item.qty}</span>
                </p>
                {/* badges ย่อ: ตัดออก / ท็อปปิ้ง / หมายเหตุ */}
                <CustomizationBadges item={item} />
              </div>
            ))}
          </div>

          {/* row: ชื่อ / โทร / payment / เวลา / หมายเหตุออร์เดอร์ */}
          <div className="flex items-center gap-2 flex-wrap">
            {order.customerName && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-lg">
                <User size={11} className="text-blue-400" />
                {order.customerName}
              </span>
            )}
            {order.customerPhone && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                <Phone size={11} className="text-emerald-400" />
                {order.customerPhone}
              </span>
            )}
            <PaymentPill paymentStatus={order.paymentStatus} />
            <span className="flex items-center gap-1 text-xs text-zinc-400">
              <Clock size={11} className="text-zinc-300" />
              {timeLabel}
            </span>
            {order.note && (
              <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">
                📝 {order.note}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-semibold text-zinc-900">฿{t}</span>
          <StatusPill status={order.status} onClick={onCycle} />
          <button
            onClick={() => setExpanded(v => !v)}
            className="p-1.5 rounded-lg hover:bg-zinc-50 text-zinc-400 transition-colors"
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-zinc-50 px-4 pb-4 pt-3 bg-zinc-50/50">
          {/* ชื่อ + โทร */}
          <div className="mb-3 pb-3 border-b border-zinc-100">
            {(order.customerName || order.customerPhone) && (
              <div className="flex items-center gap-4 mb-2">
                {order.customerName && (
                  <span className="flex items-center gap-1.5 text-sm text-zinc-600">
                    <User size={13} className="text-zinc-400" />
                    {order.customerName}
                  </span>
                )}
                {order.customerPhone && (
                  <span className="flex items-center gap-1.5 text-sm text-zinc-600">
                    <Phone size={13} className="text-zinc-400" />
                    {order.customerPhone}
                  </span>
                )}
              </div>
            )}
            <PaymentPill paymentStatus={order.paymentStatus} />
          </div>

          {/* รายการอาหาร + customization detail (expanded) */}
          <div className="space-y-3 mb-3">
            {order.items.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600">
                    {item.name} <span className="text-zinc-400">×{item.qty}</span>
                  </span>
                  <span className="text-zinc-700 font-medium">฿{item.price * item.qty}</span>
                </div>
                {/* detail block: ตัดออก / ท็อปปิ้ง / หมายเหตุ */}
                <CustomizationDetail item={item} />
              </div>
            ))}

            <div className="flex justify-between text-sm font-semibold pt-2 border-t border-zinc-100">
              <span className="text-zinc-800">รวม</span>
              <span className="text-zinc-900">฿{t}</span>
            </div>
          </div>

          {/* หมายเหตุออร์เดอร์ */}
          {order.note && (
            <div className="mb-3 px-3 py-2 bg-amber-50 rounded-xl text-xs text-amber-700 flex items-start gap-1.5">
              <Tag size={11} className="mt-0.5 shrink-0 text-amber-400" />
              <span>{order.note}</span>
            </div>
          )}

          {/* Progress + actions */}
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-1">
              {STATUS_CYCLE.map((s, i) => {
                const idx = STATUS_CYCLE.indexOf(order.status);
                const isPast = i <= idx;
                const m = STATUS_META[s] || STATUS_META['new'];
                return (
                  <div key={s} className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full transition-colors ${isPast ? m.dot : 'bg-zinc-200'}`} />
                    {i < STATUS_CYCLE.length - 1 && (
                      <div className={`w-4 h-px transition-colors ${i < idx ? 'bg-zinc-300' : 'bg-zinc-100'}`} />
                    )}
                  </div>
                );
              })}
              <span className="ml-2 text-xs text-zinc-400">{(STATUS_META[order.status] || STATUS_META['new']).label}</span>
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
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (lines: FormLine[], note: string, customerName: string, customerPhone: string) => Promise<void>;
}) {
  const [lines, setLines] = useState<FormLine[]>([{ menuIdx: 0, qty: 1 }]);
  const [note, setNote] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);

  function addLine() { setLines(l => [...l, { menuIdx: 0, qty: 1 }]); }
  function removeLine(i: number) { setLines(l => l.filter((_, idx) => idx !== i)); }
  function setMenu(i: number, v: number) { setLines(l => l.map((x, idx) => idx === i ? { ...x, menuIdx: v } : x)); }
  function setQty(i: number, v: number) { setLines(l => l.map((x, idx) => idx === i ? { ...x, qty: Math.max(1, v) } : x)); }

  const preview = lines.reduce((s, l) => s + MENU_OPTIONS[l.menuIdx].price * l.qty, 0);

  async function handleConfirm() {
    setLoading(true);
    await onConfirm(lines, note, customerName, customerPhone);
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/30">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-zinc-900">ออร์เดอร์ใหม่</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400">
            <X size={16} />
          </button>
        </div>

        <p className="text-xs font-medium text-zinc-400 mb-2">ข้อมูลลูกค้า</p>
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="ชื่อลูกค้า"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div className="relative flex-1">
            <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="tel"
              placeholder="เบอร์โทร"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>

        <p className="text-xs font-medium text-zinc-400 mb-2">รายการอาหาร</p>
        <div className="space-y-2 mb-2">
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
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-2.5 text-sm rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'กำลังบันทึก...' : 'ยืนยันออร์เดอร์'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Main Page ----
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ทั้งหมด'>('ทั้งหมด');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '' });

  function showToast(msg: string) {
    setToast({ show: true, msg });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2400);
  }

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      setOrders(data.map(parseOrder));
    } catch {
      showToast('โหลดออร์เดอร์ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  async function cycleStatus(id: number) {
    const currentOrder = orders.find(o => o.id === id);
    if (!currentOrder) return;

    const idx = STATUS_CYCLE.indexOf(currentOrder.status);
    if (idx >= STATUS_CYCLE.length - 1) return;

    const next = STATUS_CYCLE[idx + 1];
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: next } : o));

    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error('update failed');
      const updated = parseOrder(await res.json());
      setOrders(prev => prev.map(o => o.id === id ? updated : o));
      showToast(`#${String(id).padStart(3, '0')} → ${STATUS_META[next].label}`);
    } catch {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: currentOrder.status } : o));
      showToast('เปลี่ยนสถานะไม่สำเร็จ');
    }
  }

  async function deleteOrder(id: number) {
    const confirmed = window.confirm('แน่ใจหรือไม่ว่าต้องการลบออร์เดอร์นี้? ข้อมูลจะไม่สามารถกู้คืนได้');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('delete failed');
      setOrders(prev => {
        const o = prev.find(x => x.id === id);
        if (o) showToast(`ลบออร์เดอร์ #${String(o.id).padStart(3, '0')} แล้ว`);
        return prev.filter(x => x.id !== id);
      });
    } catch {
      showToast('ลบออร์เดอร์ไม่สำเร็จ');
    }
  }

  async function addOrder(lines: FormLine[], note: string, customerName: string, customerPhone: string) {
    const items: OrderItem[] = lines.map(l => ({
      name:  MENU_OPTIONS[l.menuIdx].label,
      qty:   l.qty,
      price: MENU_OPTIONS[l.menuIdx].price,
    }));

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, note, guestName: customerName, guestPhone: customerPhone, orderType: 'dine-in' }),
      });
      if (!res.ok) throw new Error('create failed');
      const created = parseOrder(await res.json());
      setOrders(prev => [created, ...prev]);
      setShowModal(false);
      showToast(`เพิ่มออร์เดอร์ #${String(created.id).padStart(3, '0')} แล้ว`);
    } catch {
      showToast('บันทึกออร์เดอร์ไม่สำเร็จ');
    }
  }

  const filtered = useMemo(() => orders.filter(o => {
    const matchStatus = filterStatus === 'ทั้งหมด' || o.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      String(o.id).includes(q) ||
      o.items.some(i => i.name.includes(q)) ||
      o.note.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q);
    return matchStatus && matchSearch;
  }), [orders, filterStatus, search]);

  const stats = useMemo(() => ({
    total:   orders.length,
    new:     orders.filter(o => o.status === 'new').length,
    cooking: orders.filter(o => o.status === 'cooking').length,
    ready:   orders.filter(o => o.status === 'ready').length,
    done:    orders.filter(o => o.status === 'done').length,
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
          { label: 'ออร์เดอร์ใหม่', value: stats.new,     dot: STATUS_META.new.dot },
          { label: 'กำลังปรุง',    value: stats.cooking,  dot: STATUS_META.cooking.dot },
          { label: 'พร้อมรับ',     value: stats.ready,    dot: STATUS_META.ready.dot },
          { label: 'รับแล้ว',      value: stats.done,     dot: STATUS_META.done.dot },
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
            placeholder="ค้นหาออร์เดอร์ ชื่อลูกค้า เบอร์ หรือเมนู..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['ทั้งหมด', ...STATUS_CYCLE] as const).map(s => {
            const meta = s !== 'ทั้งหมด' ? STATUS_META[s] || STATUS_META['new'] : null;
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
      {loading ? (
        <div className="bg-white rounded-2xl border border-zinc-100 py-20 flex flex-col items-center gap-3 text-zinc-400">
          <div className="w-6 h-6 border-2 border-zinc-200 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-sm">กำลังโหลด...</p>
        </div>
      ) : filtered.length === 0 ? (
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

      {showModal && (
        <AddOrderModal
          onClose={() => setShowModal(false)}
          onConfirm={addOrder}
        />
      )}
    </div>
  );
}