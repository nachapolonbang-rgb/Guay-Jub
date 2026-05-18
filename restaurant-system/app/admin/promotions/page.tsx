'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Copy,
  X,
  Check,
} from 'lucide-react';

type DiscountType = 'fixed' | 'percent';
type PromoStatus = 'active' | 'upcoming' | 'ended';
type PromoTag = 'ข่าวสาร' | 'เมนูใหม่' | 'กิจกรรม' | 'ประกาศ' | 'โปรโมชั่น';

interface PromotionItem {
  id: number;
  title: string;
  description: string;
  detail?: string | null;
  date: string;
  status: PromoStatus;
  tag: PromoTag;
  emoji: string;
  discount?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface DiscountCode {
  id: number;
  code: string;
  description: string;
  type: DiscountType;
  value: number;
  minOrder: number;
  usedCount: number;
  maxUses: number | null;
  active: boolean;
  expiresAt: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const STATUS_LABEL: Record<PromoStatus, { label: string; color: string; bg: string }> = {
  active: { label: 'กำลังจัด', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  upcoming: { label: 'เร็ว ๆ นี้', color: 'text-amber-700', bg: 'bg-amber-50' },
  ended: { label: 'สิ้นสุด', color: 'text-zinc-500', bg: 'bg-zinc-100' },
};

const TAG_BADGE: Record<PromoTag, { label: string; bg: string; text: string }> = {
  ข่าวสาร: { label: 'ข่าวสาร', bg: 'bg-sky-50', text: 'text-sky-700' },
  เมนูใหม่: { label: 'เมนูใหม่', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  กิจกรรม: { label: 'กิจกรรม', bg: 'bg-violet-50', text: 'text-violet-700' },
  ประกาศ: { label: 'ประกาศ', bg: 'bg-orange-50', text: 'text-orange-700' },
  โปรโมชั่น: { label: 'โปรโมชั่น', bg: 'bg-rose-50', text: 'text-rose-700' },
};

const DEFAULT_STATUS = { label: 'ไม่ระบุ', color: 'text-zinc-500', bg: 'bg-zinc-100' };
const DEFAULT_TAG = { label: 'ไม่ระบุ', bg: 'bg-zinc-100', text: 'text-zinc-500' };

function getStatusTag(status: string) {
  return STATUS_LABEL[status as PromoStatus] ?? DEFAULT_STATUS;
}

function getTagBadge(tag: string) {
  return TAG_BADGE[tag as PromoTag] ?? { ...DEFAULT_TAG, label: String(tag || 'ไม่ระบุ') };
}

export default function AdminPromotionsPage() {
  const [tab, setTab] = useState<'promotions' | 'discounts'>('promotions');
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoFilter, setPromoFilter] = useState<'all' | PromoStatus>('all');
  const [discountFilter, setDiscountFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [newPromo, setNewPromo] = useState({
    title: '',
    description: '',
    detail: '',
    date: new Date().toISOString().slice(0, 10),
    status: 'active' as PromoStatus,
    tag: 'ข่าวสาร' as PromoTag,
    emoji: '🏪',
    discount: '',
  });
  const [newDiscount, setNewDiscount] = useState({
    code: '',
    description: '',
    type: 'fixed' as DiscountType,
    value: '',
    minOrder: '',
    maxUses: '',
    expiresAt: '',
  });
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [promoRes, discRes] = await Promise.all([
        fetch('/api/promotions'),
        fetch('/api/discounts'),
      ]);
      if (promoRes.ok) setPromotions(await promoRes.json());
      if (discRes.ok) setDiscounts(await discRes.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const visiblePromotions = promoFilter === 'all'
    ? promotions
    : promotions.filter((item) => item.status === promoFilter);

  const visibleDiscounts = discountFilter === 'all'
    ? discounts
    : discounts.filter((item) => discountFilter === 'active' ? item.active : !item.active);

  const promoStats = {
    total: promotions.length,
    active: promotions.filter((item) => item.status === 'active').length,
    upcoming: promotions.filter((item) => item.status === 'upcoming').length,
    ended: promotions.filter((item) => item.status === 'ended').length,
  };

  function resetPromoForm() {
    setNewPromo({ title: '', description: '', detail: '', date: new Date().toISOString().slice(0, 10), status: 'active', tag: 'ข่าวสาร', emoji: '🏪', discount: '' });
  }

  function resetDiscountForm() {
    setNewDiscount({ code: '', description: '', type: 'fixed', value: '', minOrder: '', maxUses: '', expiresAt: '' });
  }

  async function handleAddPromotion() {
    if (!newPromo.title.trim() || !newPromo.description.trim()) {
      setMessage({ type: 'error', text: 'กรุณาใส่ชื่อและคำอธิบายโปรโมชั่น' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPromo.title.trim(),
          description: newPromo.description.trim(),
          detail: newPromo.detail.trim() || undefined,
          date: newPromo.date.trim(),
          status: newPromo.status,
          tag: newPromo.tag,
          emoji: newPromo.emoji,
          discount: newPromo.discount.trim() || undefined,
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: payload?.error || 'ไม่สามารถบันทึกโปรโมชั่นได้' });
        return;
      }

      setPromotions((prev) => [payload, ...prev]);
      resetPromoForm();
      setShowPromoModal(false);
      setMessage({ type: 'success', text: 'บันทึกโปรโมชั่นเรียบร้อยแล้ว' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์' });
    } finally {
      setSaving(false);
    }
  }

  async function handleAddDiscount() {
    const value = parseFloat(newDiscount.value);
    if (!newDiscount.code.trim() || isNaN(value)) {
      setMessage({ type: 'error', text: 'กรุณาใส่รหัสและมูลค่าส่วนลดอย่างถูกต้อง' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newDiscount.code.toUpperCase().trim(),
          description: newDiscount.description.trim(),
          type: newDiscount.type,
          value,
          minOrder: parseFloat(newDiscount.minOrder) || 0,
          maxUses: newDiscount.maxUses ? Number(newDiscount.maxUses) : null,
          expiresAt: newDiscount.expiresAt || null,
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: payload?.error || 'ไม่สามารถสร้างโค้ดส่วนลดได้' });
        return;
      }

      setDiscounts((prev) => [payload, ...prev]);
      resetDiscountForm();
      setShowDiscountModal(false);
      setMessage({ type: 'success', text: 'สร้างโค้ดส่วนลดเรียบร้อยแล้ว' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์' });
    } finally {
      setSaving(false);
    }
  }

  async function changePromotionStatus(id: number) {
    const item = promotions.find((promo) => promo.id === id);
    if (!item) return;
    const nextStatus: PromoStatus = item.status === 'active' ? 'ended' : 'active';
    try {
      const res = await fetch(`/api/promotions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, status: nextStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPromotions((prev) => prev.map((promo) => promo.id === id ? updated : promo));
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function removePromotion(id: number) {
    if (!confirm('ลบโปรโมชั่นนี้หรือไม่?')) return;
    try {
      const res = await fetch(`/api/promotions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPromotions((prev) => prev.filter((promo) => promo.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function toggleDiscountActive(id: number) {
    const item = discounts.find((disc) => disc.id === id);
    if (!item) return;
    try {
      const res = await fetch(`/api/discounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, active: !item.active }),
      });
      if (res.ok) {
        const updated = await res.json();
        setDiscounts((prev) => prev.map((disc) => disc.id === id ? updated : disc));
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function removeDiscount(id: number) {
    if (!confirm('ลบโค้ดส่วนลดนี้หรือไม่?')) return;
    try {
      const res = await fetch(`/api/discounts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDiscounts((prev) => prev.filter((disc) => disc.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  }

  function formatDate(value: string | null) {
    return value ? new Date(value).toISOString().slice(0, 10) : '-';
  }

  function copyCode(code: string, id: number) {
    navigator.clipboard.writeText(code).catch(() => undefined);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1200);
  }

  return (
    <div className="p-5 lg:p-7 min-h-screen bg-zinc-100">
      <div className="flex flex-col gap-6 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-zinc-900">Promotions</h1>
          <p className="text-sm text-zinc-500 mt-2">จัดการข่าวสาร โปรโมชั่น และโค้ดส่วนลดให้ลูกค้าดูได้ตรงตามต้องการ</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTab('promotions')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === 'promotions' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-50'}`}
          >
            ข่าวสาร & โปรโมชั่น
          </button>
          <button
            onClick={() => setTab('discounts')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === 'discounts' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-50'}`}
          >
            โค้ดส่วนลด
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">ทั้งหมด</p>
          <p className="mt-3 text-3xl font-bold text-zinc-900">{promoStats.total}</p>
          <p className="text-sm text-zinc-500 mt-1">รายการข่าวสาร</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">กำลังจัด</p>
          <p className="mt-3 text-3xl font-bold text-emerald-700">{promoStats.active}</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">เร็ว ๆ นี้</p>
          <p className="mt-3 text-3xl font-bold text-amber-700">{promoStats.upcoming}</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">จบแล้ว</p>
          <p className="mt-3 text-3xl font-bold text-zinc-500">{promoStats.ended}</p>
        </div>
      </div>

      {tab === 'promotions' ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {(['all', 'active', 'upcoming', 'ended'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setPromoFilter(status)}
                  className={`rounded-full px-4 py-2 text-sm font-medium border transition ${promoFilter === status ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'}`}
                >
                  {status === 'all' ? 'ทั้งหมด' : STATUS_LABEL[status].label}
                </button>
              ))}
            </div>
            <button
              onClick={() => { setMessage(null); setShowPromoModal(true); }}
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 transition"
            >
              <Plus size={14} /> เพิ่มโปรโมชั่น
            </button>
          </div>
          {message && (
            <div className={`rounded-2xl p-4 text-sm ${message.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
              {message.text}
            </div>
          )}

          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="hidden md:grid grid-cols-[1.8fr_1.2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 bg-zinc-50 text-xs uppercase tracking-[0.18em] text-zinc-400">
              <span>ชื่อโปรโมชั่น</span>
              <span>Tag</span>
              <span>วันที่</span>
              <span>สถานะ</span>
              <span>ส่วนลด</span>
              <span className="text-right">จัดการ</span>
            </div>

            {loading ? (
              <div className="p-10 text-center text-zinc-500">กำลังโหลด...</div>
            ) : visiblePromotions.length === 0 ? (
              <div className="p-10 text-center text-zinc-500">ไม่พบโปรโมชั่น</div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {visiblePromotions.map((promo) => {
                  const tag = getTagBadge(promo.tag);
                  const status = getStatusTag(promo.status);
                  return (
                    <div key={promo.id} className="grid grid-cols-1 md:grid-cols-[1.8fr_1.2fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 hover:bg-zinc-50 transition-colors">
                      <div>
                        <p className="font-semibold text-zinc-900">{promo.title}</p>
                        <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{promo.description}</p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${tag.bg} ${tag.text}`}>{tag.label}</span>
                      <span className="text-sm text-zinc-600">{promo.date}</span>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${status.bg} ${status.color}`}>{status.label}</span>
                      <span className="text-sm text-zinc-600">{promo.discount ?? '-'}</span>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => changePromotionStatus(promo.id)}
                          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                        >
                          {promo.status === 'active' ? <ToggleRight size={15} /> : <ToggleLeft size={15} />} {promo.status === 'active' ? 'จบแล้ว' : 'เปิดใช้งาน'}
                        </button>
                        <button
                          onClick={() => removePromotion(promo.id)}
                          className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                        >
                          <Trash2 size={15} /> ลบ
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {(['all', 'active', 'inactive'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setDiscountFilter(status)}
                  className={`rounded-full px-4 py-2 text-sm font-medium border transition ${discountFilter === status ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'}`}
                >
                  {status === 'all' ? 'ทั้งหมด' : status === 'active' ? 'ใช้งานอยู่' : 'ปิดใช้งาน'}
                </button>
              ))}
            </div>
            <button
              onClick={() => { setMessage(null); setShowDiscountModal(true); }}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              <Plus size={14} /> สร้างโค้ดส่วนลด
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="hidden md:grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 bg-zinc-50 text-xs uppercase tracking-[0.18em] text-zinc-400">
              <span>โค้ด</span>
              <span>ส่วนลด</span>
              <span>เงื่อนไข</span>
              <span>สถานะ</span>
              <span>หมดอายุ</span>
              <span className="text-right">จัดการ</span>
            </div>
            {loading ? (
              <div className="p-10 text-center text-zinc-500">กำลังโหลด...</div>
            ) : visibleDiscounts.length === 0 ? (
              <div className="p-10 text-center text-zinc-500">ไม่พบโค้ดส่วนลด</div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {visibleDiscounts.map((disc) => {
                  const isExpired = disc.expiresAt ? new Date(disc.expiresAt) < new Date() : false;
                  const isMaxed = disc.maxUses ? disc.usedCount >= disc.maxUses : false;
                  const statusLabel = disc.active ? 'ใช้งานอยู่' : 'ปิดใช้งาน';
                  return (
                    <div key={disc.id} className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 hover:bg-zinc-50 transition-colors">
                      <div>
                        <p className="font-semibold text-zinc-900">{disc.code}</p>
                        <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{disc.description}</p>
                      </div>
                      <p className="text-sm text-zinc-600">{disc.type === 'fixed' ? `฿${disc.value}` : `${disc.value}%`}</p>
                      <p className="text-sm text-zinc-600">ขั้นต่ำ ฿{disc.minOrder}</p>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${disc.active ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-600'}`}>{statusLabel}</span>
                      <p className="text-sm text-zinc-600">{disc.expiresAt ? formatDate(disc.expiresAt) : '-'}</p>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => copyCode(disc.code, disc.id)}
                          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                        >
                          {copiedId === disc.id ? <Check size={14} /> : <Copy size={14} />} {copiedId === disc.id ? 'คัดลอกแล้ว' : 'คัดลอก'}
                        </button>
                        <button
                          onClick={() => toggleDiscountActive(disc.id)}
                          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                        >
                          {disc.active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />} {disc.active ? 'ปิด' : 'เปิด'}
                        </button>
                        <button
                          onClick={() => removeDiscount(disc.id)}
                          className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                        >
                          <Trash2 size={15} /> ลบ
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {showPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-[32px] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900">สร้างโปรโมชั่นใหม่</h2>
                <p className="text-sm text-zinc-500 mt-1">ตั้งค่าข่าวสารหรือโปรโมชั่นพร้อมเผยแพร่</p>
              </div>
              <button onClick={() => setShowPromoModal(false)} className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-zinc-500">ชื่อโปรโมชั่น</label>
                <input
                  value={newPromo.title}
                  onChange={(e) => setNewPromo((prev) => ({ ...prev, title: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-zinc-500">วันที่</label>
                <input
                  value={newPromo.date}
                  onChange={(e) => setNewPromo((prev) => ({ ...prev, date: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-zinc-500">แท็ก</label>
                <select
                  value={newPromo.tag}
                  onChange={(e) => setNewPromo((prev) => ({ ...prev, tag: e.target.value as PromoTag }))}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-amber-400 focus:outline-none"
                >
                  {(['ข่าวสาร','เมนูใหม่','กิจกรรม','ประกาศ','โปรโมชั่น'] as PromoTag[]).map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-zinc-500">สถานะ</label>
                <select
                  value={newPromo.status}
                  onChange={(e) => setNewPromo((prev) => ({ ...prev, status: e.target.value as PromoStatus }))}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-amber-400 focus:outline-none"
                >
                  <option value="active">กำลังจัด</option>
                  <option value="upcoming">เร็ว ๆ นี้</option>
                  <option value="ended">สิ้นสุด</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-zinc-500">Emoji</label>
                <input
                  value={newPromo.emoji}
                  onChange={(e) => setNewPromo((prev) => ({ ...prev, emoji: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-zinc-500">ส่วนลด</label>
                <input
                  placeholder="เช่น 20%"
                  value={newPromo.discount}
                  onChange={(e) => setNewPromo((prev) => ({ ...prev, discount: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-zinc-500">คำอธิบาย</label>
              <textarea
                value={newPromo.description}
                onChange={(e) => setNewPromo((prev) => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="mt-2 w-full rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-zinc-500">รายละเอียด</label>
              <textarea
                value={newPromo.detail}
                onChange={(e) => setNewPromo((prev) => ({ ...prev, detail: e.target.value }))}
                rows={3}
                className="mt-2 w-full rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => { setShowPromoModal(false); resetPromoForm(); }}
                className="rounded-full border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleAddPromotion}
                disabled={saving}
                className="rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-600 transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'กำลังบันทึก...' : 'บันทึกโปรโมชั่น'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDiscountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-[32px] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900">สร้างโค้ดส่วนลด</h2>
                <p className="text-sm text-zinc-500 mt-1">สร้างเงื่อนไขส่วนลดใหม่สำหรับลูกค้า</p>
              </div>
              <button onClick={() => setShowDiscountModal(false)} className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-zinc-500">รหัส</label>
                <input
                  value={newDiscount.code}
                  onChange={(e) => setNewDiscount((prev) => ({ ...prev, code: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-emerald-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-zinc-500">คำอธิบาย</label>
                <input
                  value={newDiscount.description}
                  onChange={(e) => setNewDiscount((prev) => ({ ...prev, description: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-emerald-400 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase text-zinc-500">ประเภท</label>
                  <select
                    value={newDiscount.type}
                    onChange={(e) => setNewDiscount((prev) => ({ ...prev, type: e.target.value as DiscountType }))}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="fixed">บาท</option>
                    <option value="percent">เปอร์เซ็นต์</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-zinc-500">มูลค่า</label>
                  <input
                    type="number"
                    value={newDiscount.value}
                    onChange={(e) => setNewDiscount((prev) => ({ ...prev, value: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase text-zinc-500">ขั้นต่ำ</label>
                  <input
                    type="number"
                    value={newDiscount.minOrder}
                    onChange={(e) => setNewDiscount((prev) => ({ ...prev, minOrder: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-zinc-500">จำนวนสูงสุด</label>
                  <input
                    type="number"
                    value={newDiscount.maxUses}
                    onChange={(e) => setNewDiscount((prev) => ({ ...prev, maxUses: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-zinc-500">หมดอายุ</label>
                <input
                  type="date"
                  value={newDiscount.expiresAt}
                  onChange={(e) => setNewDiscount((prev) => ({ ...prev, expiresAt: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => { setShowDiscountModal(false); resetDiscountForm(); }}
                className="rounded-full border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleAddDiscount}
                disabled={saving}
                className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'กำลังบันทึก...' : 'บันทึกโค้ด'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
