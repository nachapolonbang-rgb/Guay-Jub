'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();

  const [cart] = useState<number[]>([]);
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);

  // 🔹 โหลด user จาก backend
  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => setUser(data.user)); // ต้องมี { user: ... }
  }, []);

  // 🔹 logout
  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    location.reload();
  };

  // 🔹 active menu style
  const activeStyle = (path: string) =>
    pathname === path
      ? 'border-b-2 border-orange-500 text-orange-600 pb-1'
      : 'hover:text-orange-600 transition-colors uppercase tracking-wider';

  return (
    <nav className="flex justify-between items-center px-10 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50">

      {/* LOGO */}
      <Link href="/" className="flex items-center gap-2 group">
        <img 
          src="/images/logo.png" 
          alt="logo" 
          className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" 
        />
        <span className="font-bold text-[#3d200a] text-lg tracking-tight">
          กับข้าวนม
        </span>
      </Link>

      {/* MENU */}
      <div className="flex gap-8 text-[13px] items-center font-bold text-[#5a2d0c]">
        
        <Link href="/" className={activeStyle('/')}>
          Home
        </Link>

        <Link href="/promotions" className={activeStyle('/promotions')}>
          Promotions
        </Link>

        <Link href="/menu" className={activeStyle('/menu')}>
          Menu
        </Link>

        {/* ✅ ถ้ายังไม่ login → สมัครสมาชิก */}
        {!user && (
          <Link 
            href="/register"
            className="bg-[#e3523d] text-white px-6 py-2 rounded-full shadow-lg hover:bg-[#c94432] transition-all transform hover:scale-105"
          >
            สมัครสมาชิก
          </Link>
        )}

        {/* ✅ ถ้า login แล้ว */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200 transition"
            >
              👤 {user.name || user.email}
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg overflow-hidden">

                <div className="px-4 py-2 text-sm text-gray-500 border-b">
                  {user.email}
                </div>

                <Link
                  href="/profile"
                  className="block px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500 text-sm"
                >
                  Logout
                </button>

              </div>
            )}
          </div>
        )}

        {/* CART */}
        <Link href="/cart">
          <div className="flex items-center gap-2 cursor-pointer bg-white/80 px-4 py-1.5 rounded-full shadow-sm border border-gray-100 hover:shadow-md transition">
            <span>🛒</span>
            <span className="font-bold text-orange-600">{cart.length}</span>
          </div>
        </Link>

      </div>
    </nav>
  );
}