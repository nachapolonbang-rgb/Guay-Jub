'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Package, Plus, AlertTriangle, CheckCircle, XCircle,
  Search, Edit2, Trash2, Save, X, Download, History,
  Bell, ChevronRight, RefreshCw,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────

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

interface InventoryLog {
  id: number;
  itemId: number;
  prevQty: number;
  newQty: number;
  changedBy: string;
  note: string | null;
  createdAt: string;
  item: { name: string; unit: string };
}

// ─── Helpers ──────────────────────────────────────────────────

const STATUS_META: Record<StockStatus, { label: string; pill: string; dot: string; icon: React.ReactNode }> = {
  ok:  { label: 'พอ',       pill: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20', dot: 'bg-emerald-400', icon: <CheckCircle size={11} /> },
  low: { label: 'ใกล้หมด', pill: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',       dot: 'bg-amber-400',   icon: <AlertTriangle size={11} /> },
  out: { label: 'หมดแล้ว', pill: 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20',             dot: 'bg-red-400',     icon: <XCircle size={11} /> },
};

function showToast(msg: string, type: 'ok' | 'err' = 'ok') {
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = `
    position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:9999;
    padding:10px 18px;border-radius:12px;font-size:14px;font-weight:500;color:#fff;
    background:${type === 'ok' ? '#059669' : '#dc2626'};
    box-shadow:0 4px 24px rgba(0,0,0,.4);transition:opacity .3s;
  `;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 2500);
}

// ─── Component ────────────────────────────────────────────────

export default function InventoryPage() {
  const [items, setItems]               = useState<InventoryItem[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState<StockStatus | 'all'>('all');
  const [editingId, setEditingId]       = useState<number | null>(null);
  const [editQty, setEditQty]           = useState('');
  const [editNote, setEditNote]         = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem]           = useState({ name: '', qty: '', unit: 'กก.', minQty: '', cost: '' });
  const [saving, setSaving]             = useState(false);
  const [showLogs, setShowLogs]         = useState(false);
  const [logs, setLogs]                 = useState<InventoryLog[]>([]);
  const [logsLoading, setLogsLoading]   = useState(false);

  // ─── Fetch ──────────────────────────────────────────────────

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inventory');
      if (!res.ok) throw new Error();
      setItems(await res.json());
    } catch {
      showToast('โหลดข้อมูลไม่สำเร็จ', 'err');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await fetch('/api/inventory-logs');
      setLogs(await res.json());
    } catch {
      showToast('โหลด log ไม่สำเร็จ', 'err');
    } finally {
      setLogsLoading(false);
    }
  };

  // ─── CRUD ───────────────────────────────────────────────────

  function startEdit(item: InventoryItem) {
    setEditingId(item.id);
    setEditQty(String(item.qty));
    setEditNote('');
  }

  async function saveEdit(id: number) {
    const qty = parseFloat(editQty);
    if (isNaN(qty) || qty < 0) return;
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qty, note: editNote || null }),
      });
      if (!res.ok) throw new Error();
      const updated: InventoryItem = await res.json();
      setItems(prev => prev.map(i => i.id === id ? updated : i));
      showToast('บันทึกสำเร็จ');
      if (showLogs) fetchLogs();
    } catch {
      showToast('บันทึกไม่สำเร็จ', 'err');
    } finally {
      setEditingId(null);
    }
  }

  async function deleteItem(id: number) {
    if (!confirm('ลบรายการนี้?')) return;
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setItems(prev => prev.filter(i => i.id !== id));
      showToast('ลบแล้ว');
    } catch {
      showToast('ลบไม่สำเร็จ', 'err');
    }
  }

  async function addItem() {
    const qty  = parseFloat(newItem.qty);
    const min  = parseFloat(newItem.minQty);
    const cost = parseFloat(newItem.cost);
    if (!newItem.name.trim() || isNaN(qty) || isNaN(min)) {
      showToast('กรุณากรอกข้อมูลให้ครบ', 'err');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newItem.name.trim(), qty, unit: newItem.unit, minQty: min, cost: isNaN(cost) ? 0 : cost }),
      });
      if (!res.ok) throw new Error();
      const created: InventoryItem = await res.json();
      setItems(prev => [...prev, created]);
      setNewItem({ name: '', qty: '', unit: 'กก.', minQty: '', cost: '' });
      setShowAddModal(false);
      showToast('เพิ่มวัตถุดิบสำเร็จ');
    } catch {
      showToast('เพิ่มไม่สำเร็จ', 'err');
    } finally {
      setSaving(false);
    }
  }

  // ─── Derived ────────────────────────────────────────────────

  const alerts   = items.filter(i => i.status !== 'ok');
  const filtered = items.filter(i => i.name.includes(search) && (filterStatus === 'all' || i.status === filterStatus));
  const stats    = { total: items.length, ok: items.filter(i=>i.status==='ok').length, low: items.filter(i=>i.status==='low').length, out: items.filter(i=>i.status==='out').length };
  const fillPct  = items.length ? Math.round((stats.ok / stats.total) * 100) : 0;

  // ─── Render ─────────────────────────────────────────────────

  return (
    <div className="min-h-screen p-6 lg:p-10" style={{ background: 'linear-gradient(135deg,#0f0f11 0%,#141418 50%,#0f0f11 100%)', fontFamily:"'Sarabun',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
        .glass{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(12px);}
        .glass-strong{background:rgba(255,255,255,.065);border:1px solid rgba(255,255,255,.10);backdrop-filter:blur(20px);}
        .row-hover:hover{background:rgba(255,255,255,.03);}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .3s ease forwards;}
        @keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
        .slide-in{animation:slideIn .25s cubic-bezier(.22,1,.36,1) forwards;}
        .shine-btn::after{content:'';position:absolute;inset:0;border-radius:inherit;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.1) 50%,transparent 60%);opacity:0;transition:opacity .3s;}
        .shine-btn:hover::after{opacity:1;}
      `}</style>

      {/* Alert Banner */}
      {alerts.length > 0 && (
        <div className="mb-5 rounded-2xl px-5 py-3.5 flex items-center gap-3 fade-up" style={{ background:'rgba(245,158,11,.08)', border:'1px solid rgba(245,158,11,.2)' }}>
          <Bell size={15} className="text-amber-400 shrink-0" />
          <p className="text-sm text-amber-300">
            มี <span className="font-semibold">{alerts.length}</span> รายการที่ต้องสั่งซื้อ —{' '}
            <span className="text-amber-400/80">{alerts.map(a => a.name).join(', ')}</span>
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
            <p className="text-xs font-medium tracking-widest text-zinc-500 uppercase">คลังวัตถุดิบ</p>
          </div>
          <h1 className="text-3xl font-semibold text-white tracking-tight">Inventory</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={() => { setShowLogs(true); fetchLogs(); }}
            className="glass flex items-center gap-2 text-sm text-zinc-400 hover:text-white px-4 py-2.5 rounded-xl transition-colors"
          >
            <History size={14} /> ประวัติ
          </button>
          <a href="/api/inventory-export" target="_blank" rel="noreferrer"
            className="glass flex items-center gap-2 text-sm text-zinc-400 hover:text-white px-4 py-2.5 rounded-xl transition-colors"
          >
            <Download size={14} /> Export CSV
          </a>
          <button
            onClick={() => setShowAddModal(true)}
            className="shine-btn relative flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-white overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}
          >
            <Plus size={15} strokeWidth={2.5} /> เพิ่มวัตถุดิบ
          </button>
        </div>
      </div>

      {/* Health bar */}
      <div className="glass rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-zinc-400 tracking-wide">ภาพรวมสต็อก</p>
          <div className="flex items-center gap-3">
            <p className="text-xs font-semibold text-white">{fillPct}% พร้อมใช้งาน</p>
            <button onClick={fetchItems} title="รีเฟรช" className="text-zinc-600 hover:text-zinc-300 transition-colors"><RefreshCw size={12} /></button>
          </div>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width:`${fillPct}%`, background:'linear-gradient(90deg,#f59e0b,#10b981)' }} />
        </div>
        <div className="flex items-center gap-1 mt-3 text-xs text-zinc-500">
          <span className="text-emerald-400 font-semibold">{stats.ok}</span> พอ ·
          <span className="text-amber-400 font-semibold ml-1">{stats.low}</span> ใกล้หมด ·
          <span className="text-red-400 font-semibold ml-1">{stats.out}</span> หมด
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label:'ทั้งหมด',  value:stats.total, accent:'#a1a1aa', glow:'rgba(161,161,170,.08)' },
          { label:'พอ',       value:stats.ok,    accent:'#34d399', glow:'rgba(52,211,153,.08)'  },
          { label:'ใกล้หมด', value:stats.low,   accent:'#fbbf24', glow:'rgba(251,191,36,.08)'  },
          { label:'หมดแล้ว', value:stats.out,   accent:'#f87171', glow:'rgba(248,113,113,.08)' },
        ].map(s => (
          <div key={s.label} className="relative rounded-2xl p-4" style={{ background:`linear-gradient(135deg,${s.glow},rgba(255,255,255,.02))`, border:'1px solid rgba(255,255,255,.07)' }}>
            <div className="w-6 h-6 rounded-lg mb-3 flex items-center justify-center" style={{ background:`${s.accent}20` }}>
              <div className="w-2 h-2 rounded-full" style={{ background:s.accent }} />
            </div>
            <p className="text-3xl font-bold text-white mb-0.5">{loading ? '—' : s.value}</p>
            <p className="text-xs text-zinc-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input type="text" placeholder="ค้นหาวัตถุดิบ..." value={search} onChange={e=>setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm glass rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20" />
        </div>
        <div className="flex gap-1.5">
          {(['all','ok','low','out'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className="text-xs px-3.5 py-2 rounded-xl font-medium transition-all"
              style={filterStatus===s ? { background:'rgba(255,255,255,.12)', color:'#fff', border:'1px solid rgba(255,255,255,.16)' }
                                     : { background:'transparent', color:'#71717a', border:'1px solid rgba(255,255,255,.06)' }}>
              {s==='all' ? 'ทั้งหมด' : STATUS_META[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="hidden sm:grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_100px] gap-4 px-6 py-3.5 border-b border-white/5">
          {['วัตถุดิบ','จำนวน','ขั้นต่ำ','ราคา/หน่วย','สถานะ',''].map(h => (
            <p key={h} className="text-xs font-semibold text-zinc-600 tracking-widest uppercase">{h}</p>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-zinc-600">กำลังโหลด...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Package size={22} className="mx-auto text-zinc-700 mb-3" />
            <p className="text-sm text-zinc-600">ไม่พบวัตถุดิบ</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {filtered.map((item, i) => {
              const meta = STATUS_META[item.status];
              const isEditing = editingId === item.id;
              const qtyPct = Math.min(100, Math.round((item.qty / Math.max(item.minQty * 3, 1)) * 100));
              return (
                <div key={item.id} className="row-hover grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_100px] gap-4 items-center px-6 py-4 fade-up transition-colors" style={{ animationDelay:`${i*25}ms` }}>
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-7 rounded-full shrink-0 ${meta.dot}`} />
                    <div>
                      <p className="text-sm font-semibold text-white">{item.name}</p>
                      <p className="text-xs text-zinc-600">{item.updatedAt?.split('T')[0]}</p>
                    </div>
                  </div>

                  <div>
                    {isEditing ? (
                      <div className="space-y-1.5">
                        <input type="number" value={editQty} onChange={e=>setEditQty(e.target.value)}
                          onKeyDown={e=>e.key==='Enter' && saveEdit(item.id)}
                          className="w-20 px-2 py-1.5 text-sm glass rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-white/20" autoFocus />
                        <input type="text" value={editNote} onChange={e=>setEditNote(e.target.value)} placeholder="หมายเหตุ..."
                          className="w-28 px-2 py-1 text-xs glass rounded-lg text-zinc-300 placeholder-zinc-600 focus:outline-none" />
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-semibold text-white">{item.qty} <span className="text-zinc-500 font-normal text-xs">{item.unit}</span></p>
                        <div className="mt-1.5 h-0.5 bg-white/5 rounded-full w-16 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width:`${qtyPct}%`, background: item.status==='ok'?'#34d399':item.status==='low'?'#fbbf24':'#f87171' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-zinc-500">{item.minQty} <span className="text-xs">{item.unit}</span></p>
                  <p className="text-sm text-zinc-300 font-medium">฿{item.cost}</p>

                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full w-fit ${meta.pill}`}>
                    {meta.icon} {meta.label}
                  </span>

                  <div className="flex items-center gap-1">
                    {isEditing ? (
                      <>
                        <button onClick={()=>saveEdit(item.id)} className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"><Save size={13}/></button>
                        <button onClick={()=>setEditingId(null)} className="p-1.5 rounded-lg text-zinc-500 hover:bg-white/5 transition-colors"><X size={13}/></button>
                      </>
                    ) : (
                      <>
                        <button onClick={()=>startEdit(item)} className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/5 transition-colors"><Edit2 size={13}/></button>
                        <button onClick={()=>deleteItem(item.id)} className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={13}/></button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Logs Drawer */}
      {showLogs && (
        <div className="fixed inset-0 z-40 flex justify-end" style={{ background:'rgba(0,0,0,.6)', backdropFilter:'blur(4px)' }} onClick={()=>setShowLogs(false)}>
          <div className="glass-strong slide-in h-full w-full max-w-md flex flex-col" style={{ boxShadow:'-20px 0 60px rgba(0,0,0,.5)' }} onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <div>
                <h2 className="text-base font-semibold text-white">ประวัติการแก้ไข</h2>
                <p className="text-xs text-zinc-500 mt-0.5">100 รายการล่าสุด</p>
              </div>
              <button onClick={()=>setShowLogs(false)} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"><X size={15}/></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
              {logsLoading ? (
                <p className="text-sm text-zinc-600 text-center py-10">กำลังโหลด...</p>
              ) : logs.length === 0 ? (
                <p className="text-sm text-zinc-600 text-center py-10">ยังไม่มีประวัติ</p>
              ) : logs.map(log => {
                const diff = log.newQty - log.prevQty;
                return (
                  <div key={log.id} className="glass rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-white">{log.item.name}</p>
                      <span className={`text-xs font-semibold ${diff>=0?'text-emerald-400':'text-red-400'}`}>
                        {diff>=0?'+':''}{diff} {log.item.unit}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 flex-wrap">
                      <span>{log.prevQty} → {log.newQty} {log.item.unit}</span>
                      <ChevronRight size={10}/>
                      <span>{log.changedBy}</span>
                      {log.note && <><ChevronRight size={10}/><span className="text-zinc-400 italic">{log.note}</span></>}
                    </div>
                    <p className="text-xs text-zinc-700 mt-1">{new Date(log.createdAt).toLocaleString('th-TH')}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center" style={{ background:'rgba(0,0,0,.7)', backdropFilter:'blur(4px)' }}>
          <div className="glass-strong rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-sm fade-up" style={{ boxShadow:'0 0 80px rgba(0,0,0,.6)' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-white">เพิ่มวัตถุดิบ</h2>
                <p className="text-xs text-zinc-500 mt-0.5">กรอกข้อมูลด้านล่าง</p>
              </div>
              <button onClick={()=>setShowAddModal(false)} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"><X size={15}/></button>
            </div>
            <div className="space-y-3">
              {[
                { label:'ชื่อวัตถุดิบ',  key:'name',   type:'text',   placeholder:'เช่น หมูสามชั้น' },
                { label:'จำนวน',         key:'qty',    type:'number', placeholder:'0' },
                { label:'จำนวนขั้นต่ำ', key:'minQty', type:'number', placeholder:'1' },
                { label:'ราคา/หน่วย',   key:'cost',   type:'number', placeholder:'0' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-zinc-500 mb-1.5 block">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={(newItem as any)[f.key]}
                    onChange={e=>setNewItem(p=>({...p,[f.key]:e.target.value}))}
                    className="w-full px-3.5 py-2.5 text-sm glass rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-white/20" />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-zinc-500 mb-1.5 block">หน่วย</label>
                <select value={newItem.unit} onChange={e=>setNewItem(p=>({...p,unit:e.target.value}))}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-white/20"
                  style={{ background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.08)' }}>
                  {['กก.','ขวด','ถุง','กล่อง','ลิตร','ชิ้น'].map(u=>(
                    <option key={u} value={u} style={{ background:'#1a1a1f' }}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={()=>setShowAddModal(false)} className="flex-1 py-2.5 text-sm rounded-xl text-zinc-400 hover:text-zinc-200 transition-all" style={{ border:'1px solid rgba(255,255,255,.08)' }}>
                ยกเลิก
              </button>
              <button onClick={addItem} disabled={saving}
                className="shine-btn relative flex-1 py-2.5 text-sm rounded-xl font-semibold text-white overflow-hidden disabled:opacity-60"
                style={{ background:'linear-gradient(135deg,#f59e0b,#ef4444)' }}>
                {saving ? 'กำลังบันทึก...' : 'เพิ่มรายการ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}