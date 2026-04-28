'use client';

import { useState } from 'react';
import Navbar from '@/src/backend/components/Navbar';

type Promo = {
  id: number;
  title: string;
  code: string;
  discount: string;
  desc: string;
  expire: string;
  color: string;
};

const PROMOS: Promo[] = [
  {
    id: 1,
    title: 'ลดทันที 10 บาท',
    code: 'SAVE10',
    discount: '฿10',
    desc: 'สำหรับทุกเมนู ไม่มีขั้นต่ำ',
    expire: '31 ธ.ค. 2026',
    color: 'from-orange-400 to-red-400',
  },
  {
    id: 2,
    title: 'ลด 20 บาท',
    code: 'FOOD20',
    discount: '฿20',
    desc: 'เมื่อสั่งครบ 100 บาท',
    expire: '31 ธ.ค. 2026',
    color: 'from-yellow-400 to-orange-400',
  },
  {
    id: 3,
    title: 'VIP ลด 50 บาท',
    code: 'VIP50',
    discount: '฿50',
    desc: 'เฉพาะสมาชิก',
    expire: '31 ธ.ค. 2026',
    color: 'from-purple-400 to-pink-400',
  },
];

export default function PromotionsPage() {
  const [copied, setCopied] = useState('');

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F2]">

      <Navbar />

      {/* HEADER */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-black text-[#3d200a] mb-2">
          🎉 โปรโมชั่น
        </h1>
        <p className="text-gray-500">
          เลือกโค้ดส่วนลดแล้วไปใช้ได้เลย
        </p>
      </div>

      {/* GRID */}
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6 pb-16">

        {PROMOS.map(promo => (
          <div
            key={promo.id}
            className="
              bg-white rounded-3xl shadow-lg overflow-hidden
              hover:shadow-2xl transition group
            "
          >
            {/* TOP COLOR */}
            <div className={`h-32 bg-gradient-to-r ${promo.color} flex items-center justify-center`}>
              <span className="text-white text-3xl font-black">
                {promo.discount}
              </span>
            </div>

            {/* CONTENT */}
            <div className="p-6 text-center">

              <h3 className="text-lg font-bold text-[#3d200a]">
                {promo.title}
              </h3>

              <p className="text-gray-500 text-sm mt-1">
                {promo.desc}
              </p>

              {/* CODE */}
              <div className="
                mt-4 flex items-center justify-between 
                bg-gray-100 px-4 py-2 rounded-xl
              ">
                <span className="font-bold text-orange-600">
                  {promo.code}
                </span>

                <button
                  onClick={() => copyCode(promo.code)}
                  className="
                    text-sm bg-orange-500 text-white px-3 py-1 rounded-lg
                    hover:bg-orange-600
                  "
                >
                  {copied === promo.code ? 'คัดลอกแล้ว' : 'คัดลอก'}
                </button>
              </div>

              {/* EXPIRE */}
              <p className="text-xs text-gray-400 mt-3">
                หมดอายุ: {promo.expire}
              </p>

              {/* USE BUTTON */}
              <button
                onClick={() => copyCode(promo.code)}
                className="
                  w-full mt-5 
                  bg-[#3d200a] text-white 
                  py-3 rounded-xl font-bold
                  hover:bg-black transition
                "
              >
                ใช้โค้ดนี้
              </button>

            </div>
          </div>
        ))}

      </div>

    </div>
  );
}