'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Store, Clock, Bell, Shield, Save, Check, Power,
  ChevronRight, AlertTriangle, CheckCircle, XCircle, Loader2,
} from 'lucide-react';
import { useShop } from '@/src/backend/context/ShopContext';
import { useSettings } from '@/src/backend/hooks/useSettings'; // ← ปรับ path

// ─── Types ───────────────────────────────────────────────────────────────────

type TabId = 'shop' | 'hours' | 'notifications' | 'security';
type NotifPermission = 'default' | 'granted' | 'denied' | 'unsupported';

// ─── Constants ───────────────────────────────────────────────────────────────

const DAY_NAMES = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์', 'อาทิตย์'];

function todayIndex(): number {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

function toMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function fmtCountdown(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
}

// ─── Custom hooks ─────────────────────────────────────────────────────────────

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function useNotifPermission(): [NotifPermission, () => Promise<void>] {
  const [perm, setPerm] = useState<NotifPermission>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission as NotifPermission;
  });
  const request = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPerm(result as NotifPermission);
  }, []);
  return [perm, request];
}

function fireNotif(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  new Notification(title, { body, icon: '/favicon.ico' });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { isOpen, setShopOpen } = useShop();
  const now = useClock();
  const [notifPerm, requestNotifPerm] = useNotifPermission();

  // ── API-backed settings ───────────────────────────────────────────────────
  const { settings, setSettings, save, hydrated, saving, saveError } = useSettings();
  const {
    shopName, shopPhone, shopAddress, shopNote,
    hours,
    notifNew, notifLowStock, notifDaily, dailyTime,
  } = settings;

  // ── Local UI state ────────────────────────────────────────────────────────
  const [toastMsg,  setToastMsg]  = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('shop');
  const [countdown, setCountdown] = useState('');

  // Security (never persisted)
  const [currentPw, setCurrentPw] = useState('');
  const [newPw,     setNewPw]     = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError,   setPwError]   = useState('');
  const [pwOk,      setPwOk]      = useState(false);

  const dailyTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Auto open/close based on schedule ─────────────────────────────────────
  useEffect(() => {
    if (!hydrated) return;
    const idx = todayIndex();
    const h   = hours[idx];
    if (h.closed) return;

    const nowMins      = now.getHours() * 60 + now.getMinutes();
    const shouldBeOpen = nowMins >= toMinutes(h.open) && nowMins < toMinutes(h.close);

    if (shouldBeOpen !== isOpen) {
      setShopOpen(shouldBeOpen);
      setSettings({ isOpen: shouldBeOpen });
      fireNotif(
        shouldBeOpen ? '✅ เปิดร้านอัตโนมัติ' : '🔴 ปิดร้านอัตโนมัติ',
        shouldBeOpen ? `ถึงเวลา ${h.open} — ร้านเปิดแล้ว` : `ถึงเวลา ${h.close} — ร้านปิดแล้ว`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now.getMinutes(), hydrated]);

  // ── Daily summary scheduler ────────────────────────────────────────────────
  const scheduleDailySummary = useCallback(() => {
    if (dailyTimerRef.current)     clearTimeout(dailyTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    const [h, m] = dailyTime.split(':').map(Number);
    const target = new Date();
    target.setHours(h, m, 0, 0);
    if (target <= new Date()) target.setDate(target.getDate() + 1);

    countdownTimerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.floor((target.getTime() - Date.now()) / 1000));
      setCountdown(fmtCountdown(remaining));
    }, 1000);

    dailyTimerRef.current = setTimeout(() => {
      fireNotif('📊 สรุปยอดขายประจำวัน', 'ยอดวันนี้: ฿4,280 | 23 ออเดอร์ | เมนูยอดนิยม: ก๋วยจั๊บ');
      scheduleDailySummary();
    }, target.getTime() - Date.now());
  }, [dailyTime]);

  useEffect(() => {
    if (notifDaily) scheduleDailySummary();
    else {
      if (dailyTimerRef.current)     clearTimeout(dailyTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      setCountdown('');
    }
    return () => {
      if (dailyTimerRef.current)     clearTimeout(dailyTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [notifDaily, scheduleDailySummary]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  function showToast(msg = 'บันทึกแล้ว') {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2200);
  }

  async function handleSave() {
    await save();
    showToast(saveError ? `บันทึกไม่สำเร็จ: ${saveError}` : 'บันทึกแล้ว');
  }

  function handleToggleShop() {
    const next = !isOpen;
    setShopOpen(next);
    setSettings({ isOpen: next });
    fireNotif(
      next ? '✅ เปิดร้านแล้ว' : '🔴 ปิดร้านแล้ว',
      next ? 'ลูกค้าสั่งอาหารได้แล้ว' : 'ร้านหยุดรับออเดอร์ชั่วคราว'
    );
  }

  function handleChangeHour(i: number, field: 'open' | 'close' | 'closed', value: string | boolean) {
    const next = hours.map((h, idx) => idx === i ? { ...h, [field]: value } : h);
    setSettings({ hours: next });
  }

  function handleChangePw() {
    setPwOk(false);
    if (!currentPw)          { setPwError('กรุณาใส่รหัสผ่านปัจจุบัน'); return; }
    if (newPw.length < 6)    { setPwError('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร'); return; }
    if (newPw !== confirmPw) { setPwError('รหัสผ่านไม่ตรงกัน'); return; }
    setPwError('');
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    setPwOk(true);
    showToast('เปลี่ยนรหัสผ่านสำเร็จ');
    // TODO: call PUT /api/auth/change-password with { currentPw, newPw }
  }

  function testNotif(type: 'order' | 'stock') {
    if (notifPerm !== 'granted') return;
    if (type === 'order') fireNotif('🛎 ออเดอร์ใหม่!',    'โต๊ะ 3 สั่ง ก๋วยจั๊บ x2, น้ำเปล่า x1');
    else                  fireNotif('⚠️ วัตถุดิบใกล้หมด', 'เส้นหมี่เหลือ 5 หน่วย (ขั้นต่ำ 10)');
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const todayIdx  = todayIndex();
  const todayHour = hours[todayIdx];
  const pad       = (n: number) => String(n).padStart(2, '0');
  const timeStr   = `${DAY_NAMES[todayIdx]}นี้  ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'shop',          label: 'ข้อมูลร้าน',   icon: <Store  size={15} /> },
    { id: 'hours',         label: 'เวลาเปิด-ปิด', icon: <Clock  size={15} /> },
    { id: 'notifications', label: 'การแจ้งเตือน', icon: <Bell   size={15} /> },
    { id: 'security',      label: 'ความปลอดภัย',  icon: <Shield size={15} /> },
  ];

  // Block render until API responds
  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-100">
        <Loader2 className="animate-spin text-zinc-400" size={28} />
      </div>
    );
  }

  return (
    <div className="p-5 lg:p-7 min-h-screen bg-zinc-100">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Settings</h1>
          <p className="text-xs text-zinc-400 mt-0.5">ตั้งค่าระบบร้านอาหาร</p>
        </div>
        <div className="flex items-center gap-2">
          {saving && (
            <span className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Loader2 size={12} className="animate-spin" /> กำลังบันทึก…
            </span>
          )}
          {toastMsg && !saving && (
            <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border ${
              toastMsg.includes('ไม่สำเร็จ')
                ? 'text-red-700 bg-red-50 border-red-200'
                : 'text-emerald-700 bg-emerald-50 border-emerald-200'
            }`}>
              <Check size={12} /> {toastMsg}
            </span>
          )}
        </div>
      </div>

      {/* ── Shop Open / Close Banner ── */}
      <div className={`flex items-center justify-between rounded-2xl px-5 py-4 mb-5 border transition-colors duration-300 ${
        isOpen ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            {isOpen && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isOpen ? 'bg-emerald-500' : 'bg-red-400'}`} />
          </span>
          <div>
            <p className={`text-sm font-semibold ${isOpen ? 'text-emerald-800' : 'text-red-700'}`}>
              {isOpen ? 'ร้านเปิดอยู่' : 'ร้านปิดอยู่'}
            </p>
            <p className={`text-xs mt-0.5 ${isOpen ? 'text-emerald-600' : 'text-red-500'}`}>
              {isOpen ? 'ลูกค้าสั่งอาหารได้ตามปกติ' : 'ลูกค้าจะสั่งอาหารไม่ได้จนกว่าจะเปิดร้าน'}
            </p>
            {!todayHour.closed && (
              <p className="text-xs mt-0.5 text-zinc-400">
                กำหนดการวันนี้ {todayHour.open} – {todayHour.close}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleToggleShop}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
            isOpen ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'
          }`}
        >
          <Power size={14} />
          {isOpen ? 'ปิดร้าน' : 'เปิดร้าน'}
        </button>
      </div>

      <div className="grid lg:grid-cols-[200px_1fr] gap-5">

        {/* Sidebar */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-2 h-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors mb-0.5 last:mb-0 ${
                activeTab === tab.id ? 'bg-zinc-900 text-white font-medium' : 'text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              <div className="flex items-center gap-2.5">{tab.icon}{tab.label}</div>
              {activeTab !== tab.id && <ChevronRight size={13} className="text-zinc-300" />}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-5">

          {/* ── Shop Info ── */}
          {activeTab === 'shop' && (
            <div>
              <p className="text-sm font-semibold text-zinc-800 mb-5">ข้อมูลร้านอาหาร</p>
              <div className="space-y-4 max-w-lg">
                {[
                  { label: 'ชื่อร้าน',     value: shopName,    key: 'shopName'    as const, placeholder: 'ชื่อร้าน' },
                  { label: 'เบอร์โทรร้าน', value: shopPhone,   key: 'shopPhone'   as const, placeholder: '0XX-XXX-XXXX' },
                  { label: 'ที่อยู่',       value: shopAddress, key: 'shopAddress' as const, placeholder: 'ที่อยู่ร้าน' },
                  { label: 'หมายเหตุ',      value: shopNote,    key: 'shopNote'    as const, placeholder: 'ข้อมูลเพิ่มเติม' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-xs font-medium text-zinc-500 mb-1.5 block">{f.label}</label>
                    <input
                      type="text"
                      value={f.value}
                      onChange={e => setSettings({ [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300 text-zinc-800"
                    />
                  </div>
                ))}
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors mt-2">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  บันทึก
                </button>
              </div>
            </div>
          )}

          {/* ── Hours ── */}
          {activeTab === 'hours' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm font-semibold text-zinc-800">เวลาเปิด-ปิดร้าน</p>
                <span className="text-xs font-mono text-zinc-400 bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-100">
                  {timeStr}
                </span>
              </div>
              <div className="space-y-2.5 max-w-md">
                {DAY_NAMES.map((day, i) => {
                  const isToday = i === todayIdx;
                  return (
                    <div key={day} className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-colors ${
                      isToday ? 'border-blue-200 bg-blue-50' : 'border-zinc-100'
                    }`}>
                      <span className={`text-sm w-14 shrink-0 ${isToday ? 'font-semibold text-blue-700' : 'text-zinc-700'}`}>
                        {day}{isToday && ' ★'}
                      </span>
                      {hours[i].closed ? (
                        <span className="flex-1 text-xs text-zinc-400 bg-zinc-50 px-3 py-2 rounded-lg border border-zinc-100">หยุด</span>
                      ) : (
                        <div className="flex items-center gap-2 flex-1">
                          <input type="time" value={hours[i].open}
                            onChange={e => handleChangeHour(i, 'open', e.target.value)}
                            className="flex-1 px-3 py-2 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                          />
                          <span className="text-xs text-zinc-400">–</span>
                          <input type="time" value={hours[i].close}
                            onChange={e => handleChangeHour(i, 'close', e.target.value)}
                            className="flex-1 px-3 py-2 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                          />
                        </div>
                      )}
                      <button
                        onClick={() => handleChangeHour(i, 'closed', !hours[i].closed)}
                        className={`text-xs px-3 py-2 rounded-xl border font-medium transition-colors shrink-0 ${
                          hours[i].closed ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-400 border-zinc-200 hover:border-zinc-400'
                        }`}
                      >
                        {hours[i].closed ? 'หยุด' : 'เปิด'}
                      </button>
                    </div>
                  );
                })}
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors mt-2">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  บันทึก
                </button>
              </div>
            </div>
          )}

          {/* ── Notifications ── */}
          {activeTab === 'notifications' && (
            <div>
              <p className="text-sm font-semibold text-zinc-800 mb-4">การแจ้งเตือน</p>

              {notifPerm === 'unsupported' && (
                <div className="flex items-start gap-2.5 p-3 mb-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-500">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />เบราว์เซอร์นี้ไม่รองรับ Notification API
                </div>
              )}
              {notifPerm === 'default' && (
                <div className="flex items-center justify-between p-3 mb-4 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-amber-800">ยังไม่ได้อนุญาต Notification</p>
                      <p className="text-xs text-amber-600 mt-0.5">กดปุ่มเพื่อขอสิทธิ์แจ้งเตือนจากเบราว์เซอร์</p>
                    </div>
                  </div>
                  <button onClick={requestNotifPerm} className="shrink-0 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg transition-colors">
                    ขอสิทธิ์
                  </button>
                </div>
              )}
              {notifPerm === 'granted' && (
                <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                  <p className="text-xs text-emerald-700 font-medium">เบราว์เซอร์อนุญาตการแจ้งเตือนแล้ว</p>
                </div>
              )}
              {notifPerm === 'denied' && (
                <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-50 border border-red-200">
                  <XCircle size={14} className="text-red-500 shrink-0" />
                  <p className="text-xs text-red-600">ถูกบล็อก — กรุณาเปิดสิทธิ์ใน Browser Settings แล้ว refresh</p>
                </div>
              )}

              <div className="space-y-3 max-w-md">
                {/* New order */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 bg-zinc-50/50">
                  <div>
                    <p className="text-sm font-medium text-zinc-800">ออเดอร์ใหม่</p>
                    <p className="text-xs text-zinc-400 mt-0.5">แจ้งเตือนเมื่อมีออเดอร์เข้า</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {notifPerm === 'granted' && (
                      <button onClick={() => testNotif('order')} className="text-xs text-zinc-400 hover:text-zinc-600 border border-zinc-200 hover:border-zinc-300 px-2.5 py-1.5 rounded-lg transition-colors">ทดสอบ</button>
                    )}
                    <button
                      onClick={() => { setSettings({ notifNew: !notifNew }); showToast(); }}
                      className={`w-11 h-6 rounded-full transition-all relative ${notifNew ? 'bg-emerald-500' : 'bg-zinc-200'}`}
                      role="switch" aria-checked={notifNew}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${notifNew ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>

                {/* Low stock */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 bg-zinc-50/50">
                  <div>
                    <p className="text-sm font-medium text-zinc-800">วัตถุดิบใกล้หมด</p>
                    <p className="text-xs text-zinc-400 mt-0.5">แจ้งเตือนเมื่อสต็อกต่ำกว่าขั้นต่ำ</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {notifPerm === 'granted' && (
                      <button onClick={() => testNotif('stock')} className="text-xs text-zinc-400 hover:text-zinc-600 border border-zinc-200 hover:border-zinc-300 px-2.5 py-1.5 rounded-lg transition-colors">ทดสอบ</button>
                    )}
                    <button
                      onClick={() => { setSettings({ notifLowStock: !notifLowStock }); showToast(); }}
                      className={`w-11 h-6 rounded-full transition-all relative ${notifLowStock ? 'bg-emerald-500' : 'bg-zinc-200'}`}
                      role="switch" aria-checked={notifLowStock}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${notifLowStock ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>

                {/* Daily summary */}
                <div className="p-4 rounded-xl border border-zinc-100 bg-zinc-50/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-800">สรุปยอดขายประจำวัน</p>
                      <p className="text-xs text-zinc-400 mt-0.5">ส่งสรุปทุกคืนเวลาที่ตั้ง</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="time" value={dailyTime}
                        onChange={e => setSettings({ dailyTime: e.target.value })}
                        className="text-xs border border-zinc-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-300"
                      />
                      <button
                        onClick={() => { setSettings({ notifDaily: !notifDaily }); showToast(); }}
                        className={`w-11 h-6 rounded-full transition-all relative ${notifDaily ? 'bg-emerald-500' : 'bg-zinc-200'}`}
                        role="switch" aria-checked={notifDaily}
                      >
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${notifDaily ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  </div>
                  {notifDaily && countdown && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500 bg-white rounded-lg px-3 py-2 border border-zinc-100">
                      <Clock size={12} />
                      สรุปยอดจะส่งใน
                      <span className="font-mono font-semibold text-zinc-800 ml-1">{countdown}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Security ── */}
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
                      type="password" value={f.value}
                      onChange={e => f.set(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-300 text-zinc-800"
                    />
                  </div>
                ))}
                {pwError && <p className="text-xs text-red-500">{pwError}</p>}
                {pwOk    && <p className="text-xs text-emerald-600 flex items-center gap-1"><Check size={12} /> เปลี่ยนรหัสผ่านสำเร็จ</p>}
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