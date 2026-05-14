'use client';

import { useState } from 'react';
import { Settings, Clock, Store, Bell, Shield, Save, Check, ChevronRight, Power } from 'lucide-react';
import { useShop } from '@/src/backend/context/ShopContext';   // ← adjust path to match your project

interface OpenHour { open: string; close: string; closed: boolean; }

const DAY_NAMES = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์', 'อาทิตย์'];

export default function SettingsPage() {
  const { isOpen, setShopOpen } = useShop();

  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'shop' | 'hours' | 'notifications' | 'security'>('shop');

  // Shop info
  const [shopName, setShopName]       = useState('ร้านก๋วยจั๊บป้าแดง');
  const [shopPhone, setShopPhone]     = useState('081-234-5678');
  const [shopAddress, setShopAddress] = useState('123 ถ.สุขุมวิท กรุงเทพฯ');
  const [shopNote, setShopNote]       = useState('เปิดทุกวัน ยกเว้นวันพุธ');

  // Hours
  const [hours, setHours] = useState<OpenHour[]>(DAY_NAMES.map((_, i) => ({
    open: '08:00', close: '16:00', closed: i === 2,
  })));

  // Notifications
  const [notifNew, setNotifNew]           = useState(true);
  const [notifLowStock, setNotifLowStock] = useState(true);
  const [notifDaily, setNotifDaily]       = useState(false);

  // Security
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw]         = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError]     = useState('');

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleChangeHour(i: number, field: keyof OpenHour, value: string | boolean) {
    setHours(prev => prev.map((h, idx) => idx === i ? { ...h, [field]: value } : h));
  }

  function handleChangePw() {
    if (!currentPw)          { setPwError('กรุณาใส่รหัสผ่านปัจจุบัน'); return; }
    if (newPw.length < 6)    { setPwError('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร'); return; }
    if (newPw !== confirmPw) { setPwError('รหัสผ่านไม่ตรงกัน'); return; }
    setPwError('');
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    handleSave();
  }

  const tabs = [
    { id: 'shop',          label: 'ข้อมูลร้าน',   icon: <Store size={15} /> },
    { id: 'hours',         label: 'เวลาเปิด-ปิด', icon: <Clock size={15} /> },
    { id: 'notifications', label: 'การแจ้งเตือน', icon: <Bell size={15} /> },
    { id: 'security',      label: 'ความปลอดภัย',  icon: <Shield size={15} /> },
  ] as const;

  return (
    <div className="p-5 lg:p-7 min-h-screen bg-zinc-100">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Settings</h1>
          <p className="text-xs text-zinc-400 mt-0.5">ตั้งค่าระบบร้านอาหาร</p>
        </div>
        {saved && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <Check size={12} /> บันทึกแล้ว
          </span>
        )}
      </div>

      {/* ── Shop Open / Close Banner ── */}
      <div className={`flex items-center justify-between rounded-2xl px-5 py-4 mb-5 border transition-colors duration-300 ${
        isOpen
          ? 'bg-emerald-50 border-emerald-200'
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center gap-3">
          {/* pulsing dot */}
          <span className="relative flex h-3 w-3">
            {isOpen && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isOpen ? 'bg-emerald-500' : 'bg-red-400'}`} />
          </span>
          <div>
            <p className={`text-sm font-semibold ${isOpen ? 'text-emerald-800' : 'text-red-700'}`}>
              {isOpen ? 'ร้านเปิดอยู่' : 'ร้านปิดอยู่'}
            </p>
            <p className={`text-xs mt-0.5 ${isOpen ? 'text-emerald-600' : 'text-red-500'}`}>
              {isOpen
                ? 'ลูกค้าสามารถสั่งอาหารได้ตามปกติ'
                : 'ลูกค้าจะไม่สามารถสั่งอาหารได้จนกว่าจะเปิดร้าน'}
            </p>
          </div>
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setShopOpen(!isOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
            isOpen
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white'
          }`}
        >
          <Power size={14} />
          {isOpen ? 'ปิดร้าน' : 'เปิดร้าน'}
        </button>
      </div>

      <div className="grid lg:grid-cols-[200px_1fr] gap-5">

        {/* Sidebar tabs */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-2 h-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors mb-0.5 last:mb-0 ${
                activeTab === tab.id
                  ? 'bg-zinc-900 text-white font-medium'
                  : 'text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {tab.icon}
                {tab.label}
              </div>
              {activeTab !== tab.id && <ChevronRight size={13} className="text-zinc-300" />}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-5">

          {/* ---- Shop info ---- */}
          {activeTab === 'shop' && (
            <div>
              <p className="text-sm font-semibold text-zinc-800 mb-5">ข้อมูลร้านอาหาร</p>
              <div className="space-y-4 max-w-lg">
                {[
                  { label: 'ชื่อร้าน',     value: shopName,    set: setShopName,    placeholder: 'ชื่อร้าน' },
                  { label: 'เบอร์โทรร้าน', value: shopPhone,   set: setShopPhone,   placeholder: '0XX-XXX-XXXX' },
                  { label: 'ที่อยู่',       value: shopAddress, set: setShopAddress, placeholder: 'ที่อยู่ร้าน' },
                  { label: 'หมายเหตุ',      value: shopNote,    set: setShopNote,    placeholder: 'ข้อมูลเพิ่มเติม' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-xs font-medium text-zinc-500 mb-1.5 block">{f.label}</label>
                    <input
                      type="text"
                      value={f.value}
                      onChange={e => f.set(e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300 text-zinc-800"
                    />
                  </div>
                ))}
                <button onClick={handleSave} className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors mt-2">
                  <Save size={14} /> บันทึก
                </button>
              </div>
            </div>
          )}

          {/* ---- Hours ---- */}
          {activeTab === 'hours' && (
            <div>
              <p className="text-sm font-semibold text-zinc-800 mb-5">เวลาเปิด-ปิดร้าน</p>
              <div className="space-y-3 max-w-md">
                {DAY_NAMES.map((day, i) => (
                  <div key={day} className="flex items-center gap-3">
                    <span className="text-sm text-zinc-700 w-14 shrink-0">{day}</span>
                    {hours[i].closed ? (
                      <span className="flex-1 text-xs text-zinc-400 bg-zinc-50 px-3 py-2 rounded-xl border border-zinc-100">หยุด</span>
                    ) : (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="time"
                          value={hours[i].open}
                          onChange={e => handleChangeHour(i, 'open', e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                        />
                        <span className="text-xs text-zinc-400">–</span>
                        <input
                          type="time"
                          value={hours[i].close}
                          onChange={e => handleChangeHour(i, 'close', e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                        />
                      </div>
                    )}
                    <button
                      onClick={() => handleChangeHour(i, 'closed', !hours[i].closed)}
                      className={`text-xs px-3 py-2 rounded-xl border font-medium transition-colors shrink-0 ${
                        hours[i].closed
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'bg-white text-zinc-400 border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      {hours[i].closed ? 'หยุด' : 'เปิด'}
                    </button>
                  </div>
                ))}
                <button onClick={handleSave} className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors mt-2">
                  <Save size={14} /> บันทึก
                </button>
              </div>
            </div>
          )}

          {/* ---- Notifications ---- */}
          {activeTab === 'notifications' && (
            <div>
              <p className="text-sm font-semibold text-zinc-800 mb-5">การแจ้งเตือน</p>
              <div className="space-y-3 max-w-md">
                {[
                  { label: 'ออเดอร์ใหม่',         sub: 'แจ้งเตือนเมื่อมีออเดอร์เข้า',        value: notifNew,      set: setNotifNew },
                  { label: 'วัตถุดิบใกล้หมด',     sub: 'แจ้งเตือนเมื่อสต็อกต่ำกว่าขั้นต่ำ', value: notifLowStock, set: setNotifLowStock },
                  { label: 'สรุปยอดขายประจำวัน', sub: 'ส่งสรุปทุกคืนเวลา 22:00',           value: notifDaily,    set: setNotifDaily },
                ].map(n => (
                  <div key={n.label} className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 bg-zinc-50/50">
                    <div>
                      <p className="text-sm font-medium text-zinc-800">{n.label}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{n.sub}</p>
                    </div>
                    <button
                      onClick={() => { n.set(!n.value); handleSave(); }}
                      className={`w-11 h-6 rounded-full transition-all relative ${n.value ? 'bg-emerald-500' : 'bg-zinc-200'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${n.value ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---- Security ---- */}
          {activeTab === 'security' && (
            <div>
              <p className="text-sm font-semibold text-zinc-800 mb-5">เปลี่ยนรหัสผ่าน</p>
              <div className="space-y-4 max-w-sm">
                {[
                  { label: 'รหัสผ่านปัจจุบัน',  value: currentPw, set: setCurrentPw },
                  { label: 'รหัสผ่านใหม่',       value: newPw,     set: setNewPw },
                  { label: 'ยืนยันรหัสผ่านใหม่', value: confirmPw, set: setConfirmPw },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-xs font-medium text-zinc-500 mb-1.5 block">{f.label}</label>
                    <input
                      type="password"
                      value={f.value}
                      onChange={e => f.set(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                    />
                  </div>
                ))}
                {pwError && <p className="text-xs text-red-500">{pwError}</p>}
                <button onClick={handleChangePw} className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
                  <Shield size={14} /> เปลี่ยนรหัสผ่าน
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}