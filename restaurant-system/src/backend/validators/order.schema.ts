import { z } from 'zod'

export const createOrderSchema = z.object({
  // ✅ Guest fields
  guestName:  z.string().min(1, "กรุณาใส่ชื่อ").optional(),
  guestPhone: z.string().min(9, "เบอร์โทรไม่ถูกต้อง").optional(),
  orderType:  z.enum(['dine-in', 'takeaway']).default('dine-in'),
  userId:     z.number().optional(),

  items: z.array(
    z.object({
      name:  z.string().min(1, "ชื่ออาหารห้ามว่าง"),
      price: z.number().positive("ราคาต้องมากกว่า 0"),
      qty:   z.number().int().positive("จำนวนต้องเป็นเลขจำนวนเต็ม"),
    })
  ).min(1, "ต้องมีรายการอาหารอย่างน้อย 1 อย่าง"),

  total: z.number().optional()
})