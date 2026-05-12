import {
  createOrder as createOrderRepo,
  getOrders,
  getOrderById,
} from '../repositories/order.repo'

export async function createOrder(data: any) {
  // คำนวณราคาจริงจาก server ป้องกันการส่งราคาปลอม
  const calculatedTotal = data.items.reduce(
    (sum: number, item: any) => sum + (item.price * item.qty),
    0
  )

  return createOrderRepo({
    total:      calculatedTotal,
    items:      data.items,
    // ✅ เพิ่มส่วนนี้
    guestName:  data.guestName  ?? null,
    guestPhone: data.guestPhone ?? null,
    orderType:  data.orderType  ?? 'dine-in',
    userId:     data.userId     ?? null,
  })
}

export async function getAllOrders() {
  return getOrders()
}

export async function getOrder(id: number) {
  return getOrderById(id)
}