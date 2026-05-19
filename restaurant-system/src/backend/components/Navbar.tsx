'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const pathname = usePathname();

  const { cart } = useCart();

  const totalQty = cart?.reduce((sum, item: any) => sum + (item.qty || 0), 0) || 0;

  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => setUser(data?.user || null))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    location.reload();
  };

  const activeStyle = (path: string) =>
    pathname === path
      ? 'border-b-2 border-orange-500 text-orange-600 pb-1'
      : 'hover:text-orange-600 transition-colors uppercase tracking-wider';

  return (
    <nav className="flex justify-between items-center px-10 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">

      {/* LOGO */}
      <Link href="/" className="flex items-center gap-3 group">
        <style>{`
          .logo-img {
            transition: transform 0.4s cubic-bezier(.34,1.56,.64,1), filter 0.3s;
            filter: drop-shadow(0 2px 8px rgba(224,90,0,0));
          }
          .group:hover .logo-img {
            transform: scale(1.12) rotate(-6deg);
            filter: drop-shadow(0 4px 12px rgba(224,90,0,0.35));
          }
          .logo-title {
            transition: color 0.2s;
          }
          .logo-title::after {
            content: '';
            display: block;
            height: 2px;
            width: 0;
            background: linear-gradient(90deg, #e3523d, transparent);
            border-radius: 999px;
            transition: width 0.35s ease;
          }
          .group:hover .logo-title::after { width: 100%; }
          .group:hover .logo-title { color: #e3523d; }
        `}</style>
        <img
          src="/images/logo.png"
          alt="logo"
          className="logo-img"
          style={{ width: 80, height: 80, objectFit: 'contain' }}
        />
        <div>
          <div className="logo-title font-bold text-[#3d200a] text-xl leading-tight">ยายทอง</div>
          <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#b08060', fontWeight: 600 }}>homemade</div>
        </div>
      </Link>

      {/* MENU — ไม่แตะเลย */}
      <div className="flex gap-6 items-center font-bold text-[#5a2d0c] text-sm">

        <Link href="/" className={activeStyle('/')}>HOME</Link>
        <Link href="/promotions" className={activeStyle('/promotions')}>PROMOTIONS</Link>
        <Link href="/menu" className={activeStyle('/menu')}>MENU</Link>

        {!user && (
          <Link
            href="/register"
            className="bg-orange-500 text-white px-5 py-2 rounded-full shadow-md hover:bg-orange-600 transition"
          >
            สมัครสมาชิก
          </Link>
        )}

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
                <div className="px-4 py-2 text-xs text-gray-500 border-b">{user.email}</div>
                <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100 text-sm">โปรไฟล์</Link>
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

        <Link href="/cart">
          <div className="flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full shadow hover:bg-orange-200 transition relative">
            🛒
            <span className="font-bold text-orange-600">{totalQty}</span>
          </div>
        </Link>

      </div>
    </nav>
  );
}