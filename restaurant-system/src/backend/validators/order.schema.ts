import { z } from 'zod'

export const createOrderSchema = z.object({
  items: z.array(z.string()).min(1, 'Order must have at least 1 item'),

  total: z.number().positive('Total must be positive'),

  promotionCode: z.string().optional(),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>