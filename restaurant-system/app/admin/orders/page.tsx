'use client';

import { useState } from 'react';

type OrderItem = {
  name: string;
  qty: number;
};

type Order = {
  id: number;
  customer: string;
  items: OrderItem[];
  status: 'PENDING' | 'COOKING' | 'DONE';
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 101,
      customer: 'Nat',
      status: 'PENDING',
      items: [
        { name: 'ข้าวขาหมู', qty: 2 },
        { name: 'น้ำเปล่า', qty: 1 },
      ],
    },
    {
      id: 102,
      customer: 'John',
      status: 'COOKING',
      items: [
        { name: 'ก๋วยจั๊บ', qty: 1 },
      ],
    },
  ]);

  // 🔄 เปลี่ยนสถานะ
  const nextStatus = (status: Order['status']) => {
    if (status === 'PENDING') return 'COOKING';
    if (status === 'COOKING') return 'DONE';
    return 'DONE';
  };

  const updateStatus = (id: number) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === id
          ? { ...order, status: nextStatus(order.status) }
          : order
      )
    );
  };

  const statusColor = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'COOKING':
        return 'bg-blue-100 text-blue-700';
      case 'DONE':
        return 'bg-green-100 text-green-700';
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-[#3D1A00]">
        📦 จัดการออเดอร์
      </h1>

      <div className="space-y-4">
        {orders.map(order => (
          <div
            key={order.id}
            className="bg-white p-5 rounded-2xl border border-[#F3DDD0] shadow-sm"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="font-bold text-[#3D1A00]">
                  Order #{order.id}
                </p>
                <p className="text-sm text-[#9A6651]">
                  ลูกค้า: {order.customer}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor(order.status)}`}
              >
                {order.status}
              </span>
            </div>

            {/* ITEMS */}
            <div className="mb-4">
              {order.items.map((item, i) => (
                <p key={i} className="text-sm text-[#3D1A00]">
                  • {item.name} x{item.qty}
                </p>
              ))}
            </div>

            {/* ACTION */}
            <button
              onClick={() => updateStatus(order.id)}
              disabled={order.status === 'DONE'}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all
                ${order.status === 'DONE'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#E8530A] text-white hover:scale-105 active:scale-95'
                }`}
            >
              {order.status === 'PENDING' && 'เริ่มทำ'}
              {order.status === 'COOKING' && 'ทำเสร็จ'}
              {order.status === 'DONE' && 'เสร็จแล้ว'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}