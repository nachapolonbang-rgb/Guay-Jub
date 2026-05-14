'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/src/backend/components/Navbar';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
}

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: number;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
  userId: number | null;
}

interface FavoriteMenu {
  name: string;
  count: number;
  price: number;
}

const STATUS_META: Record<string, { label: string; bg: string; text: string }> = {
  new:     { label: 'ใหม่',       bg: 'bg-blue-50',    text: 'text-blue-600' },
  cooking: { label: 'กำลังปรุง', bg: 'bg-amber-50',   text: 'text-amber-600' },
  ready:   { label: 'พร้อมรับ',  bg: 'bg-emerald-50', text: 'text-emerald-600' },
  done:    { label: 'รับแล้ว',   bg: 'bg-zinc-100',   text: 'text-zinc-500' },
};

export default function MemberPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<FavoriteMenu[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Edit Profile Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Change Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchUser();
  }, []);

  const fetchOrders = useCallback(async (userId: number) => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error();
      const data: Order[] = await res.json();

      // ✅ กรองเฉพาะ order ของ user นี้
      const mine = data.filter(o => o.userId === userId);
      setOrders(mine);

      // ✅ คำนวณเมนูโปรดจากออร์เดอร์ที่ผ่านมา
      const countMap: Record<string, { count: number; price: number }> = {};
      mine.forEach(order => {
        order.items.forEach(item => {
          if (!countMap[item.name]) {
            countMap[item.name] = { count: 0, price: item.price };
          }
          countMap[item.name].count += item.qty;
        });
      });

      const sorted = Object.entries(countMap)
        .map(([name, { count, price }]) => ({ name, count, price }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3); // top 3

      setFavorites(sorted);
    } catch {
      // ไม่แสดง error ถ้าโหลด orders ไม่ได้
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  async function fetchUser() {
    try {
      const res = await fetch('/api/me');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        fetchOrders(data.user.id);
      } else {
        router.push('/login');
      }
    } catch {
      showToast('โหลดข้อมูลไม่สำเร็จ', 'error');
    } finally {
      setLoadingUser(false);
    }
  }

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastType(type);
    setToast(msg);
    setTimeout(() => setToast(''), 2400);
  };

  function openEditModal() {
    setEditName(user?.name ?? '');
    setEditEmail(user?.email ?? '');
    setShowEditModal(true);
  }

  async function handleSaveProfile() {
    if (!editName.trim()) { showToast('กรุณากรอกชื่อ', 'error'); return; }
    if (!editEmail.trim() || !editEmail.includes('@')) { showToast('อีเมลไม่ถูกต้อง', 'error'); return; }

    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), email: editEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setShowEditModal(false);
        showToast('บันทึกโปรไฟล์สำเร็จ! ✅');
      } else {
        showToast(data.message || 'เกิดข้อผิดพลาด', 'error');
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) { showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error'); return; }
    if (newPassword !== confirmPassword) { showToast('รหัสผ่านใหม่ไม่ตรงกัน', 'error'); return; }
    if (newPassword.length < 8) { showToast('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร', 'error'); return; }

    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('เปลี่ยนรหัสผ่านสำเร็จ! 🔒');
        setShowPasswordModal(false);
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      } else {
        showToast(data.message || 'เกิดข้อผิดพลาด', 'error');
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleLogout() {
    try { await fetch('/api/logout', { method: 'POST' }); } catch {}
    router.push('/login');
  }

  const totalSpent = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0);
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? '?';

  function timeAgo(dateStr: string) {
    const m = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (m < 1) return 'เพิ่งสั่ง';
    if (m < 60) return `${m} นาทีที่แล้ว`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} ชม. ที่แล้ว`;
    return `${Math.floor(h / 24)} วันที่แล้ว`;
  }

  const MENU_ICONS: Record<string, string> = {
    'ก๋วยจั๊บน้ำใส': '🍜', 'ก๋วยจั๊บน้ำข้น': '🍲', 'ก๋วยจั๊บพิเศษ': '🥣',
    'ผักบุ้งไฟแดง': '🥬', 'คะน้าน้ำมันหอย': '🥦', 'น้ำเปล่า': '💧', 'น้ำอัดลม': '🥤',
  };
  function menuIcon(name: string) {
    return MENU_ICONS[name] ?? '🍽️';
  }

  return (
    <div className="min-h-screen bg-[#FFF8F2] relative overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap');
        * { font-family: 'Sarabun', sans-serif; }

        @keyframes slideDown  { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp    { from{opacity:0;transform:translateY(20px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes slideRight { from{opacity:0;transform:translateX(-24px)} to{opacity:1;transform:translateX(0)} }
        @keyframes fadeIn     { from{opacity:0} to{opacity:1} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.5} 100%{transform:scale(1.6);opacity:0} }
        @keyframes floatY     { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-6px)} }
        @keyframes toastIn    { from{opacity:0;transform:translateX(-50%) translateY(-10px) scale(0.95)} to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)} }
        @keyframes spin       { to{transform:rotate(360deg)} }
        @keyframes popIn      { 0%{opacity:0;transform:scale(0.92) translateY(10px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes rowSlide   { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }

        .slide-down  { animation: slideDown  0.5s ease both }
        .slide-up    { animation: slideUp    0.5s ease both }
        .slide-right { animation: slideRight 0.5s ease both }
        .fade-in     { animation: fadeIn     0.4s ease both }
        .float-y     { animation: floatY     3s ease-in-out infinite }
        .pop-in      { animation: popIn      0.35s cubic-bezier(0.34,1.56,0.64,1) both }
        .row-slide   { animation: rowSlide   0.4s ease both }
        .spinner     { animation: spin       0.8s linear infinite }

        .d-1{animation-delay:.1s} .d-2{animation-delay:.2s} .d-3{animation-delay:.3s}
        .d-4{animation-delay:.4s} .d-5{animation-delay:.5s}

        .pulse-ring::before {
          content:''; position:absolute; inset:-4px; border-radius:50%;
          border:2px solid rgba(255,255,255,0.4);
          animation:pulse-ring 2s ease-out infinite;
        }

        .card-hover { transition:transform 0.25s ease,box-shadow 0.25s ease }
        .card-hover:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(61,26,0,0.1) }

        .settings-row { transition:background 0.15s,color 0.15s,padding-left 0.2s }
        .settings-row:hover { padding-left:18px !important }

        .order-row { transition:background 0.15s,transform 0.15s }
        .order-row:hover { background:#FFF8F4; transform:translateX(3px); border-radius:12px }

        .fav-row { transition:background 0.15s,transform 0.15s,box-shadow 0.15s }
        .fav-row:hover { background:#FFF3EB; transform:translateX(3px); border-radius:14px; box-shadow:0 4px 12px rgba(232,83,10,0.1) }

        .modal-bg  { animation: fadeIn 0.2s ease both }
        .modal-box { animation: popIn  0.3s cubic-bezier(0.34,1.56,0.64,1) both }
      `}</style>

      <Navbar />

      {/* TOAST */}
      {toast && (
        <div
          className={`fixed top-5 left-1/2 z-50 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-xl whitespace-nowrap
            ${toastType === 'error' ? 'bg-red-600 text-white' : 'bg-[#3D1A00] text-white'}`}
          style={{ animation: 'toastIn 0.3s ease both', transform: 'translateX(-50%)' }}
        >
          {toast}
        </div>
      )}

      {loadingUser ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 rounded-full border-2 border-[#F3DDD0] border-t-[#E8530A] spinner" />
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-5 py-6 space-y-5">

          {/* ── ROW 1: Profile + Order History ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* PROFILE */}
            <div
              className={`lg:col-span-2 rounded-2xl p-6 text-white relative overflow-hidden card-hover ${mounted ? 'slide-right' : 'opacity-0'}`}
              style={{ background: 'linear-gradient(135deg,#3D1A00 0%,#7C3A10 55%,#C0502B 100%)' }}
            >
              <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
              <div className="absolute -bottom-10 left-1/4 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

              <div className={`flex items-center gap-4 relative z-10 ${mounted ? 'fade-in d-2' : 'opacity-0'}`}>
                <div className="relative pulse-ring float-y flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-white/15 border-2 border-white/35 flex items-center justify-center text-2xl font-bold select-none">
                    {initial}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold truncate">{user?.name ?? '-'}</h2>
                  <p className="text-sm text-white/55 truncate">{user?.email ?? '-'}</p>
                  <span className="inline-flex items-center gap-1 mt-2 bg-amber-100 text-amber-700 px-3 py-0.5 rounded-full text-xs font-bold">
                    ★ สมาชิก
                  </span>
                </div>
              </div>

              <div className={`grid grid-cols-2 gap-3 mt-5 relative z-10 ${mounted ? 'slide-up d-3' : 'opacity-0'}`}>
                <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
                  <p className="text-2xl font-bold">{orders.length}</p>
                  <p className="text-xs text-white/60 mt-0.5">ออร์เดอร์</p>
                </div>
                <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
                  <p className="text-2xl font-bold">฿{totalSpent.toLocaleString()}</p>
                  <p className="text-xs text-white/60 mt-0.5">ยอดใช้จ่าย</p>
                </div>
              </div>
            </div>

            {/* ORDER HISTORY */}
            <div className={`lg:col-span-3 bg-white rounded-2xl p-6 border border-[#F3DDD0] card-hover ${mounted ? 'slide-down d-1' : 'opacity-0'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-[#7C3A10] uppercase tracking-widest">🧾 ออร์เดอร์ล่าสุด</h3>
                <span className="text-xs text-[#9A6651] bg-[#FFF3EB] px-2 py-0.5 rounded-full">
                  {orders.length} รายการ
                </span>
              </div>

              {loadingOrders ? (
                <div className="flex justify-center py-8">
                  <div className="w-5 h-5 rounded-full border-2 border-[#F3DDD0] border-t-[#E8530A] spinner" />
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8 text-[#9A6651] text-sm">
                  <p className="text-3xl mb-2">🍽️</p>
                  ยังไม่มีประวัติการสั่งอาหาร
                </div>
              ) : (
                <div className="space-y-1">
                  {recentOrders.map((order, i) => {
                    const meta = STATUS_META[order.status] ?? STATUS_META['done'];
                    return (
                      <div
                        key={order.id}
                        className="order-row flex items-center gap-3 px-3 py-2.5 row-slide"
                        style={{ animationDelay: `${0.1 + i * 0.07}s` }}
                      >
                        <div className="w-9 h-9 rounded-xl bg-[#FFF3EB] flex items-center justify-center text-xs font-bold text-[#C0502B] shrink-0">
                          #{order.id}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#3D1A00] font-medium truncate">
                            {order.items.map(i => i.name).join(', ')}
                          </p>
                          <p className="text-xs text-[#9A6651]">{timeAgo(order.createdAt)}</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${meta.bg} ${meta.text}`}>
                          {meta.label}
                        </span>
                        <span className="text-sm font-semibold text-[#3D1A00] shrink-0">
                          ฿{order.total.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── ROW 2: Favorites + Settings ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* FAVORITE — คำนวณจาก orders จริง */}
            <div className={`bg-white rounded-2xl p-6 border border-[#F3DDD0] card-hover ${mounted ? 'slide-up d-4' : 'opacity-0'}`}>
              <h3 className="text-xs font-bold text-[#7C3A10] uppercase tracking-widest mb-4">
                ❤️ เมนูโปรด
              </h3>

              {loadingOrders ? (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 rounded-full border-2 border-[#F3DDD0] border-t-[#E8530A] spinner" />
                </div>
              ) : favorites.length === 0 ? (
                <div className="text-center py-6 text-[#9A6651] text-sm">
                  <p className="text-2xl mb-2">🤍</p>
                  สั่งอาหารเพื่อดูเมนูโปรดของคุณ
                </div>
              ) : (
                <div className="space-y-2">
                  {favorites.map((fav, i) => (
                    <div
                      key={fav.name}
                      className="fav-row flex items-center justify-between px-3 py-3 row-slide"
                      style={{ animationDelay: `${0.1 + i * 0.08}s` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FFF3EB] flex items-center justify-center text-xl float-y shrink-0"
                          style={{ animationDelay: `${i * 0.3}s` }}>
                          {menuIcon(fav.name)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#3D1A00]">{fav.name}</p>
                          <p className="text-xs text-[#9A6651]">สั่ง {fav.count} ครั้ง · ฿{fav.price}</p>
                        </div>
                      </div>
                      {i === 0 && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold shrink-0">
                          #1 โปรด
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SETTINGS */}
            <div className={`bg-white rounded-2xl p-6 border border-[#F3DDD0] card-hover ${mounted ? 'slide-up d-5' : 'opacity-0'}`}>
              <h3 className="text-xs font-bold text-[#7C3A10] uppercase tracking-widest mb-4">
                ⚙️ ตั้งค่า
              </h3>
              <div className="space-y-0.5">
                <div
                  onClick={openEditModal}
                  className="settings-row flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-[#3D1A00] hover:bg-[#FFF3EB] hover:text-[#E8530A] cursor-pointer"
                >
                  แก้ไขโปรไฟล์
                  <span className="text-xs opacity-30">›</span>
                </div>
                <div
                  onClick={() => setShowPasswordModal(true)}
                  className="settings-row flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-[#3D1A00] hover:bg-[#FFF3EB] hover:text-[#E8530A] cursor-pointer"
                >
                  เปลี่ยนรหัสผ่าน
                  <span className="text-xs opacity-30">›</span>
                </div>
                <div
                  onClick={handleLogout}
                  className="settings-row flex items-center px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 cursor-pointer"
                >
                  ออกจากระบบ
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT PROFILE MODAL ── */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-bg">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-auto modal-box">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[#3D1A00]">แก้ไขโปรไฟล์</h3>
              <button onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 transition-colors">✕</button>
            </div>

            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white select-none"
                style={{ background: 'linear-gradient(135deg,#3D1A00,#C0502B)' }}>
                {editName.charAt(0)?.toUpperCase() || '?'}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#7C3A10] mb-1">ชื่อ</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#F3DDD0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8530A] text-sm"
                  placeholder="ชื่อของคุณ" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#7C3A10] mb-1">อีเมล</label>
                <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#F3DDD0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8530A] text-sm"
                  placeholder="อีเมลของคุณ" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2.5 text-[#7C3A10] border border-[#F3DDD0] rounded-xl hover:bg-[#FFF3EB] transition-colors text-sm">
                ยกเลิก
              </button>
              <button onClick={handleSaveProfile} disabled={isSavingProfile}
                className="flex-1 px-4 py-2.5 bg-[#E8530A] text-white rounded-xl hover:bg-[#C8440A] disabled:opacity-50 transition-colors text-sm font-semibold">
                {isSavingProfile ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CHANGE PASSWORD MODAL ── */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-bg">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-auto modal-box">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[#3D1A00]">เปลี่ยนรหัสผ่าน</h3>
              <button onClick={() => setShowPasswordModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 transition-colors">✕</button>
            </div>

            <div className="space-y-4">
              {[
                { label: 'รหัสผ่านปัจจุบัน', value: currentPassword, set: setCurrentPassword, show: showCurrent, toggle: () => setShowCurrent(v => !v) },
                { label: 'รหัสผ่านใหม่',      value: newPassword,     set: setNewPassword,     show: showNew,     toggle: () => setShowNew(v => !v) },
                { label: 'ยืนยันรหัสผ่านใหม่', value: confirmPassword, set: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm(v => !v) },
              ].map(({ label, value, set, show, toggle }) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-[#7C3A10] mb-1">{label}</label>
                  <div className="relative">
                    <input type={show ? 'text' : 'password'} value={value} onChange={e => set(e.target.value)}
                      className="w-full px-3 py-2.5 pr-10 border border-[#F3DDD0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8530A] text-sm"
                      placeholder={`กรอก${label}`} />
                    <button type="button" onClick={toggle}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A6651] hover:text-[#E8530A] transition-colors text-xs">
                      {show ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* password strength */}
            {newPassword && (
              <div className="mt-3">
                <div className="flex gap-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                      newPassword.length >= i * 2
                        ? newPassword.length < 6 ? 'bg-red-400' : newPassword.length < 10 ? 'bg-amber-400' : 'bg-emerald-400'
                        : 'bg-zinc-100'}`} />
                  ))}
                </div>
                <p className="text-xs text-[#9A6651] mt-1">
                  {newPassword.length < 6 ? 'รหัสผ่านอ่อนเกินไป' : newPassword.length < 10 ? 'รหัสผ่านพอใช้' : 'รหัสผ่านแข็งแกร่ง 💪'}
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2.5 text-[#7C3A10] border border-[#F3DDD0] rounded-xl hover:bg-[#FFF3EB] transition-colors text-sm">
                ยกเลิก
              </button>
              <button onClick={handleChangePassword} disabled={isChangingPassword}
                className="flex-1 px-4 py-2.5 bg-[#E8530A] text-white rounded-xl hover:bg-[#C8440A] disabled:opacity-50 transition-colors text-sm font-semibold">
                {isChangingPassword ? 'กำลังเปลี่ยน...' : 'เปลี่ยนรหัสผ่าน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}