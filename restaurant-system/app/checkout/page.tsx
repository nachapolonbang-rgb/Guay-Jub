'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/src/backend/components/Navbar';
import { useCart } from '@/src/backend/context/CartContext';

type CartItem = { id: number; name: string; price: number; image: string; qty: number };
type PayMethod = 'cash' | 'qr';

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('dine-in');
  const [discount, setDiscount] = useState(0);
  const [mounted, setMounted] = useState(false);

  const [method, setMethod] = useState<PayMethod>('cash');
  const [cashInput, setCashInput] = useState('');
  const [qrConfirmed, setQrConfirmed] = useState(false);

  const [paying, setPaying] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const [done, setDone] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const { clearCart } = useCart();

  // ดึงข้อมูลจาก localStorage ที่ cart เซฟไว้
  useEffect(() => {
    const cartData = localStorage.getItem('cart');
    if (cartData) setCart(JSON.parse(cartData));

    setGuestName(localStorage.getItem('guestName') || '');
    setGuestPhone(localStorage.getItem('guestPhone') || '');
    setOrderType((localStorage.getItem('orderType') as 'dine-in' | 'takeaway') || 'dine-in');
    setDiscount(Number(localStorage.getItem('discount') || 0));

    setTimeout(() => setMounted(true), 50);
  }, []);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const total = Math.max(subtotal - discount, 0);
  const cashNum = parseFloat(cashInput) || 0;
  const change = cashNum - total;

  const PRESETS = Array.from(new Set([
    total,
    Math.ceil(total / 20) * 20,
    Math.ceil(total / 50) * 50,
    Math.ceil(total / 100) * 100,
  ])).filter(v => v >= total).sort((a, b) => a - b).slice(0, 4);

  async function handleConfirm() {
    if (method === 'cash' && cashNum < total) {
      setFieldError('จำนวนเงินไม่เพียงพอ');
      return;
    }
    if (method === 'qr' && !qrConfirmed) {
      setFieldError('กรุณายืนยันการโอนเงินก่อน');
      return;
    }
    setFieldError('');
    setPaying(true);

    try {
      // POST ไป /api/orders → บันทึกลง DB จริง
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName,
          guestPhone,
          orderType,
          items: cart.map(i => ({ name: i.name, price: i.price, qty: i.qty })),
          total,
          paymentMethod: method,
          paymentStatus: 'paid',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'เกิดข้อผิดพลาด');
      }

      const created = await res.json();

      // ล้างข้อมูลทั้ง localStorage และ cart context
      localStorage.removeItem('cart');
      localStorage.removeItem('guestName');
      localStorage.removeItem('guestPhone');
      localStorage.removeItem('orderType');
      localStorage.removeItem('discount');
      clearCart();
      setCart([]);

      setOrderId(created.id);
      setDone(true);

    } catch (err: any) {
      setFieldError(err.message || 'บันทึกออร์เดอร์ไม่สำเร็จ');
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF8F2]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700;800&display=swap');
        * { font-family: 'Sarabun', sans-serif; }

        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn   { from{transform:scale(0.8);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes successPop {
          0%  {transform:scale(0.5);opacity:0}
          60% {transform:scale(1.2);opacity:1}
          100%{transform:scale(1);opacity:1}
        }

        .fade-up  { animation: fadeUp  0.4s ease both }
        .pop-in   { animation: popIn   0.3s cubic-bezier(.34,1.56,.64,1) both }
        .slide-in { animation: slideIn 0.3s ease both }
        .d1{animation-delay:.05s} .d2{animation-delay:.1s}

        .method-card { transition:all .2s; cursor:pointer }
        .method-card:hover { transform:translateY(-2px) }
        .method-card.active { box-shadow:0 0 0 2.5px #E8530A,0 8px 24px rgba(232,83,10,.15) }

        .preset-btn { transition:all .15s }
        .preset-btn:hover { background:#FFF3EB; border-color:#E8530A; color:#E8530A }
        .preset-btn:active { transform:scale(.94) }

        .pay-btn { background:linear-gradient(135deg,#3D1A00,#7C3A10); transition:all .2s }
        .pay-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 24px rgba(61,26,0,.35) }
        .pay-btn:disabled { opacity:.6; cursor:not-allowed }

        .input-field { outline:none; transition:all .2s }
        .input-field:focus { border-color:#E8530A; box-shadow:0 0 0 3px rgba(232,83,10,.1) }

        .qr-frame { border:3px dashed #F3DDD0; border-radius:20px; transition:border-color .3s }
        .qr-frame.confirmed { border-color:#22c55e; border-style:solid }
      `}</style>

      <Navbar />

      <div className="max-w-4xl mx-auto px-5 py-8">

        {/* SUCCESS */}
        {done ? (
          <div className="text-center py-20 fade-up">
            <div className="text-6xl mb-4" style={{animation:'successPop .6s cubic-bezier(.34,1.56,.64,1) both'}}>
              {method === 'qr' ? '📲' : '💵'}
            </div>
            <h2 className="text-2xl font-extrabold text-[#3D1A00] mt-2">ชำระเงินสำเร็จ!</h2>
            <p className="text-[#9A6651] text-sm mt-2">
              ออร์เดอร์ <span className="font-bold text-[#E8530A]">#{String(orderId).padStart(3,'0')}</span> ถูกบันทึกลงระบบแล้ว
            </p>
            {method === 'cash' && change >= 0 && (
              <div className="mt-4 inline-block bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-3">
                <p className="text-xs text-emerald-600 font-medium">เงินทอน</p>
                <p className="text-2xl font-extrabold text-emerald-700">฿{change.toLocaleString()}</p>
              </div>
            )}
            <div className="flex gap-3 justify-center mt-8 flex-wrap">
              <button
                onClick={() => router.push(`/ordertracking?id=${orderId}`)}
                className="bg-[#E8530A] hover:bg-[#C8440A] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all"
              >
                🔍 ติดตามออร์เดอร์
              </button>
              <button
                onClick={() => router.push('/menu')}
                className="border border-[#F3DDD0] hover:border-[#E8530A] text-[#9A6651] hover:text-[#E8530A] px-6 py-3 rounded-xl font-bold text-sm transition-all"
              >
                สั่งอีกครั้ง
              </button>
            </div>
          </div>

        ) : (
          <>
            <div className={`mb-7 ${mounted ? 'fade-up' : 'opacity-0'}`}>
              <button onClick={() => router.back()} className="text-sm text-[#9A6651] hover:text-[#E8530A] mb-3 flex items-center gap-1 transition-colors">
                ← กลับ
              </button>
              <h1 className="text-2xl font-extrabold text-[#3D1A00]">ชำระเงิน</h1>
              <p className="text-sm text-[#9A6651] mt-0.5">
                {guestName} · {orderType === 'dine-in' ? '🍽 นั่งกินที่ร้าน' : '🥡 Take Away'}
              </p>
            </div>

            <div className="grid md:grid-cols-5 gap-6">

              {/* LEFT — สรุปออร์เดอร์ */}
              <div className="md:col-span-2">
                <div className={`bg-white rounded-2xl border border-[#F3DDD0] p-5 ${mounted ? 'fade-up d1' : 'opacity-0'}`}>
                  <h3 className="text-xs font-bold text-[#7C3A10] uppercase tracking-widest mb-3">📋 รายการสั่งซื้อ</h3>
                  <div className="space-y-2">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-[#3D1A00]">
                          {item.name} <span className="text-[#C4A99A]">×{item.qty}</span>
                        </span>
                        <span className="font-bold text-[#3D1A00]">฿{(item.price * item.qty).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 mt-2">
                      <span>ส่วนลด</span>
                      <span>− ฿{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-base border-t border-[#FFF0E6] mt-3 pt-3">
                    <span className="text-[#3D1A00]">รวมทั้งหมด</span>
                    <span className="text-[#E8530A]">฿{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* RIGHT — วิธีชำระเงิน */}
              <div className="md:col-span-3 space-y-4">

                <div className={`${mounted ? 'fade-up d2' : 'opacity-0'}`}>
                  <p className="text-xs font-bold text-[#7C3A10] uppercase tracking-widest mb-3">💳 วิธีชำระเงิน</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'cash', icon: '💵', label: 'เงินสด',   sub: 'จ่ายที่เคาน์เตอร์' },
                      { id: 'qr',   icon: '📱', label: 'QR Code', sub: 'PromptPay / พร้อมเพย์' },
                    ].map(m => (
                      <div
                        key={m.id}
                        onClick={() => { setMethod(m.id as PayMethod); setFieldError(''); }}
                        className={`method-card bg-white border-2 rounded-2xl p-4 select-none
                          ${method === m.id ? 'active border-[#E8530A]' : 'border-[#F3DDD0]'}`}
                      >
                        <div className="text-3xl mb-2">{m.icon}</div>
                        <p className="font-bold text-[#3D1A00] text-sm">{m.label}</p>
                        <p className="text-xs text-[#C4A99A] mt-0.5">{m.sub}</p>
                        <div className={`mt-2 w-4 h-4 rounded-full border-2 flex items-center justify-center
                          ${method === m.id ? 'border-[#E8530A] bg-[#E8530A]' : 'border-[#E5D5CC]'}`}>
                          {method === m.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CASH */}
                {method === 'cash' && (
                  <div className="bg-white rounded-2xl border border-[#F3DDD0] p-5 slide-in">
                    <p className="text-xs font-bold text-[#7C3A10] uppercase tracking-widest mb-4">รับเงินสด</p>
                    <div className="relative mb-4">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A6651] font-bold text-lg">฿</span>
                      <input
                        type="number"
                        value={cashInput}
                        onChange={e => { setCashInput(e.target.value); setFieldError(''); }}
                        placeholder="0"
                        className="input-field w-full pl-10 pr-4 py-3.5 rounded-xl border border-[#F3DDD0] text-xl font-extrabold text-[#3D1A00] bg-[#FFFAF7] text-right"
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2 mb-5">
                      {PRESETS.map(p => (
                        <button key={p} onClick={() => setCashInput(String(p))}
                          className={`preset-btn border rounded-xl py-2 text-sm font-bold
                            ${cashNum === p ? 'bg-[#FFF3EB] border-[#E8530A] text-[#E8530A]' : 'border-[#F3DDD0] text-[#9A6651] bg-white'}`}>
                          ฿{p.toLocaleString()}
                        </button>
                      ))}
                    </div>
                    <div className={`rounded-2xl p-4 flex justify-between items-center
                      ${cashNum >= total && cashNum > 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-[#FFF8F2] border border-[#F3DDD0]'}`}>
                      <div>
                        <p className="text-xs text-[#9A6651]">เงินทอน</p>
                        <p className={`text-2xl font-extrabold mt-0.5 ${cashNum >= total && cashNum > 0 ? 'text-emerald-600' : 'text-[#C4A99A]'}`}>
                          {cashNum >= total && cashNum > 0 ? `฿${change.toLocaleString()}` : '—'}
                        </p>
                      </div>
                      {cashNum >= total && cashNum > 0 && <div className="text-3xl pop-in">✅</div>}
                    </div>
                  </div>
                )}

                {/* QR */}
                {method === 'qr' && (
                  <div className="bg-white rounded-2xl border border-[#F3DDD0] p-5 slide-in">
                    <p className="text-xs font-bold text-[#7C3A10] uppercase tracking-widest mb-4">สแกน QR PromptPay</p>
                    <div className={`qr-frame p-4 flex flex-col items-center gap-3 mb-4 ${qrConfirmed ? 'confirmed' : ''}`}>
                      <div className="w-48 h-48 bg-[#FFFAF7] rounded-xl flex flex-col items-center justify-center gap-2 text-[#C4A99A]">
                        <div className="text-5xl">📱</div>
                        <p className="text-xs font-bold text-[#9A6651]">PromptPay</p>
                        <p className="text-xs">081-234-5678</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-[#9A6651]">โอนยอด</p>
                        <p className="text-2xl font-extrabold text-[#E8530A]">฿{total.toLocaleString()}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setQrConfirmed(v => !v); setFieldError(''); }}
                      className={`w-full py-3 rounded-xl font-bold text-sm border-2 transition-all
                        ${qrConfirmed ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-[#F3DDD0] text-[#9A6651] hover:border-[#E8530A] hover:text-[#E8530A]'}`}>
                      {qrConfirmed ? '✅ ยืนยันการโอนแล้ว' : '☑️ ฉันโอนเงินแล้ว'}
                    </button>
                  </div>
                )}

                {fieldError && (
                  <p className="text-red-500 text-sm font-medium px-1 pop-in">{fieldError}</p>
                )}

                {/* ปุ่มยืนยัน → POST /api/orders → บันทึก DB */}
                <button
                  onClick={handleConfirm}
                  disabled={paying || cart.length === 0}
                  className="pay-btn w-full py-4 rounded-2xl text-white font-extrabold text-base flex items-center justify-center gap-2"
                >
                  {paying ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full inline-block"
                        style={{animation:'spin .8s linear infinite'}} />
                      กำลังบันทึก...
                    </>
                  ) : (
                    `${method === 'cash' ? '💵' : '📲'} ยืนยันชำระเงิน ฿${total.toLocaleString()}`
                  )}
                </button>

              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}