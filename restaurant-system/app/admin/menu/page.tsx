'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, ToggleLeft, ToggleRight, Search } from 'lucide-react';

type Category = 'ก๋วยจั๊บ' | 'ผัก' | 'เครื่องดื่ม';

interface MenuItem {
  id: number;
  name: string;
  category: Category;
  price: number;
  cost: number;
  isAvailable: boolean;
  sold: number;
}

const CATEGORIES: Category[] = ['ก๋วยจั๊บ', 'ผัก', 'เครื่องดื่ม'];

const CAT_COLOR: Record<Category, string> = {
  'ก๋วยจั๊บ': 'bg-amber-100 text-amber-700',
  'ผัก': 'bg-emerald-100 text-emerald-700',
  'เครื่องดื่ม': 'bg-blue-100 text-blue-700',
};

function Toast({ msg, show }: { msg: string; show: boolean }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-sm shadow-xl transition-all duration-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}>
      <Check size={14} className="text-emerald-400" />
      {msg}
    </div>
  );
}

const emptyForm = { name: '', category: 'ก๋วยจั๊บ' as Category, price: '', cost: '' };

function normalize(m: any): MenuItem {
  return {
    id: Number(m.id ?? 0),
    name: String(m.name ?? ''),
    category: (m.category ?? 'ก๋วยจั๊บ') as Category,
    price: Number(m.price ?? 0),
    cost: Number(m.cost ?? 0),
    isAvailable: Boolean(m.isAvailable ?? m.available ?? true),
    sold: Number(m.sold ?? 0),
  };
}

export default function MenuPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<Category | 'ทั้งหมด'>('ทั้งหมด');
  const [toast, setToast] = useState({ show: false, msg: '' });
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [editTarget, setEditTarget] = useState<MenuItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);

  useEffect(() => {
    fetch('/api/menu')
      .then(r => r.json())
      .then(data => {
        const items = Array.isArray(data) ? data : [];
        setMenu(items.map(normalize));
      })
      .catch(() => setMenu([]))
      .finally(() => setLoading(false));
  }, []);

  function showToast(msg: string) {
    setToast({ show: true, msg });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2400);
  }

  const filtered = menu.filter(m => {
    const matchCat = filterCat === 'ทั้งหมด' || m.category === filterCat;
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  async function toggleAvailable(id: number) {
    const item = menu.find(m => m.id === id);
    if (!item) return;
    const next = !item.isAvailable;
    const res = await fetch(`/api/menu/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: next }),
    });
    const updated = normalize(await res.json());
    setMenu(prev => prev.map(m => m.id === id ? updated : m));
    showToast(`${item.name} ${next ? 'เปิดขาย' : 'ปิดขาย'}แล้ว`);
  }

  function openAdd() { setForm(emptyForm); setModal('add'); }
  function openEdit(item: MenuItem) {
    setEditTarget(item);
    setForm({ name: item.name, category: item.category, price: String(item.price), cost: String(item.cost) });
    setModal('edit');
  }
  function openDelete(item: MenuItem) { setDeleteTarget(item); setModal('delete'); }

  async function confirmAdd() {
    if (!form.name || !form.price || !form.cost) return;
    const res = await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, category: form.category, price: Number(form.price), cost: Number(form.cost) }),
    });
    const newItem = normalize(await res.json());
    setMenu(prev => [newItem, ...prev]);
    setModal(null);
    showToast(`เพิ่ม "${form.name}" แล้ว`);
  }

  async function confirmEdit() {
    if (!editTarget || !form.name || !form.price || !form.cost) return;
    const res = await fetch(`/api/menu/${editTarget.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, category: form.category, price: Number(form.price), cost: Number(form.cost) }),
    });
    const updated = normalize(await res.json());
    setMenu(prev => prev.map(m => m.id === editTarget.id ? updated : m));
    setModal(null);
    showToast(`แก้ไข "${form.name}" แล้ว`);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/menu/${deleteTarget.id}`, { method: 'DELETE' });
    setMenu(prev => prev.filter(m => m.id !== deleteTarget.id));
    setModal(null);
    showToast(`ลบ "${deleteTarget.name}" แล้ว`);
  }

  function margin(price: number, cost: number) {
    return Math.round(((price - cost) / price) * 100);
  }
  const marginColor = (pct: number) =>
    pct >= 55 ? 'text-emerald-400' : pct >= 40 ? 'text-amber-400' : 'text-red-400';

  // ---- input class ที่ใช้ซ้ำ ----
  const inputCls = 'w-full px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500';

  if (loading) {
    return <div className="p-10 text-center text-zinc-400 text-sm">กำลังโหลดเมนู...</div>;
  }

  return (
    <div className="p-5 lg:p-7 min-h-screen bg-zinc-100">
      <Toast show={toast.show} msg={toast.msg} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">จัดการเมนู</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {menu.length} รายการทั้งหมด · {menu.filter(m => m.isAvailable).length} รายการเปิดขาย
          </p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
          <Plus size={15} />เพิ่มเมนู
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input type="text" placeholder="ค้นหาเมนู..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm text-zinc-900 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        </div>
        <div className="flex gap-2">
          {(['ทั้งหมด', ...CATEGORIES] as const).map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className={`text-xs px-3 py-2 rounded-xl border transition-colors font-medium ${filterCat === cat ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'เมนูทั้งหมด', value: menu.length },
          { label: 'เปิดขาย', value: menu.filter(m => m.isAvailable).length },
          { label: 'ปิดขาย', value: menu.filter(m => !m.isAvailable).length },
          { label: 'ขายได้รวม', value: `${menu.reduce((s, m) => s + m.sold, 0).toLocaleString()} จาน` },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-zinc-100">
            <p className="text-xs text-zinc-400 mb-1">{s.label}</p>
            <p className="text-xl font-semibold text-zinc-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        <div className="grid grid-cols-[1fr_100px_72px_72px_72px_80px_88px] gap-3 px-4 py-3 border-b border-zinc-100 bg-zinc-50">
          {['ชื่อเมนู', 'หมวดหมู่', 'ราคา', 'ต้นทุน', 'กำไร%', 'ขายได้', 'สถานะ'].map(h => (
            <p key={h} className="text-xs font-medium text-zinc-400">{h}</p>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-zinc-400">ไม่พบเมนูที่ค้นหา</div>
        ) : filtered.map((item, idx) => {
          const mgn = margin(item.price, item.cost);
          return (
            <div key={item.id}
              className={`grid grid-cols-[1fr_100px_72px_72px_72px_80px_88px] gap-3 items-center px-4 py-3 hover:bg-zinc-50 transition-colors ${idx !== filtered.length - 1 ? 'border-b border-zinc-50' : ''} ${!item.isAvailable ? 'opacity-50' : ''}`}>
              <div className="flex items-center min-w-0">
                <span className="text-sm font-medium text-zinc-800 truncate">{item.name}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-fit ${CAT_COLOR[item.category]}`}>
                {item.category}
              </span>
              <span className="text-sm text-zinc-800">฿{item.price}</span>
              <span className="text-sm text-zinc-400">฿{item.cost}</span>
              <span className={`text-sm font-medium ${marginColor(mgn)}`}>{mgn}%</span>
              <span className="text-sm text-zinc-500">{item.sold.toLocaleString()}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleAvailable(item.id)} className="transition-colors">
                  {item.isAvailable ? <ToggleRight size={22} className="text-emerald-500" /> : <ToggleLeft size={22} className="text-zinc-400" />}
                </button>
                <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors">
                  <Pencil size={13} />
                </button>
                <button onClick={() => openDelete(item)} className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal — dark theme */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">{modal === 'add' ? 'เพิ่มเมนูใหม่' : 'แก้ไขเมนู'}</h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-400 mb-1.5 block">ชื่อเมนู</label>
                <input type="text" placeholder="เช่น ก๋วยจั๊บน้ำใส" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-400 mb-1.5 block">หมวดหมู่</label>
                <div className="flex gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setForm(f => ({ ...f, category: cat }))}
                      className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-colors ${form.category === cat ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">ราคาขาย (฿)</label>
                  <input type="number" placeholder="0" value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">ต้นทุน (฿)</label>
                  <input type="number" placeholder="0" value={form.cost}
                    onChange={e => setForm(f => ({ ...f, cost: e.target.value }))}
                    className={inputCls} />
                </div>
              </div>
              {form.price && form.cost && Number(form.price) > 0 && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-zinc-800 rounded-xl">
                  <span className="text-xs text-zinc-400">กำไรโดยประมาณ</span>
                  <span className={`text-sm font-semibold ml-auto ${marginColor(margin(Number(form.price), Number(form.cost)))}`}>
                    {margin(Number(form.price), Number(form.cost))}%
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 text-sm rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 transition-colors">ยกเลิก</button>
              <button onClick={modal === 'add' ? confirmAdd : confirmEdit} disabled={!form.name || !form.price || !form.cost}
                className="flex-1 py-2.5 text-sm rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                {modal === 'add' ? 'เพิ่มเมนู' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && deleteTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <Trash2 size={18} className="text-red-400" />
            </div>
            <h2 className="text-base font-semibold text-white mb-1">ลบเมนูนี้?</h2>
            <p className="text-sm text-zinc-400 mb-6">
              <span className="text-white font-medium">"{deleteTarget.name}"</span> จะถูกลบออกจากระบบถาวร
            </p>
            <div className="flex gap-2">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 text-sm rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 transition-colors">ยกเลิก</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 text-sm rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors">ลบเมนู</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}