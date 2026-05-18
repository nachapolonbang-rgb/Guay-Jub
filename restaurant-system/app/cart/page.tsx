'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/src/backend/components/Navbar';
import { useCart } from '@/src/backend/context/CartContext';

const DISCOUNT_CODES: Record<string, number> = {
  SAVE10: 10,
  FOOD20: 20,
  VIP50: 50,
};

function validatePhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return 'กรุณาใส่เบอร์โทรศัพท์';
  if (digits.length !== 10) return `เบอร์โทรต้องครบ 10 หลัก (ใส่มา ${digits.length} หลัก)`;
  if (!digits.startsWith('0')) return 'เบอร์โทรต้องขึ้นต้นด้วย 0';
  return '';
}

export default function CartPage() {
  const router = useRouter();
  const { cart, increase, decrease } = useCart();

  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  // ✅ เปลี่ยนจาก number | null → string | null เพื่อรับ cartKey
  const [removingKey, setRemovingKey] = useState<string | null>(null);
  const [codeApplied, setCodeApplied] = useState(false);

  const [guestName, setGuestName]   = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [orderType, setOrderType]   = useState<'dine-in' | 'takeaway'>('dine-in');

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  // ✅ รับ cartKey (string) แทน id (number)
  const handleDecrease = (cartKey: string) => {
    const item = cart.find(i => i.cartKey === cartKey);
    if (item && item.qty === 1) {
      setRemovingKey(cartKey);
      setTimeout(() => {
        decrease(cartKey);
        setRemovingKey(null);
      }, 300);
    } else {
      decrease(cartKey);
    }
  };

  const subtotal  = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const total     = Math.max(subtotal - discount, 0);
  const itemCount = cart.reduce((sum, i) => sum + i.qty, 0);

  const applyCode = () => {
    const value = DISCOUNT_CODES[code.toUpperCase()];
    if (!value) { setError('โค้ดไม่ถูกต้อง'); setDiscount(0); setCodeApplied(false); return; }
    setError(''); setDiscount(value); setCodeApplied(true);
  };

  const handlePhoneChange = (v: string) => {
    const cleaned = v.replace(/[^\d\-\s]/g, '');
    setGuestPhone(cleaned);
    const currentDigits = cleaned.replace(/\D/g, '');
    if (currentDigits.length === 10 && currentDigits.startsWith('0')) {
      setPhoneError('');
    } else if (phoneError) {
      setPhoneError(validatePhone(cleaned));
    }
  };

  const handlePay = () => {
    const pErr = validatePhone(guestPhone);
    if (pErr) { setPhoneError(pErr); return; }
    setPhoneError('');
    localStorage.setItem('guestName',  guestName.trim());
    localStorage.setItem('guestPhone', guestPhone.replace(/\D/g, ''));
    localStorage.setItem('orderType',  orderType);
    localStorage.setItem('subtotal',   String(subtotal));
    localStorage.setItem('discount',   String(discount));
    localStorage.setItem('total',      String(total));
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-[#FFF8F2] relative overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700;800&display=swap');
        * { font-family: 'Sarabun', sans-serif; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: scale(1); max-height: 120px; }
          to   { opacity: 0; transform: scale(0.95); max-height: 0; padding: 0; margin: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-6px); }
          40%     { transform: translateX(6px); }
          60%     { transform: translateX(-4px); }
          80%     { transform: translateX(4px); }
        }
        @keyframes popIn {
          from { transform: scale(0.8); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes shimmerPay {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        .slide-up    { animation: slideUp    0.45s ease both; }
        .slide-right { animation: slideRight 0.45s ease both; }
        .slide-left  { animation: slideLeft  0.45s ease both; }
        .fade-in     { animation: fadeIn     0.3s ease both; }
        .pop-in      { animation: popIn      0.3s cubic-bezier(0.34,1.56,0.64,1) both; }
        .removing    { animation: fadeOut    0.3s ease forwards; overflow: hidden; }
        .shake       { animation: shake      0.4s ease; }

        .d-1 { animation-delay: 0.05s; }
        .d-2 { animation-delay: 0.12s; }
        .d-3 { animation-delay: 0.19s; }
        .d-4 { animation-delay: 0.26s; }
        .d-5 { animation-delay: 0.33s; }

        .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(61,26,0,0.09); }

        .qty-btn {
          width: 30px; height: 30px; border-radius: 50%; border: none;
          font-size: 16px; font-weight: 700; cursor: pointer;
          transition: transform 0.15s, background 0.15s;
          display: flex; align-items: center; justify-content: center; line-height: 1;
        }
        .qty-btn:active { transform: scale(0.88); }

        .pay-btn {
          background-size: 200% auto;
          background-image: linear-gradient(90deg, #3D1A00 0%, #7C3A10 40%, #3D1A00 100%);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .pay-btn:hover {
          animation: shimmerPay 1.5s linear infinite;
          transform: scale(1.02);
          box-shadow: 0 6px 20px rgba(61,26,0,0.35);
        }
        .pay-btn:active { transform: scale(0.97); }
        .pay-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; animation: none; }

        .code-input:focus, .guest-input:focus {
          border-color: #E8530A;
          box-shadow: 0 0 0 3px rgba(232,83,10,0.12);
          outline: none;
        }
        .phone-ok { border-color: #10B981 !important; }

        .summary-card { position: sticky; top: 24px; }
        .item-img { transition: transform 0.3s ease; }
        .card-hover:hover .item-img { transform: scale(1.05); }
        .type-btn { transition: all 0.2s ease; }
        .type-btn:active { transform: scale(0.96); }
        .history-btn { transition: all 0.2s ease; }
        .history-btn:hover { border-color: #E8530A; color: #E8530A; }

        .phone-hint {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 4px;
        }
        .digit-counter {
          font-size: 10px; font-weight: 700; padding: 2px 6px;
          border-radius: 999px; transition: all .2s;
        }
      `}</style>

      <Navbar />

      <div className="max-w-5xl mx-auto px-5 py-8">

        {/* HEADER */}
        <div className={`flex items-center justify-between mb-7 ${mounted ? 'slide-right' : 'opacity-0'}`}>
          <div>
            <h1 className="text-2xl font-extrabold text-[#3D1A00]">ตะกร้าของคุณ</h1>
            {cart.length > 0 && <p className="text-sm text-[#9A6651] mt-0.5">{itemCount} รายการ</p>}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/orders')}
              className="history-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#F3DDD0] bg-white text-[#7C3A10] text-xs font-semibold"
            >
              📦 ประวัติการสั่งซื้อ
            </button>
            {cart.length > 0 && (
              <span className="bg-[#3D1A00] text-white text-xs font-bold px-3 py-1 rounded-full pop-in">
                🛒 {itemCount}
              </span>
            )}
          </div>
        </div>

        {cart.length === 0 ? (
          <div className={`text-center py-24 ${mounted ? 'fade-in' : 'opacity-0'}`}>
            <div className="text-5xl mb-4">🛒</div>
            <p className="text-[#9A6651] text-base font-medium">ยังไม่มีสินค้าในตะกร้า</p>
            <p className="text-[#C4A99A] text-sm mt-1">เพิ่มเมนูที่ชอบได้เลย!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">

            {/* LEFT: CART ITEMS */}
            <div className="md:col-span-2 space-y-3">
              {cart.map((item, i) => (
                <div
                  // ✅ ใช้ cartKey แทน id — unique เสมอแม้สั่งเมนูเดิมต่าง customization
                  key={item.cartKey}
                  className={`bg-white rounded-2xl border border-[#F3DDD0] card-hover overflow-hidden
                    ${removingKey === item.cartKey ? 'removing' : mounted ? `slide-up d-${Math.min(i + 1, 5) as 1|2|3|4|5}` : 'opacity-0'}`}
                >
                  <div className="flex items-center justify-between p-4 gap-3">
                    <div className="w-18 h-18 rounded-xl overflow-hidden flex-shrink-0 bg-orange-50" style={{ width: 72, height: 72 }}>
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover item-img" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#3D1A00] text-sm truncate">{item.name}</h3>
                      <p className="text-[#E8530A] font-bold text-sm mt-0.5">฿{item.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* ✅ ส่ง cartKey เข้า handleDecrease */}
                      <button
                        onClick={() => handleDecrease(item.cartKey)}
                        className="qty-btn"
                        style={{ background: item.qty === 1 ? '#FEE2E2' : '#F3F4F6', color: item.qty === 1 ? '#EF4444' : '#374151' }}
                      >
                        {item.qty === 1 ? '🗑' : '−'}
                      </button>
                      <span key={item.qty} className="font-bold text-[#3D1A00] text-sm w-6 text-center pop-in">{item.qty}</span>
                      {/* ✅ ส่ง cartKey เข้า increase */}
                      <button onClick={() => increase(item.cartKey)} className="qty-btn" style={{ background: '#FFF3EB', color: '#E8530A' }}>+</button>
                    </div>
                    <div className="text-right flex-shrink-0 w-16">
                      <p className="font-bold text-[#3D1A00] text-sm">฿{(item.price * item.qty).toLocaleString()}</p>
                      {item.qty > 1 && <p className="text-xs text-[#C4A99A]">x{item.qty}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT: SUMMARY */}
            <div className={`summary-card ${mounted ? 'slide-left d-2' : 'opacity-0'}`}>
              <div className="bg-white rounded-2xl border border-[#F3DDD0] p-5">

                <h2 className="text-xs font-bold text-[#7C3A10] uppercase tracking-widest mb-4">
                  📋 สรุปคำสั่งซื้อ
                </h2>

                {/* DISCOUNT CODE */}
                <div className="mb-5">
                  <label className="text-xs font-semibold text-[#9A6651] mb-1.5 block">โค้ดส่วนลด</label>
                  <div className="flex gap-2">
                    <input
                      value={code}
                      onChange={e => { setCode(e.target.value); setError(''); }}
                      onKeyDown={e => e.key === 'Enter' && applyCode()}
                      placeholder="SAVE10 / FOOD20 / VIP50"
                      className={`code-input flex-1 px-3 py-2 rounded-xl border text-sm transition-all text-[#3D1A00] bg-[#FFFAF7]
                        ${error ? 'border-red-300' : codeApplied ? 'border-green-400' : 'border-[#F3DDD0]'}`}
                    />
                    <button onClick={applyCode} className="bg-[#E8530A] hover:bg-[#C8440A] active:scale-95 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all">ใช้</button>
                  </div>
                  {error && <p className="text-red-500 text-xs mt-1.5 shake">{error}</p>}
                  {codeApplied && discount > 0 && <p className="text-green-600 text-xs mt-1.5 pop-in">✓ ประหยัดได้ ฿{discount}</p>}
                </div>

                {/* PRICE BREAKDOWN */}
                <div className="space-y-2.5 text-sm border-t border-[#FFF0E6] pt-4">
                  <div className="flex justify-between text-[#9A6651]">
                    <span>ยอดรวม ({itemCount} รายการ)</span>
                    <span>฿{subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 pop-in">
                      <span>ส่วนลด</span><span>− ฿{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline pt-2 border-t border-[#FFF0E6] mt-1">
                    <span className="font-bold text-[#3D1A00]">สุทธิ</span>
                    <span key={total} className="text-xl font-extrabold text-[#E8530A]">฿{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* GUEST FORM */}
                <div className="mt-5 space-y-3 border-t border-[#FFF0E6] pt-4">
                  <h3 className="text-xs font-bold text-[#7C3A10] uppercase tracking-widest">
                    📝 ข้อมูลผู้สั่ง
                  </h3>

                  {/* Order Type */}
                  <div className="flex gap-2">
                    {(['dine-in', 'takeaway'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setOrderType(type)}
                        className={`type-btn flex-1 py-2 rounded-xl text-xs font-bold border
                          ${orderType === type ? 'bg-[#3D1A00] text-white border-[#3D1A00]' : 'bg-white text-[#9A6651] border-[#F3DDD0] hover:border-[#E8530A]'}`}
                      >
                        {type === 'dine-in' ? '🍽 นั่งกินที่ร้าน' : '🥡 Take Away'}
                      </button>
                    ))}
                  </div>

                  {/* ชื่อ — ไม่บังคับ */}
                  <div>
                    <input
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                      placeholder="ชื่อของคุณ (ไม่บังคับ)"
                      className="guest-input w-full px-3 py-2 rounded-xl border border-[#F3DDD0] text-sm bg-[#FFFAF7] text-[#3D1A00] transition-all"
                    />
                  </div>

                  {/* เบอร์โทร — บังคับครบ 10 หลัก */}
                  <div>
                    {(() => {
                      const digits = guestPhone.replace(/\D/g, '');
                      const count  = digits.length;
                      const isOk   = count === 10 && digits.startsWith('0');
                      return (
                        <>
                          <input
                            value={guestPhone}
                            onChange={e => handlePhoneChange(e.target.value)}
                            onBlur={() => setPhoneError(validatePhone(guestPhone))}
                            placeholder="เบอร์โทรศัพท์ *"
                            type="tel"
                            maxLength={13}
                            className={`guest-input w-full px-3 py-2 rounded-xl border text-sm bg-[#FFFAF7] text-[#3D1A00] transition-all
                              ${phoneError ? 'border-red-300' : isOk ? 'phone-ok border-[#10B981]' : 'border-[#F3DDD0]'}`}
                          />
                          <div className="phone-hint">
                            {phoneError
                              ? <p className="text-red-500 text-xs shake">{phoneError}</p>
                              : isOk
                                ? <p className="text-emerald-600 text-xs">✓ เบอร์โทรถูกต้อง</p>
                                : <p className="text-[#C4A99A] text-xs">ต้องการ 10 หลัก ขึ้นต้นด้วย 0</p>
                            }
                            <span
                              className="digit-counter"
                              style={{
                                background: isOk ? '#D1FAE5' : count > 0 ? '#FEF3C7' : '#F5F5F5',
                                color:      isOk ? '#065F46' : count > 0 ? '#B45309' : '#9CA3AF',
                              }}
                            >
                              {count}/10
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* PAY BUTTON */}
                <button
                  onClick={handlePay}
                  disabled={guestPhone.replace(/\D/g, '').length !== 10 || phoneError !== ''}
                  className="pay-btn w-full mt-5 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                >
                  💳 ชำระเงิน →
                </button>

                <button
                  onClick={() => router.push('/orders')}
                  className="history-btn w-full mt-2 py-2.5 rounded-xl border border-[#F3DDD0] text-[#9A6651] text-xs font-semibold"
                >
                  📦 ดูประวัติการสั่งซื้อ
                </button>

                <div className="flex justify-center gap-4 mt-3">
                  {['🔒 ปลอดภัย', '⚡ รวดเร็ว', '✅ ครบถ้วน'].map(b => (
                    <span key={b} className="text-xs text-[#C4A99A]">{b}</span>
                  ))}
                </div>

              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}