import { z } from 'zod'

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      name: z.string().min(1, "ชื่ออาหารห้ามว่าง"),
      price: z.number().positive("ราคาต้องมากกว่า 0"),
      qty: z.number().int().positive("จำนวนต้องเป็นเลขจำนวนเต็ม"),
    })
  ).min(1, "ต้องมีรายการอาหารอย่างน้อย 1 อย่าง"),
  // เพิ่ม total เข้ามา (จะรับจากหน้าบ้านหรือคำนวณใหม่ก็ได้)
  total: z.number().optional() 
})