import {
  createOrder as createOrderRepo,
  getOrders,
  getOrderById,
} from '../repositories/order.repo'

/**
 * ✅ CREATE ORDER
 * ทำหน้าที่คำนวณราคาสรุป และเตรียมข้อมูลส่งต่อให้ Repository
 */
export async function createOrder(data: any) {
  // 1. คำนวณราคารวม (Total) จากรายการสินค้าที่ส่งมา
  // ป้องกันการส่งราคาปลอมมาจากหน้าบ้าน
  const calculatedTotal = data.items.reduce(
    (sum: number, item: any) => sum + (item.price * item.qty),
    0
  )

  // 2. ส่ง data ไปให้ repo 
  // เราส่ง items เป็น Array ปกติ เพราะใน order.repo.ts ของคุณมีการใช้ .map() เตรียมไว้แล้ว
  return createOrderRepo({
    total: calculatedTotal,
    items: data.items 
  })
}

/**
 * ✅ GET ALL ORDERS
 * ดึงออเดอร์ทั้งหมดพร้อมรายการอาหาร
 */
export async function getAllOrders() {
  return getOrders()
}

/**
 * ✅ GET ORDER BY ID
 * ดึงข้อมูลออเดอร์รายตัว
 */
export async function getOrder(id: number) {
  return getOrderById(id)
}