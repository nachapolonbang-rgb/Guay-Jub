'use client';

import { useState } from 'react';
import { Package, Plus, AlertTriangle, CheckCircle, XCircle, Search, Edit2, Trash2, Save, X } from 'lucide-react';

type StockStatus = 'ok' | 'low' | 'out';

interface InventoryItem {
  id: number;
  name: string;
  qty: number;
  unit: string;
  minQty: number;
  status: StockStatus;
  cost: number;
  updatedAt: string;
}

const INITIAL_ITEMS: InventoryItem[] = [
  { id: 1, name: 'ก๋วยจั๊บ',    qty: 5,  unit: 'กก.',  minQty: 2,  status: 'ok',  cost: 80,  updatedAt: '2025-05-13' },
  { id: 2, name: 'หมูสามชั้น',  qty: 3,  unit: 'กก.',  minQty: 2,  status: 'low', cost: 150, updatedAt: '2025-05-13' },
  { id: 3, name: 'ผักบุ้ง',     qty: 1,  unit: 'กก.',  minQty: 2,  status: 'low', cost: 30,  updatedAt: '2025-05-12' },
  { id: 4, name: 'คะน้า',       qty: 4,  unit: 'กก.',  minQty: 2,  status: 'ok',  cost: 35,  updatedAt: '2025-05-13' },
  { id: 5, name: 'เครื่องใน',   qty: 1,  unit: 'กก.',  minQty: 2,  status: 'low', cost: 120, updatedAt: '2025-05-12' },
  { id: 6, name: 'พริกไทยดำ',   qty: 0,  unit: 'กก.',  minQty: 1,  status: 'out', cost: 200, updatedAt: '2025-05-11' },
  { id: 7, name: 'น้ำมันหอย',   qty: 3,  unit: 'ขวด', minQty: 2,  status: 'ok',  cost: 45,  updatedAt: '2025-05-13' },
  { id: 8, name: 'ซีอิ๊วขาว',  qty: 6,  unit: 'ขวด', minQty: 2,  status: 'ok',  cost: 35,  updatedAt: '2025-05-13' },
];

function getStatus(qty: number, min: number): StockStatus {
  if (qty === 0) return 'out';
  if (qty <= min) return 'low';
  return 'ok';
}

const STATUS_META: Record<StockStatus, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  ok:  { label: 'พอ',       bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <CheckCircle size={13} /> },
  low: { label: 'ใกล้หมด', bg: 'bg-amber-50',   text: 'text-amber-700',   icon: <AlertTriangle size={13} /> },
  out: { label: 'หมดแล้ว', bg: 'bg-red-50',     text: 'text-red-600',     icon: <XCircle size={13} /> },
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_ITEMS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<StockStatus | 'all'>('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQty, setEditQty] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', qty: '', unit: 'กก.', minQty: '', cost: '' });

  const filtered = items.filter(item => {
    const matchSearch = item.name.includes(search);
    const matchStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: items.length,
    ok:    items.filter(i => i.status === 'ok').length,
    low:   items.filter(i => i.status === 'low').length,
    out:   items.filter(i => i.status === 'out').length,
  };

  function startEdit(item: InventoryItem) {
    setEditingId(item.id);
    setEditQty(String(item.qty));
  }

  function saveEdit(id: number) {
    const qty = parseFloat(editQty);
    if (isNaN(qty) || qty < 0) return;
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const status = getStatus(qty, item.minQty);
      return { ...item, qty, status, updatedAt: new Date().toISOString().split('T')[0] };
    }));
    setEditingId(null);
  }

  function deleteItem(id: number) {
    if (!confirm('ลบรายการนี้?')) return;
    setItems(prev => prev.filter(i => i.id !== id));
  }

  function addItem() {
    const qty = parseFloat(newItem.qty);
    const min = parseFloat(newItem.minQty);
    const cost = parseFloat(newItem.cost);
    if (!newItem.name.trim() || isNaN(qty) || isNaN(min)) return;
    const id = Math.max(...items.map(i => i.id)) + 1;
    setItems(prev => [...prev, {
      id, name: newItem.name.trim(), qty, unit: newItem.unit,
      minQty: min, status: getStatus(qty, min),
      cost: isNaN(cost) ? 0 : cost,
      updatedAt: new Date().toISOString().split('T')[0],
    }]);
    setNewItem({ name: '', qty: '', unit: 'กก.', minQty: '', cost: '' });
    setShowAddModal(false);
  }

  return (
    <div className="p-5 lg:p-7 min-h-screen bg-zinc-100">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Inventory</h1>
          <p className="text-xs text-zinc-400 mt-0.5">จัดการสต็อกวัตถุดิบ</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={15} /> เพิ่มวัตถุดิบ
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'ทั้งหมด',   value: stats.total, color: 'text-zinc-900',    dot: 'bg-zinc-400' },
          { label: 'พอ',        value: stats.ok,    color: 'text-emerald-700', dot: 'bg-emerald-500' },
          { label: 'ใกล้หมด',  value: stats.low,   color: 'text-amber-700',   dot: 'bg-amber-400' },
          { label: 'หมดแล้ว',  value: stats.out,   color: 'text-red-600',     dot: 'bg-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-zinc-100">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              <p className="text-xs text-zinc-400">{s.label}</p>
            </div>
            <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="ค้นหาวัตถุดิบ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-300"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'ok', 'low', 'out'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`text-xs px-3 py-2 rounded-xl border font-medium transition-colors ${
                filterStatus === s
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400'
              }`}
            >
              {s === 'all' ? 'ทั้งหมด' : STATUS_META[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-zinc-100">
          {['วัตถุดิบ', 'จำนวน', 'ขั้นต่ำ', 'ราคา/หน่วย', 'สถานะ', ''].map(h => (
            <p key={h} className="text-xs font-medium text-zinc-400">{h}</p>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Package size={28} className="mx-auto text-zinc-200 mb-3" />
            <p className="text-sm text-zinc-400">ไม่พบวัตถุดิบ</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-50">
            {filtered.map(item => {
              const meta = STATUS_META[item.status];
              const isEditing = editingId === item.id;
              return (
                <div key={item.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-3.5 hover:bg-zinc-50/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-zinc-800">{item.name}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">อัปเดต {item.updatedAt}</p>
                  </div>

                  <div>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editQty}
                        onChange={e => setEditQty(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveEdit(item.id)}
                        className="w-20 px-2 py-1 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-300"
                        autoFocus
                      />
                    ) : (
                      <p className="text-sm text-zinc-800 font-medium">{item.qty} {item.unit}</p>
                    )}
                  </div>

                  <p className="text-sm text-zinc-500">{item.minQty} {item.unit}</p>
                  <p className="text-sm text-zinc-500">฿{item.cost}</p>

                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full w-fit ${meta.bg} ${meta.text}`}>
                    {meta.icon} {meta.label}
                  </span>

                  <div className="flex items-center gap-1">
                    {isEditing ? (
                      <>
                        <button onClick={() => saveEdit(item.id)} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                          <Save size={13} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 transition-colors">
                          <X size={13} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(item)} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 transition-colors">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/30">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-zinc-900">เพิ่มวัตถุดิบ</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'ชื่อวัตถุดิบ *', key: 'name',   type: 'text',   placeholder: 'เช่น หมูสามชั้น' },
                { label: 'จำนวน *',        key: 'qty',    type: 'number', placeholder: '0' },
                { label: 'ขั้นต่ำ *',      key: 'minQty', type: 'number', placeholder: '1' },
                { label: 'ราคา/หน่วย',    key: 'cost',   type: 'number', placeholder: '0' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-zinc-500 mb-1 block">{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={(newItem as any)[f.key]}
                    onChange={e => setNewItem(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-zinc-500 mb-1 block">หน่วย</label>
                <select
                  value={newItem.unit}
                  onChange={e => setNewItem(p => ({ ...p, unit: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                >
                  {['กก.', 'ขวด', 'ถุง', 'กล่อง', 'ลิตร', 'ชิ้น'].map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 text-sm rounded-xl border border-zinc-200 text-zinc-500 hover:bg-zinc-50">
                ยกเลิก
              </button>
              <button onClick={addItem} className="flex-1 py-2.5 text-sm rounded-xl bg-zinc-900 text-white font-medium hover:bg-zinc-700 transition-colors">
                เพิ่ม
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}