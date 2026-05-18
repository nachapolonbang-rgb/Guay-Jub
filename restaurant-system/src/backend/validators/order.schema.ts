import { z } from 'zod'

export const createOrderSchema = z.object({
  guestName:      z.string().optional(),
  guestPhone:     z.string().optional(),
  orderType:      z.enum(['dine-in', 'takeaway']).default('dine-in'),
  userId:         z.number().optional(),
  paymentMethod:  z.enum(['cash', 'qr']).optional(),
  paymentStatus:  z.enum(['pending', 'paid', 'cancelled']).default('pending'),

  items: z.array(
    z.object({
      name:  z.string().min(1, "ชื่ออาหารห้ามว่าง"),
      price: z.number().positive("ราคาต้องมากกว่า 0"),
      qty:   z.number().int().positive("จำนวนต้องเป็นเลขจำนวนเต็ม"),
      removedIngredients: z.string().default('[]'),  // เพิ่ม
      toppings:           z.string().default('[]'),  // เพิ่ม
      note:               z.string().default(''),    // เพิ่ม
    })
  ).min(1, "ต้องมีรายการอาหารอย่างน้อย 1 อย่าง"),

  total: z.number().optional()
})
