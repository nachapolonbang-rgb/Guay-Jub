'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Plus, Pencil, Trash2, X, Check,
  ToggleLeft, ToggleRight, Search,
  ImageIcon, Tag,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────── */

interface Topping {
  id:    string;
  name:  string;
  price: number;
}

interface Category {
  id:    number;
  name:  string;
  color: string;
}

interface MenuItem {
  id:          number;
  name:        string;
  category:    string;
  price:       number;
  cost:        number;
  isAvailable: boolean;
  sold:        number;
  ingredients: string[];
  toppings:    Topping[];
  image?:      string;
}

/* ─── Color options สำหรับหมวดหมู่ ──────────────────── */
const COLOR_OPTIONS = [
  { label: 'เหลือง', value: 'bg-amber-100 text-amber-700'   },
  { label: 'เขียว',  value: 'bg-emerald-100 text-emerald-700' },
  { label: 'ฟ้า',    value: 'bg-blue-100 text-blue-700'     },
  { label: 'ม่วง',   value: 'bg-purple-100 text-purple-700' },
  { label: 'แดง',    value: 'bg-red-100 text-red-700'       },
  { label: 'ชมพู',   value: 'bg-pink-100 text-pink-700'     },
  { label: 'ส้ม',    value: 'bg-orange-100 text-orange-700' },
];

/* ─── Helpers ─────────────────────────────────────────  */

function normalize(m: unknown): MenuItem {
  const raw = m as Record<string, unknown>;
  let ingredients: string[] = [];
  try {
    const v = raw.ingredients;
    ingredients = typeof v === 'string' ? JSON.parse(v) : Array.isArray(v) ? v : [];
  } catch { ingredients = []; }

  let toppings: Topping[] = [];
  try {
    const v = raw.toppings;
    toppings = typeof v === 'string' ? JSON.parse(v) : Array.isArray(v) ? v : [];
  } catch { toppings = []; }

  return {
    id:          Number(raw.id ?? 0),
    name:        String(raw.name ?? ''),
    category:    String(raw.category ?? ''),
    price:       Number(raw.price ?? 0),
    cost:        Number(raw.cost ?? 0),
    isAvailable: Boolean(raw.isAvailable ?? raw.available ?? true),
    sold:        Number(raw.sold ?? 0),
    ingredients,
    toppings,
    image:       raw.image ? String(raw.image) : undefined,
  };
}

function margin(price: number, cost: number) {
  if (price === 0) return NaN;
  return Math.round(((price - cost) / price) * 100);
}

const marginColor = (pct: number) =>
  isNaN(pct) ? 'text-zinc-400'
  : pct >= 55 ? 'text-emerald-400'
  : pct >= 40 ? 'text-amber-400'
  : 'text-red-400';

/* ─── Toast ──────────────────────────────────────────── */
function Toast({ msg, show }: { msg: string; show: boolean }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-sm shadow-xl transition-all duration-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}>
      <Check size={14} className="text-emerald-400" />
      {msg}
    </div>
  );
}

/* ─── ToppingEditor ──────────────────────────────────── */
function ToppingEditor({ toppings, onChange }: { toppings: Topping[]; onChange: (t: Topping[]) => void }) {
  const [newName,  setNewName]  = useState('');
  const [newPrice, setNewPrice] = useState('');
  const cls = 'px-3 py-2 text-sm text-white placeholder:text-zinc-500 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500';

  function add() {
    if (!newName.trim()) return;
    onChange([...toppings, { id: Date.now().toString(), name: newName.trim(), price: Number(newPrice) || 0 }]);
    setNewName(''); setNewPrice('');
  }

  return (
    <div>
      {toppings.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {toppings.map(t => (
            <div key={t.id} className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white">
              <span>{t.name}</span>
              {t.price > 0 && <span className="text-emerald-400">+฿{t.price}</span>}
              <button onClick={() => onChange(toppings.filter(x => x.id !== t.id))} className="text-zinc-500 hover:text-red-400 ml-1 transition-colors">
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input type="text" placeholder="ชื่อท็อปปิ้ง เช่น ไข่เพิ่ม" value={newName}
          onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()}
          className={`flex-1 ${cls}`} />
        <input type="number" placeholder="฿0" value={newPrice}
          onChange={e => setNewPrice(e.target.value)} className={`w-20 ${cls}`} />
        <button onClick={add} className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors">
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}

/* ─── ImageUploader ──────────────────────────────────── */
function ImageUploader({ current, onUploaded }: { current?: string; onUploaded: (url: string) => void }) {
  const fileRef   = useRef<HTMLInputElement>(null);
  const [preview,   setPreview]   = useState(current ?? '');
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState('');

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) { setError('กรุณาเลือกไฟล์รูปภาพเท่านั้น'); return; }
    if (file.size > 5 * 1024 * 1024)    { setError('ขนาดไฟล์ต้องไม่เกิน 5MB');       return; }
    setError('');
    setUploading(true);

    // preview ทันที
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res  = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        onUploaded(data.url);
      } else {
        setError(data.error ?? 'อัปโหลดไม่สำเร็จ');
        setPreview(current ?? '');
      }
    } catch {
      setError('เกิดข้อผิดพลาดระหว่างอัปโหลด');
      setPreview(current ?? '');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div
        onClick={() => fileRef.current?.click()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onDragOver={e => e.preventDefault()}
        className="relative w-full h-36 border-2 border-dashed border-zinc-700 rounded-xl overflow-hidden cursor-pointer hover:border-emerald-500 transition-colors bg-zinc-800/50 flex items-center justify-center group"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-zinc-500">
            <ImageIcon size={28} />
            <span className="text-xs">คลิกหรือลากรูปมาวางที่นี่</span>
            <span className="text-xs text-zinc-600">JPG / PNG / WEBP · ไม่เกิน 5MB</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span className="text-white text-xs">กำลังอัปโหลด...</span>
          </div>
        )}
        {preview && !uploading && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-semibold transition-opacity bg-black/50 px-3 py-1.5 rounded-lg">
              📷 เปลี่ยนรูป
            </span>
          </div>
        )}
      </div>
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
    </div>
  );
}

/* ─── CategoryManager modal ──────────────────────────── */
function CategoryManager({
  categories,
  onClose,
  onChanged,
}: {
  categories: Category[];
  onClose:   () => void;
  onChanged: (cats: Category[]) => void;
}) {
  const [cats,     setCats]     = useState<Category[]>(categories);
  const [newName,  setNewName]  = useState('');
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[0].value);
  const [editId,   setEditId]   = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor,setEditColor]= useState('');
  const [loading,  setLoading]  = useState(false);

  const inputCls = 'px-3 py-2 text-sm text-white placeholder:text-zinc-500 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500';

  async function addCat() {
    if (!newName.trim()) return;
    setLoading(true);
    const res  = await fetch('/api/categories', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name: newName.trim(), color: newColor }),
    });
    const cat = await res.json() as Category;
    const next = [...cats, cat];
    setCats(next);
    onChanged(next);
    setNewName('');
    setLoading(false);
  }

  async function saveCat(id: number) {
    const res  = await fetch('/api/categories', {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id, name: editName.trim(), color: editColor }),
    });
    const updated = await res.json() as Category;
    const next    = cats.map(c => c.id === id ? updated : c);
    setCats(next);
    onChanged(next);
    setEditId(null);
  }

  async function delCat(id: number) {
    await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
    const next = cats.filter(c => c.id !== id);
    setCats(next);
    onChanged(next);
  }

  function startEdit(cat: Category) {
    setEditId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-emerald-400" />
            <h2 className="text-base font-semibold text-white">จัดการหมวดหมู่</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* รายการหมวดหมู่ */}
        <div className="space-y-2 mb-5">
          {cats.map(cat => (
            <div key={cat.id} className="flex items-center gap-2 bg-zinc-800 rounded-xl px-3 py-2.5">
              {editId === cat.id ? (
                <>
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm text-white bg-zinc-700 border border-zinc-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  {/* color picker */}
                  <div className="flex gap-1">
                    {COLOR_OPTIONS.map(c => (
                      <button
                        key={c.value}
                        onClick={() => setEditColor(c.value)}
                        className={`w-5 h-5 rounded-full border-2 transition-all ${c.value.split(' ')[0]} ${editColor === c.value ? 'border-white scale-110' : 'border-transparent'}`}
                        title={c.label}
                      />
                    ))}
                  </div>
                  <button onClick={() => saveCat(cat.id)} className="p-1.5 text-emerald-400 hover:text-emerald-300 transition-colors">
                    <Check size={14} />
                  </button>
                  <button onClick={() => setEditId(null)} className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors">
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cat.color}`}>{cat.name}</span>
                  <div className="flex-1" />
                  <button onClick={() => startEdit(cat)} className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => delCat(cat.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </>
              )}
            </div>
          ))}
          {cats.length === 0 && (
            <p className="text-center text-zinc-500 text-sm py-4">ยังไม่มีหมวดหมู่</p>
          )}
        </div>

        {/* เพิ่มหมวดหมู่ใหม่ */}
        <div className="border-t border-zinc-800 pt-4">
          <p className="text-xs font-medium text-zinc-400 mb-3">เพิ่มหมวดหมู่ใหม่</p>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="ชื่อหมวดหมู่ เช่น ของหวาน"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCat()}
              className={`flex-1 ${inputCls}`}
            />
          </div>
          {/* เลือกสี */}
          <p className="text-xs text-zinc-500 mb-2">เลือกสี</p>
          <div className="flex gap-2 flex-wrap mb-3">
            {COLOR_OPTIONS.map(c => (
              <button
                key={c.value}
                onClick={() => setNewColor(c.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border transition-all ${newColor === c.value ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
              >
                <span className={`w-3 h-3 rounded-full ${c.value.split(' ')[0]}`} />
                {c.label}
              </button>
            ))}
          </div>
          {/* preview */}
          {newName && (
            <div className="mb-3">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${newColor}`}>{newName}</span>
            </div>
          )}
          <button
            onClick={addCat}
            disabled={!newName.trim() || loading}
            className="w-full py-2.5 text-sm rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={14} />}
            เพิ่มหมวดหมู่
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────── */

const emptyForm = {
  name:        '',
  category:    '',
  price:       '',
  cost:        '',
  ingredients: '',
  toppings:    [] as Topping[],
  image:       '',
};

export default function MenuPage() {
  const [menu,         setMenu]         = useState<MenuItem[]>([]);
  const [categories,   setCategories]   = useState<Category[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [filterCat,    setFilterCat]    = useState<string>('ทั้งหมด');
  const [toast,        setToast]        = useState({ show: false, msg: '' });
  const [modal,        setModal]        = useState<'add' | 'edit' | 'delete' | 'categories' | null>(null);
  const [editTarget,   setEditTarget]   = useState<MenuItem | null>(null);
  const [form,         setForm]         = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);

  /* โหลด categories */
  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then((data: Category[]) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  /* โหลด menu */
  useEffect(() => {
    fetch('/api/menu')
      .then(r => r.json())
      .then((data: unknown[]) => setMenu(Array.isArray(data) ? data.map(normalize) : []))
      .catch(() => setMenu([]))
      .finally(() => setLoading(false));
  }, []);

  function showToast(msg: string) {
    setToast({ show: true, msg });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2400);
  }

  function catColor(name: string) {
    return categories.find(c => c.name === name)?.color ?? 'bg-zinc-100 text-zinc-600';
  }

  const filtered = menu.filter(m => {
    const matchCat    = filterCat === 'ทั้งหมด' || m.category === filterCat;
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  /* Toggle available */
  async function toggleAvailable(id: number) {
    const item = menu.find(m => m.id === id);
    if (!item) return;
    const next = !item.isAvailable;
    const res  = await fetch(`/api/menu/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: next }),
    });
    const updated = normalize(await res.json());
    setMenu(prev => prev.map(m => m.id === id ? updated : m));
    showToast(`${item.name} ${next ? 'เปิดขาย' : 'ปิดขาย'}แล้ว`);
  }

  /* Open modals */
  function openAdd() {
    setForm({ ...emptyForm, category: categories[0]?.name ?? '' });
    setModal('add');
  }
  function openEdit(item: MenuItem) {
    setEditTarget(item);
    setForm({
      name:        item.name,
      category:    item.category,
      price:       String(item.price),
      cost:        String(item.cost),
      ingredients: item.ingredients.join(', '),
      toppings:    item.toppings,
      image:       item.image ?? '',
    });
    setModal('edit');
  }
  function openDelete(item: MenuItem) {
    setDeleteTarget(item);
    setModal('delete');
  }

  /* Build payload */
  function buildPayload() {
    const ingredientsArr = form.ingredients.split(',').map(s => s.trim()).filter(Boolean);
    return {
      name:        form.name,
      category:    form.category,
      price:       Number(form.price),
      cost:        Number(form.cost),
      ingredients: JSON.stringify(ingredientsArr),
      toppings:    JSON.stringify(form.toppings),
      ...(form.image ? { image: form.image } : {}),
    };
  }

  async function confirmAdd() {
    if (!form.name || !form.price || !form.cost || !form.category) return;
    const res     = await fetch('/api/menu', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload()),
    });
    const newItem = normalize(await res.json());
    setMenu(prev => [newItem, ...prev]);
    setModal(null);
    showToast(`เพิ่ม "${form.name}" แล้ว`);
  }

  async function confirmEdit() {
    if (!editTarget || !form.name || !form.price || !form.cost) return;
    const res     = await fetch(`/api/menu/${editTarget.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload()),
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

  const inputCls = 'w-full px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500';

  if (loading) return <div className="p-10 text-center text-zinc-400 text-sm">กำลังโหลดเมนู...</div>;

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
        <div className="flex gap-2">
          {/* ปุ่มจัดการหมวดหมู่ */}
          <button
            onClick={() => setModal('categories')}
            className="flex items-center gap-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            <Tag size={14} />จัดการหมวดหมู่
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={15} />เพิ่มเมนู
          </button>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input type="text" placeholder="ค้นหาเมนู..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm text-zinc-900 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['ทั้งหมด', ...categories.map(c => c.name)] as const).map(cat => (
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
          { label: 'เปิดขาย',     value: menu.filter(m => m.isAvailable).length },
          { label: 'ปิดขาย',      value: menu.filter(m => !m.isAvailable).length },
          { label: 'ขายได้รวม',   value: `${menu.reduce((s, m) => s + m.sold, 0).toLocaleString()} จาน` },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-zinc-100">
            <p className="text-xs text-zinc-400 mb-1">{s.label}</p>
            <p className="text-xl font-semibold text-zinc-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        <div className="grid grid-cols-[56px_1fr_100px_72px_72px_72px_80px_88px] gap-3 px-4 py-3 border-b border-zinc-100 bg-zinc-50">
          {['รูป', 'ชื่อเมนู', 'หมวดหมู่', 'ราคา', 'ต้นทุน', 'กำไร%', 'ขายได้', 'สถานะ'].map(h => (
            <p key={h} className="text-xs font-medium text-zinc-400">{h}</p>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-zinc-400">ไม่พบเมนูที่ค้นหา</div>
        ) : filtered.map((item, idx) => {
          const mgn = margin(item.price, item.cost);
          return (
            <div key={item.id}
              className={`grid grid-cols-[56px_1fr_100px_72px_72px_72px_80px_88px] gap-3 items-center px-4 py-3 hover:bg-zinc-50 transition-colors ${idx !== filtered.length - 1 ? 'border-b border-zinc-50' : ''} ${!item.isAvailable ? 'opacity-50' : ''}`}>
              {/* รูปภาพ */}
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-100 flex items-center justify-center">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={16} className="text-zinc-300" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-zinc-800 truncate">{item.name}</span>
                {item.ingredients.length > 0 && (
                  <span className="text-xs text-zinc-400 truncate">{item.ingredients.join(' · ')}</span>
                )}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-fit ${catColor(item.category)}`}>
                {item.category}
              </span>
              <span className="text-sm text-zinc-800">฿{item.price}</span>
              <span className="text-sm text-zinc-400">฿{item.cost}</span>
              <span className={`text-sm font-medium ${marginColor(mgn)}`}>
                {isNaN(mgn) ? 'N/A' : `${mgn}%`}
              </span>
              <span className="text-sm text-zinc-500">{item.sold.toLocaleString()}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleAvailable(item.id)} className="transition-colors">
                  {item.isAvailable
                    ? <ToggleRight size={22} className="text-emerald-500" />
                    : <ToggleLeft  size={22} className="text-zinc-400" />}
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

      {/* ── Add / Edit Modal ── */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">
                {modal === 'add' ? 'เพิ่มเมนูใหม่' : 'แก้ไขเมนู'}
              </h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {/* รูปภาพ */}
              <div>
                <label className="text-xs font-medium text-zinc-400 mb-1.5 block flex items-center gap-1.5">
                  <ImageIcon size={12} /> รูปภาพเมนู
                </label>
                <ImageUploader
                  current={form.image}
                  onUploaded={url => setForm(f => ({ ...f, image: url }))}
                />
              </div>

              {/* ชื่อเมนู */}
              <div>
                <label className="text-xs font-medium text-zinc-400 mb-1.5 block">ชื่อเมนู</label>
                <input type="text" placeholder="เช่น ก๋วยจั๊บน้ำใส" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
              </div>

              {/* หมวดหมู่ */}
              <div>
                <label className="text-xs font-medium text-zinc-400 mb-1.5 block">หมวดหมู่</label>
                {categories.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {categories.map(cat => (
                      <button key={cat.id} onClick={() => setForm(f => ({ ...f, category: cat.name }))}
                        className={`px-3 py-2 text-xs font-medium rounded-xl border transition-colors ${form.category === cat.name ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}>
                        {cat.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 bg-zinc-800 rounded-xl px-3 py-2.5">
                    ยังไม่มีหมวดหมู่ —{' '}
                    <button onClick={() => setModal('categories')} className="text-emerald-400 underline">เพิ่มหมวดหมู่</button>
                  </p>
                )}
              </div>

              {/* ราคา / ต้นทุน */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">ราคาขาย (฿)</label>
                  <input type="number" placeholder="0" value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">ต้นทุน (฿)</label>
                  <input type="number" placeholder="0" value={form.cost}
                    onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} className={inputCls} />
                </div>
              </div>

              {/* กำไร preview */}
              {form.price && form.cost && Number(form.price) > 0 && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-zinc-800 rounded-xl">
                  <span className="text-xs text-zinc-400">กำไรโดยประมาณ</span>
                  <span className={`text-sm font-semibold ml-auto ${marginColor(margin(Number(form.price), Number(form.cost)))}`}>
                    {margin(Number(form.price), Number(form.cost))}%
                  </span>
                </div>
              )}

              {/* วัตถุดิบ */}
              <div>
                <label className="text-xs font-medium text-zinc-400 mb-1.5 block">
                  วัตถุดิบ <span className="text-zinc-600">(คั่นด้วยจุลภาค)</span>
                </label>
                <input type="text" placeholder="เช่น เส้น, หมู, ไข่, ผักชี"
                  value={form.ingredients}
                  onChange={e => setForm(f => ({ ...f, ingredients: e.target.value }))} className={inputCls} />
                {form.ingredients && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.ingredients.split(',').map(s => s.trim()).filter(Boolean).map(ing => (
                      <span key={ing} className="text-xs bg-zinc-800 text-zinc-300 border border-zinc-700 px-2.5 py-1 rounded-full">{ing}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* ท็อปปิ้ง */}
              <div>
                <label className="text-xs font-medium text-zinc-400 mb-1.5 block">ท็อปปิ้ง / ตัวเลือกเพิ่ม</label>
                <ToppingEditor toppings={form.toppings} onChange={toppings => setForm(f => ({ ...f, toppings }))} />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={() => setModal(null)}
                className="flex-1 py-2.5 text-sm rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 transition-colors">
                ยกเลิก
              </button>
              <button
                onClick={modal === 'add' ? confirmAdd : confirmEdit}
                disabled={!form.name || !form.price || !form.cost || !form.category}
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
              <span className="text-white font-medium">&ldquo;{deleteTarget.name}&rdquo;</span> จะถูกลบออกจากระบบถาวร
            </p>
            <div className="flex gap-2">
              <button onClick={() => setModal(null)}
                className="flex-1 py-2.5 text-sm rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 transition-colors">
                ยกเลิก
              </button>
              <button onClick={confirmDelete}
                className="flex-1 py-2.5 text-sm rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors">
                ลบเมนู
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {modal === 'categories' && (
        <CategoryManager
          categories={categories}
          onClose={() => setModal(null)}
          onChanged={cats => setCategories(cats)}
        />
      )}
    </div>
  );
}