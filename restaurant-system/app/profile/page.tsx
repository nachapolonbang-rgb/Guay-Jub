'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/src/backend/components/Navbar';

export default function MemberPage() {
  const [pts, setPts] = useState(2450);
  const [toast, setToast] = useState('');
  const [redeemedItems, setRedeemedItems] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const [progWidth, setProgWidth] = useState(0);

  // สำหรับเปลี่ยนรหัสผ่าน
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      const pct = Math.max(0, Math.min(((2450 - 2000) / 2000) * 100, 100));
      setProgWidth(pct);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const pct = Math.max(0, Math.min(((pts - 2000) / 2000) * 100, 100));
    setProgWidth(pct);
  }, [pts]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('รหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }

    if (newPassword.length < 8) {
      showToast('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch('/api/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('เปลี่ยนรหัสผ่านสำเร็จ!');
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(data.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const redeem = (cost: number, name: string) => {
    if (pts < cost) { showToast(`แต้มไม่พอ (${cost} pts)`); return; }
    setPts(prev => prev - cost);
    setRedeemedItems(prev => new Set([...prev, name]));
    showToast(`แลก ${name} สำเร็จ! 🎉`);
    setTimeout(() => {
      setRedeemedItems(prev => { const n = new Set(prev); n.delete(name); return n; });
    }, 2500);
  };

  const ptsToNext = 4000 - pts;

  return (
    <div className="min-h-screen bg-[#FFF8F2] relative overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap');
        * { font-family: 'Sarabun', sans-serif; }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.5; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-10px) scale(0.95); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0)     scale(1); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes countUp {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }

        .slide-down  { animation: slideDown  0.5s ease both; }
        .slide-up    { animation: slideUp    0.5s ease both; }
        .slide-right { animation: slideRight 0.5s ease both; }
        .fade-in     { animation: fadeIn     0.4s ease both; }
        .float-y     { animation: floatY     3s ease-in-out infinite; }
        .count-up    { animation: countUp    0.5s ease both; }

        .d-1 { animation-delay: 0.1s; }
        .d-2 { animation-delay: 0.2s; }
        .d-3 { animation-delay: 0.3s; }
        .d-4 { animation-delay: 0.4s; }
        .d-5 { animation-delay: 0.5s; }

        .pulse-ring::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.4);
          animation: pulse-ring 2s ease-out infinite;
        }

        .shimmer-btn {
          background-size: 200% auto;
          background-image: linear-gradient(90deg, #C0392B 0%, #E85A3A 40%, #C0392B 100%);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .shimmer-btn:hover {
          animation: shimmer 1.2s linear infinite;
          transform: scale(1.06);
          box-shadow: 0 4px 16px rgba(192,57,43,0.35);
        }
        .shimmer-btn:active { transform: scale(0.95); }

        .card-hover {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .card-hover:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(61,26,0,0.1);
        }

        .settings-row {
          transition: background 0.15s, color 0.15s, padding-left 0.2s;
        }
        .settings-row:hover { padding-left: 18px !important; }

        .reward-row {
          transition: background 0.2s;
        }
        .reward-row:hover { background: #FFF8F4; border-radius: 12px; }
      `}</style>

      <Navbar />

      {/* TOAST */}
      {toast && (
        <div
          className="fixed top-5 left-1/2 z-50 bg-[#3D1A00] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-xl"
          style={{ animation: 'toastIn 0.3s ease both', transform: 'translateX(-50%)' }}
        >
          {toast}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-5 py-6">

        {/* ── TOP ROW: Profile (left) + Rewards (right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">

          {/* PROFILE — 2/5 */}
          <div
            className={`lg:col-span-2 rounded-2xl p-6 text-white relative overflow-hidden card-hover ${mounted ? 'slide-right' : 'opacity-0'}`}
            style={{ background: 'linear-gradient(135deg, #3D1A00 0%, #7C3A10 55%, #C0502B 100%)' }}
          >
            <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute -bottom-10 left-1/4 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

            <div className={`flex items-center gap-4 mb-6 relative z-10 ${mounted ? 'fade-in d-2' : 'opacity-0'}`}>
              <div className="relative pulse-ring float-y flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-white/15 border-2 border-white/35 flex items-center justify-center text-2xl font-bold select-none">
                  N
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold">Nat</h2>
                <p className="text-sm text-white/55">nat@email.com</p>
                <span className="inline-flex items-center gap-1 mt-2 bg-amber-100 text-amber-700 px-3 py-0.5 rounded-full text-xs font-bold">
                  ★ Gold Member
                </span>
              </div>
            </div>

            <div className={`relative z-10 ${mounted ? 'slide-up d-3' : 'opacity-0'}`}>
              <div className="flex items-baseline gap-2 mb-3">
                <span key={pts} className="text-5xl font-bold tracking-tight count-up">
                  {pts.toLocaleString()}
                </span>
                <span className="text-base text-white/55">pts</span>
              </div>
              <div className="h-2 bg-white/15 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${progWidth}%`,
                    background: 'linear-gradient(90deg,#FBBF24,#F97316)',
                    transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
                  }}
                />
              </div>
              <p className="text-xs text-white/50 mt-1.5">
                อีก {ptsToNext.toLocaleString()} pts จะเป็น Platinum
              </p>
            </div>
          </div>

          {/* REWARDS — 3/5 */}
          <div className={`lg:col-span-3 bg-white rounded-2xl p-6 border border-[#F3DDD0] card-hover ${mounted ? 'slide-down d-1' : 'opacity-0'}`}>
            <h3 className="text-xs font-bold text-[#7C3A10] uppercase tracking-widest mb-3">
              🎁 แลกรางวัล
            </h3>
            <div>
              {[
                { name: 'ส่วนลด 50฿',   cost: 500, icon: '🏷️' },
                { name: 'ฟรีเครื่องดื่ม', cost: 300, icon: '🥤' },
                { name: 'ข้าวฟรี',       cost: 150, icon: '🍚' },
              ].map(({ name, cost, icon }, i) => (
                <Reward
                  key={name}
                  name={name}
                  cost={cost}
                  icon={icon}
                  pts={pts}
                  redeemed={redeemedItems.has(name)}
                  redeem={redeem}
                  delay={i * 80}
                  mounted={mounted}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── BOTTOM ROW: Favorite + Settings ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* FAVORITE */}
          <div className={`bg-white rounded-2xl p-6 border border-[#F3DDD0] card-hover ${mounted ? 'slide-up d-4' : 'opacity-0'}`}>
            <h3 className="text-xs font-bold text-[#7C3A10] uppercase tracking-widest mb-4">
              ❤️ เมนูโปรด
            </h3>
            <div
              className="flex items-center justify-between bg-[#FFF3EB] rounded-xl p-4 transition-shadow duration-200 hover:shadow-[0_4px_16px_rgba(232,83,10,0.15)]"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl float-y inline-block">🍖</span>
                <div>
                  <p className="text-sm font-semibold text-[#3D1A00]">ข้าวขาหมู</p>
                  <p className="text-xs text-[#9A6651] mt-0.5">เมนูขายดี</p>
                </div>
              </div>
              <button
                onClick={() => showToast('เพิ่มลงตะกร้าแล้ว!')}
                className="bg-[#E8530A] hover:bg-[#C8440A] active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all hover:shadow-[0_4px_14px_rgba(232,83,10,0.4)] hover:scale-105"
              >
                สั่งอีก
              </button>
            </div>
          </div>

          {/* SETTINGS */}
          <div className={`bg-white rounded-2xl p-6 border border-[#F3DDD0] card-hover ${mounted ? 'slide-up d-5' : 'opacity-0'}`}>
            <h3 className="text-xs font-bold text-[#7C3A10] uppercase tracking-widest mb-4">
              ⚙️ ตั้งค่า
            </h3>
            <div className="space-y-0.5">
              <div
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
              <div className="settings-row flex items-center px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 cursor-pointer">
                ออกจากระบบ
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── PASSWORD CHANGE MODAL ── */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-auto">
            <h3 className="text-lg font-bold text-[#3D1A00] mb-4">เปลี่ยนรหัสผ่าน</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#7C3A10] mb-1">
                  รหัสผ่านปัจจุบัน
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-[#F3DDD0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8530A] focus:border-transparent"
                  placeholder="กรอกรหัสผ่านปัจจุบัน"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#7C3A10] mb-1">
                  รหัสผ่านใหม่
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-[#F3DDD0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8530A] focus:border-transparent"
                  placeholder="กรอกรหัสผ่านใหม่"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#7C3A10] mb-1">
                  ยืนยันรหัสผ่านใหม่
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-[#F3DDD0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8530A] focus:border-transparent"
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2 text-[#7C3A10] border border-[#F3DDD0] rounded-xl hover:bg-[#FFF3EB] transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                className="flex-1 px-4 py-2 bg-[#E8530A] text-white rounded-xl hover:bg-[#C8440A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isChangingPassword ? 'กำลังเปลี่ยน...' : 'เปลี่ยนรหัสผ่าน'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* ── REWARD COMPONENT ── */
function Reward({
  name, cost, icon, pts, redeemed, redeem, delay, mounted,
}: {
  name: string; cost: number; icon: string;
  pts: number; redeemed: boolean;
  redeem: (cost: number, name: string) => void;
  delay: number; mounted: boolean;
}) {
  const canAfford = pts >= cost;

  return (
    <div
      className={`reward-row flex items-center justify-between px-3 py-3.5 border-b border-[#FFF0E6] last:border-none ${mounted ? 'fade-in' : 'opacity-0'}`}
      style={{ animationDelay: `${0.35 + delay / 1000}s` }}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <div>
          <p className="text-sm font-semibold text-[#3D1A00]">{name}</p>
          <p className="text-xs text-[#9A6651] mt-0.5">{cost.toLocaleString()} pts</p>
        </div>
      </div>

      <button
        onClick={() => redeem(cost, name)}
        disabled={redeemed || !canAfford}
        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95
          ${redeemed
            ? 'bg-green-100 text-green-600 cursor-default'
            : canAfford
              ? 'shimmer-btn text-white'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
      >
        {redeemed ? '✓ แลกแล้ว' : 'แลก'}
      </button>
    </div>
  );
}