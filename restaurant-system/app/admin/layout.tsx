'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LogOut,
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  Gift,
  BarChart3,
  Settings,
  Package,
  Menu,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { label: 'Orders', icon: ClipboardList, href: '/admin/orders' },
  { label: 'จัดการเมนู', icon: UtensilsCrossed, href: '/admin/menu' },
  { label: 'Inventory', icon: Package, href: '/admin/inventory' },
  { label: 'Promotions', icon: Gift, href: '/admin/promotions' },
  { label: 'Reports', icon: BarChart3, href: '/admin/reports' },
  { label: 'Settings', icon: Settings, href: '/admin/settings' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // ✅ Logout function
  const handleLogout = async () => {
    await fetch('/api/logout', {
      method: 'POST',
    });

    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-zinc-100">
      {/* Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[240px] flex-col bg-zinc-950 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10">
          <h1 className="text-white font-bold text-xl">กับข้าวแม่</h1>
          <p className="text-zinc-400 text-xs">Restaurant Admin</p>
        </div>

        {/* Nav */}
        <div className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl transition ${
                  active
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                    : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-zinc-400 hover:text-white"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-[240px]">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between p-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-white shadow"
          >
            <Menu size={20} />
          </button>

          <h1 className="font-bold">Admin</h1>
        </div>

        {children}
      </main>
    </div>
  );
}