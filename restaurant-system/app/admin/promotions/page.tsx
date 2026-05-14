'use client';

import { useState } from 'react';
import { Gift, Plus, Copy, Check, Trash2, X, Tag, Percent, Calendar, ToggleLeft, ToggleRight } from 'lucide-react';

type DiscountType = 'fixed' | 'percent';

interface Promotion {
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
}

const INITIAL_PROMOS: Promotion[] = [
  { id: 1, code: 'SAVE10',  description: 'ลด 10 บาท สำหรับทุกออเดอร์',       type: 'fixed',   value: 10,  minOrder: 0,   usedCount: 24, maxUses: null, active: true,  expiresAt: null },
  { id: 2, code: 'FOOD20',  description: 'ลด 20 บาท เมื่อสั่งขั้นต่ำ 100 บาท', type: 'fixed',   value: 20,  minOrder: 100, usedCount: 12, maxUses: 50,   active: true,  expiresAt: '2025-06-30' },
  { id: 3, code: 'VIP50',   description: 'ลด 50 บาท สำหรับลูกค้า VIP',         type: 'fixed',   value: 50,  minOrder: 200, usedCount: 5,  maxUses: 20,   active: true,  expiresAt: '2025-05-31' },
  { id: 4, code: 'SUMMER15',description: 'ลด 15% ต้อนรับหน้าร้อน',             type: 'percent', value: 15,  minOrder: 0,   usedCount: 0,  maxUses: 100,  active: false, expiresAt: '2025-04-30' },
];

export default function PromotionsPage() {
  const [promos, setPromos] = useState<Promotion[]>(INITIAL_PROMOS);
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [newPromo, setNewPromo] = useState({
    code: '', description: '', type: 'fixed' as DiscountType,
    value: '', minOrder: '', maxUses: '', expiresAt: '',
  });

  const filtered = promos.filter(p => {
    if (filterActive === 'active') return p.active;
    if (filterActive === 'inactive') return !p.active;
    return true;
  });

  const stats = {
    total:    promos.length,
    active:   promos.filter(p => p.active).length,
    inactive: promos.filter(p => !p.active).length,
    totalUsed: promos.reduce((s, p) => s + p.usedCount, 0),
  };

  function copyCode(id: number, code: string) {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  function toggleActive(id: number) {
    setPromos(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  }

  function deletePromo(id: number) {
    if (!confirm('ลบโปรโมชันนี้?')) return;
    setPromos(prev => prev.filter(p => p.id !== id));
  }

  function addPromo() {
    const value = parseFloat(newPromo.value);
    if (!newPromo.code.trim() || isNaN(value)) return;
    const id = Math.max(...promos.map(p => p.id)) + 1;
    setPromos(prev => [...prev, {
      id,
      code:        newPromo.code.toUpperCase().trim(),
      description: newPromo.description.trim(),
      type:        newPromo.type,
      value,
      minOrder:    parseFloat(newPromo.minOrder) || 0,
      usedCount:   0,
      maxUses:     newPromo.maxUses ? parseInt(newPromo.maxUses) : null,
      active:      true,
      expiresAt:   newPromo.expiresAt || null,
    }]);
    setNewPromo({ code: '', description: '', type: 'fixed', value: '', minOrder: '', maxUses: '', expiresAt: '' });
    setShowModal(false);
  }

  function isExpired(p: Promotion) {
    if (!p.expiresAt) return false;
    return new Date(p.expiresAt) < new Date();
  }

  function isMaxedOut(p: Promotion) {
    if (!p.maxUses) return false;
    return p.usedCount >= p.maxUses;
  }

  return (
    <div className="p-5 lg:p-7 min-h-screen bg-zinc-100">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Promotions</h1>
          <p className="text-xs text-zinc-400 mt-0.5">จัดการโค้ดส่วนลดและโปรโมชัน</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={15} /> สร้างโปรโมชัน
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'ทั้งหมด',       value: stats.total,    dot: 'bg-zinc-400' },
          { label: 'ใช้งานอยู่',    value: stats.active,   dot: 'bg-emerald-500' },
          { label: 'ปิดใช้งาน',    value: stats.inactive, dot: 'bg-zinc-300' },
          { label: 'ครั้งที่ใช้แล้ว', value: stats.totalUsed, dot: 'bg-blue-400' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-zinc-100">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              <p className="text-xs text-zinc-400">{s.label}</p>
            </div>
            <p className="text-2xl font-semibold text-zinc-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5">
        {(['all', 'active', 'inactive'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilterActive(f)}
            className={`text-xs px-3 py-2 rounded-xl border font-medium transition-colors ${
              filterActive === f
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400'
            }`}
          >
            {f === 'all' ? 'ทั้งหมด' : f === 'active' ? 'ใช้งานอยู่' : 'ปิดใช้งาน'}
          </button>
        ))}
      </div>

      {/* Promo cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 py-20 flex flex-col items-center gap-3 text-zinc-400">
          <Gift size={28} className="text-zinc-200" />
          <p className="text-sm">ไม่พบโปรโมชัน</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map(promo => {
            const expired   = isExpired(promo);
            const maxedOut  = isMaxedOut(promo);
            const effectivelyActive = promo.active && !expired && !maxedOut;
            const copied    = copiedId === promo.id;

            return (
              <div
                key={promo.id}
                className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                  effectivelyActive ? 'border-zinc-100' : 'border-zinc-100 opacity-60'
                }`}
              >
                {/* Top bar */}
                <div className={`h-1.5 w-full ${effectivelyActive ? 'bg-emerald-500' : 'bg-zinc-200'}`} />

                <div className="p-4">
                  {/* Code row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl ${effectivelyActive ? 'bg-emerald-50' : 'bg-zinc-50'}`}>
                        <Tag size={14} className={effectivelyActive ? 'text-emerald-600' : 'text-zinc-400'} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-zinc-900 font-mono">{promo.code}</span>
                          <button
                            onClick={() => copyCode(promo.id, promo.code)}
                            className="p-1 rounded-md hover:bg-zinc-100 text-zinc-400 transition-colors"
                          >
                            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          </button>
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">{promo.description}</p>
                      </div>
                    </div>

                    {/* Toggle */}
                    <button onClick={() => toggleActive(promo.id)} className="shrink-0 text-zinc-400 hover:text-zinc-700 transition-colors">
                      {promo.active
                        ? <ToggleRight size={22} className="text-emerald-500" />
                        : <ToggleLeft size={22} />
                      }
                    </button>
                  </div>

                  {/* Value badge */}
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span className="inline-flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full bg-zinc-900 text-white">
                      {promo.type === 'fixed'
                        ? `ลด ฿${promo.value}`
                        : <><Percent size={11} /> {promo.value}%</>
                      }
                    </span>
                    {promo.minOrder > 0 && (
                      <span className="text-xs text-zinc-500 bg-zinc-50 px-2 py-1 rounded-lg">
                        ขั้นต่ำ ฿{promo.minOrder}
                      </span>
                    )}
                    {expired && (
                      <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-lg flex items-center gap-1">
                        <Calendar size={10} /> หมดอายุแล้ว
                      </span>
                    )}
                    {maxedOut && (
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">ครบจำนวนแล้ว</span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-zinc-400 pt-3 border-t border-zinc-50">
                    <div className="flex items-center gap-3">
                      <span>ใช้แล้ว {promo.usedCount}{promo.maxUses ? `/${promo.maxUses}` : ''} ครั้ง</span>
                      {promo.expiresAt && !expired && (
                        <span className="flex items-center gap-1">
                          <Calendar size={10} /> หมดอายุ {promo.expiresAt}
                        </span>
                      )}
                    </div>
                    <button onClick={() => deletePromo(promo.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-300 hover:text-red-500 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/30">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-zinc-900">สร้างโปรโมชันใหม่</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Code */}
              <div>
                <label className="text-xs font-medium text-zinc-500 mb-1 block">โค้ดส่วนลด *</label>
                <input
                  type="text"
                  placeholder="เช่น SUMMER20"
                  value={newPromo.code}
                  onChange={e => setNewPromo(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300 font-mono"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-medium text-zinc-500 mb-1 block">คำอธิบาย</label>
                <input
                  type="text"
                  placeholder="อธิบายโปรโมชันนี้"
                  value={newPromo.description}
                  onChange={e => setNewPromo(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                />
              </div>

              {/* Type + Value */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs font-medium text-zinc-500 mb-1 block">ประเภท</label>
                  <select
                    value={newPromo.type}
                    onChange={e => setNewPromo(p => ({ ...p, type: e.target.value as DiscountType }))}
                    className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                  >
                    <option value="fixed">ลดจำนวนเงิน (฿)</option>
                    <option value="percent">ลดเปอร์เซ็นต์ (%)</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium text-zinc-500 mb-1 block">
                    มูลค่า {newPromo.type === 'fixed' ? '(บาท)' : '(%)'}  *
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newPromo.value}
                    onChange={e => setNewPromo(p => ({ ...p, value: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                  />
                </div>
              </div>

              {/* Min order + Max uses */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs font-medium text-zinc-500 mb-1 block">ขั้นต่ำ (บาท)</label>
                  <input
                    type="number"
                    placeholder="0 = ไม่จำกัด"
                    value={newPromo.minOrder}
                    onChange={e => setNewPromo(p => ({ ...p, minOrder: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium text-zinc-500 mb-1 block">จำนวนสูงสุด</label>
                  <input
                    type="number"
                    placeholder="ว่าง = ไม่จำกัด"
                    value={newPromo.maxUses}
                    onChange={e => setNewPromo(p => ({ ...p, maxUses: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                  />
                </div>
              </div>

              {/* Expires */}
              <div>
                <label className="text-xs font-medium text-zinc-500 mb-1 block">วันหมดอายุ</label>
                <input
                  type="date"
                  value={newPromo.expiresAt}
                  onChange={e => setNewPromo(p => ({ ...p, expiresAt: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-sm rounded-xl border border-zinc-200 text-zinc-500 hover:bg-zinc-50">
                ยกเลิก
              </button>
              <button onClick={addPromo} className="flex-1 py-2.5 text-sm rounded-xl bg-zinc-900 text-white font-medium hover:bg-zinc-700 transition-colors">
                สร้างโปรโมชัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}