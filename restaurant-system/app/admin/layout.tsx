import Link from 'next/link';

export default function AdminLayout({ children }: any) {
  return (
    <div style={{ display: 'flex' }}>
      <aside style={{ width: 200, padding: 20, borderRight: '1px solid #ccc' }}>
        <h3>Admin</h3>
        <ul>
          <li><Link href="/admin">Dashboard</Link></li>
          <li><Link href="/admin/orders">Orders</Link></li>
          <li><Link href="/admin/menu">Menu</Link></li>
        </ul>
      </aside>

      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}