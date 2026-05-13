'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Clock, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import Navbar from '@/src/backend/components/Navbar';

type OrderStatus = 'new' | 'cooking' | 'ready' | 'done';
type PaymentStatus = 'pending' | 'paid' | 'cancelled';

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  guestName?: string;
  guestPhone?: string;
  orderType: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
}

const STATUS_META: Record<OrderStatus, { label: string; icon: string; color: string }> = {
  new:     { label: 'ออร์เดอร์ใหม่',   icon: '📝', color: 'text-blue-600' },
  cooking: { label: 'กำลังปรุง',    icon: '👨‍🍳', color: 'text-amber-600' },
  ready:   { label: 'พร้อมรับ',    icon: '✅', color: 'text-emerald-600' },
  done:    { label: 'รับแล้ว',     icon: '🎉', color: 'text-emerald-700' },
};

const PAYMENT_META: Record<PaymentStatus, { label: string; icon: string; color: string; bg: string }> = {
  pending:   { label: 'รอชำระเงิน', icon: '⏳', color: 'text-amber-600', bg: 'bg-amber-50' },
  paid:      { label: 'ชำระแล้ว',  icon: '✅', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  cancelled: { label: 'ยกเลิก',    icon: '❌', color: 'text-red-600', bg: 'bg-red-50' },
};

export default function OrderTrackingPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      setError('ไม่พบหมายเลขออร์เดอร์');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) throw new Error('ไม่พบออร์เดอร์');
        setOrder(await res.json());
        setError('');
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    
    // Poll every 3 seconds for updates
    const interval = setInterval(fetchOrder, 3000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-5 py-12 text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full" />
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลออร์เดอร์...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-5 py-12">
          <div className="bg-white rounded-2xl border-2 border-red-200 p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">ไม่พบออร์เดอร์</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt);
  const timeString = orderDate.toLocaleString('th-TH', { 
    hour: '2-digit', 
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ติดตามออร์เดอร์</h1>
          <p className="text-gray-500 mt-2">เลขอ้างอิง #{String(order.id).padStart(3, '0')}</p>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          
          {/* Payment Status Banner */}
          <div className={`${PAYMENT_META[order.paymentStatus].bg} border-b-2 px-6 py-4`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{PAYMENT_META[order.paymentStatus].icon}</span>
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">สถานะการชำระเงิน</p>
                <p className={`text-lg font-bold ${PAYMENT_META[order.paymentStatus].color}`}>
                  {PAYMENT_META[order.paymentStatus].label}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">รวมทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">฿{order.total.toLocaleString()}</p>
              </div>
            </div>
            {order.paymentMethod && (
              <p className="text-xs text-gray-600 mt-2">
                วิธีชำระเงิน: {order.paymentMethod === 'cash' ? '💵 เงินสด' : '📱 QR Code'}
              </p>
            )}
          </div>

          {/* Order Status Timeline */}
          <div className="px-6 py-8">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-6 font-bold">สถานะการทำอาหาร</p>
            
            <div className="space-y-4">
              {(['new', 'cooking', 'ready', 'done'] as OrderStatus[]).map((status, idx, arr) => {
                const isActive = arr.indexOf(order.status) >= idx;
                const isDone = order.status === 'done' || arr.indexOf(order.status) > idx;
                
                return (
                  <div key={status} className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                      ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                      {isDone ? '✓' : (idx + 1)}
                    </div>
                    <div className="flex-1 pt-1">
                      <h4 className={`font-bold ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                        {STATUS_META[status].label}
                      </h4>
                      {isActive && status !== 'done' && (
                        <p className="text-xs text-emerald-600 mt-1">กำลังดำเนินการ...</p>
                      )}
                      {status === 'done' && order.status === 'done' && (
                        <p className="text-xs text-emerald-600 mt-1">✓ เสร็จสิ้น</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 px-6 py-6 border-t">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-4 font-bold">รายละเอียดออร์เดอร์</p>
            
            <div className="space-y-2 mb-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.name} <span className="text-gray-400">×{item.qty}</span>
                  </span>
                  <span className="font-bold text-gray-900">฿{(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">ประเภท:</span>
                <span className="font-bold text-gray-900">
                  {order.orderType === 'dine-in' ? '🍽 นั่งกินที่ร้าน' : '🥡 Take Away'}
                </span>
              </div>
              {order.guestName && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">ชื่อ:</span>
                  <span className="font-bold text-gray-900">{order.guestName}</span>
                </div>
              )}
              {order.guestPhone && (
                <div className="flex justify-between">
                  <span className="text-gray-600">เบอร์โทร:</span>
                  <span className="font-bold text-gray-900">{order.guestPhone}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-4">
              สั่งเมื่อ: {timeString}
            </p>
          </div>
        </div>

        {/* Status Messages */}
        {order.paymentStatus === 'pending' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-4">
            <p className="text-sm text-amber-800">
              <span className="font-bold">⚠️ รอการชำระเงิน</span><br/>
              กรุณากลับมาชำระเงินให้เสร็จสิ้น
            </p>
          </div>
        )}

        {order.paymentStatus === 'paid' && order.status === 'done' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-6 py-4">
            <p className="text-sm text-emerald-800">
              <span className="font-bold">🎉 ออร์เดอร์เสร็จสิ้น!</span><br/>
              ออร์เดอร์ของคุณพร้อมแล้ว กรุณามารับที่เคาน์เตอร์
            </p>
          </div>
        )}

        {order.paymentStatus === 'paid' && ['new', 'cooking', 'ready'].includes(order.status) && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-4">
            <p className="text-sm text-blue-800">
              <span className="font-bold">👨‍🍳 กำลังเตรียมออร์เดอร์</span><br/>
              ออร์เดอร์ของคุณกำลังได้รับการปรุงอาหาร โปรดรอสักครู่
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
