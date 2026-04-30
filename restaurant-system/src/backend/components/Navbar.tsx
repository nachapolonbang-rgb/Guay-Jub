'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const pathname = usePathname();

  const { cart } = useCart();

  // ✅ ป้องกัน crash + type safe
  const totalQty = cart?.reduce((sum, item: any) => sum + (item.qty || 0), 0) || 0;

  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 🔹 โหลด user
  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => setUser(data?.user || null))
      .catch(() => setUser(null));
  }, []);

  // 🔹 ปิด dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🔹 logout
  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    location.reload();
  };

  // 🔹 active menu
  const activeStyle = (path: string) =>
    pathname === path
      ? 'border-b-2 border-orange-500 text-orange-600 pb-1'
      : 'hover:text-orange-600 transition-colors uppercase tracking-wider';

  return (
    <nav className="flex justify-between items-center px-10 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">

      {/* LOGO */}
      <Link href="/" className="flex items-center gap-2 group">
        <img 
          src="/images/logo.png" 
          alt="logo" 
          className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" 
        />
        <span className="font-bold text-[#3d200a] text-lg">
          กับข้าวแม่
        </span>
      </Link>

      {/* MENU */}
      <div className="flex gap-6 items-center font-bold text-[#5a2d0c] text-sm">
        
        <Link href="/" className={activeStyle('/')}>HOME</Link>
        <Link href="/promotions" className={activeStyle('/promotions')}>PROMOTIONS</Link>
        <Link href="/menu" className={activeStyle('/menu')}>MENU</Link>

        {/* NOT LOGIN */}
        {!user && (
          <Link 
            href="/register"
            className="bg-orange-500 text-white px-5 py-2 rounded-full shadow-md hover:bg-orange-600 transition"
          >
            สมัครสมาชิก
          </Link>
        )}

        {/* LOGIN */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200 transition"
            >
              👤 {user.name || user.email}
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg overflow-hidden animate-fadeIn">

                <div className="px-4 py-2 text-xs text-gray-500 border-b">
                  {user.email}
                </div>

                <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100 text-sm">
                  โปรไฟล์
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500 text-sm"
                >
                  ออกจากระบบ
                </button>

              </div>
            )}
          </div>
        )}

        {/* CART */}
        <Link href="/cart">
          <div className="flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full shadow hover:bg-orange-200 transition relative">
            
            🛒
            
            {/* badge */}
            <span className="font-bold text-orange-600">
              {totalQty}
            </span>

          </div>
        </Link>

      </div>
    </nav>
  );
}